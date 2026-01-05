import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function processFinancialMessage(text: string, imageBuffer?: Buffer, mimeType?: string) {
  // ✅ Usamos el modelo exacto que tienes en tu dashboard
  const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

  const prompt = `
    Actúa como un contador experto.
    Analiza este input (Texto: "${text}") y la imagen adjunta (si existe).
    Extrae en JSON estricto:
    - amount: (número) Total del ticket.
    - currency: (texto) MXN, USD.
    - category: (texto) Categoría del gasto.
    - description: (texto) Descripción breve.
    - type: (texto) 'gasto', 'ingreso', 'inversion', 'suscripcion'.
    - date: (texto) YYYY-MM-DD.

    Si no puedes leer la imagen claramente, usa el texto.
    Responde SOLO JSON.
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