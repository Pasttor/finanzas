import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';
import { processFinancialMessage } from '@/lib/gemini';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const sender = formData.get('From') as string;
    const messageText = formData.get('Body') as string || ""; // A veces viene vacío si es solo foto
    const mediaUrl = formData.get('MediaUrl0') as string;
    const mediaType = formData.get('MediaContentType0') as string;

    console.log(`📩 Mensaje de ${sender}. Texto: "${messageText}". Foto: ${mediaUrl ? 'SÍ' : 'NO'}`);

    // 1. Guardar mensaje crudo
    const { data: rawMsg, error: rawError } = await supabaseAdmin
      .from('whatsapp_messages')
      .insert({
        sender: sender,
        message_text: messageText,
        media_url: mediaUrl || null,
        is_processed: false
      })
      .select()
      .single();

    if (rawError) throw new Error('Error guardando raw message: ' + rawError.message);


// 2. Preparar la imagen (CORREGIDO CON AUTENTICACIÓN TWILIO)
    let imageBuffer: Buffer | undefined;
    
    if (mediaUrl) {
      console.log("📥 Intentando descargar imagen de Twilio...");
      
      // Creamos la credencial combinando tu SID y Token
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const authHeader = 'Basic ' + Buffer.from(accountSid + ':' + authToken).toString('base64');

      const imageResponse = await fetch(mediaUrl, {
        headers: {
          'Authorization': authHeader // 🔑 Aquí está la llave
        }
      });

      if (!imageResponse.ok) {
        console.error("❌ Error descargando imagen:", imageResponse.statusText);
        // Si falla la descarga, seguimos pero avisamos
      } else {
        const arrayBuffer = await imageResponse.arrayBuffer();
        imageBuffer = Buffer.from(arrayBuffer);
        console.log("✅ Imagen descargada correctamente. Tamaño:", imageBuffer.length);
      }
    }



    // 3. Procesar con IA (Texto + Imagen si la hay)
    const analyzedData = await processFinancialMessage(messageText, imageBuffer, mediaType);

    let replyMessage = "Guardado, pero la IA no pudo leer los datos 🤷‍♂️";

    if (analyzedData) {
      console.log("🧠 IA entendió:", analyzedData);

      // 4. Guardar transacción
      const { error: txError } = await supabaseAdmin
        .from('transactions')
        .insert({
          amount: analyzedData.amount,
          currency: analyzedData.currency,
          category: analyzedData.category,
          description: analyzedData.description,
          type: analyzedData.type,
          date: analyzedData.date || new Date().toISOString(),
          raw_message_id: rawMsg.id
        });

      if (!txError) {
        // Marcar como procesado
        await supabaseAdmin
          .from('whatsapp_messages')
          .update({ is_processed: true })
          .eq('id', rawMsg.id);

        replyMessage = `✅ Ticket procesado: ${analyzedData.type} de $${analyzedData.amount}\n📍 ${analyzedData.description}\n📅 ${analyzedData.date}`;
      }
    }

    const twiml = `
      <Response>
        <Message>${replyMessage}</Message>
      </Response>
    `;

    return new NextResponse(twiml, {
      headers: { 'Content-Type': 'text/xml' },
      status: 200,
    });

  } catch (error: any) {
    console.error('❌ Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}