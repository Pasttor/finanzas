import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function processFinancialMessage(text: string, imageBuffer?: Buffer, mimeType?: string) {
  // ✅ Modelo correcto según tu código
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Te sugiero usar 'gemini-1.5-flash' o 'gemini-2.0-flash' si tienes acceso, son mejores leyendo tickets. Si no, deja 'gemini-1.5-pro' o el que tenías.

  // 1. OBTENER LA FECHA DE HOY (Para que la IA tenga referencia)
  const today = new Date().toISOString().split('T')[0];

  const prompt = `
    Actúa como un contador experto.
    HOY ES: ${today}.

    Analiza este input (Texto: "${text}") y la imagen adjunta (si existe).

    REGLAS DE FECHA (Prioridad Absoluta):
    1. 📸 TICKET/IMAGEN: Busca la fecha impresa en el ticket. Si es visible, ÚSALA. Esta es la prioridad #1.
    2. ✍️ TEXTO: Si el usuario dice "ayer", "el viernes pasado" o una fecha explícita, calcúlala basándote en que hoy es ${today}.
    3. 📅 FALLBACK: Solo si NO hay fecha en la imagen ni en el texto, usa la fecha de hoy: ${today}.

    Extrae en JSON estricto:
    - amount: (número) Total.
    - currency: (texto) MXN, USD.
    - category: (texto) Categoría del gasto (Comida, Transporte, Servicios, etc).
    - description: (texto) Nombre del comercio o breve descripción.
    - type: (texto) 'gasto', 'ingreso'.
    - date: (texto) YYYY-MM-DD (La fecha detectada según las reglas arriba).

    Responde SOLO JSON. Sin markdown.
  `;

  try {
    const parts: any[] = [{ text: prompt }];

    if (imageBuffer && mimeType) {
      console.log(`📸 Enviando imagen a Gemini (${mimeType}, tamaño: ${imageBuffer.length} bytes)`);
      parts.push({
        inlineData: {
          data: imageBuffer.toString("base64"),
          mimeType: mimeType,
        },
      });
    }

    const result = await model.generateContent(parts);
    const response = await result.response;
    const textResponse = response.text();
    
    // Limpieza
    const cleanedText = textResponse.replace(/```json|```/g, '').trim();
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("❌ Error IA:", error);
    return null;
  }
}