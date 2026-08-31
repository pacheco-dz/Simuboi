import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';

// Inicializa o cliente do Gemini SDK
let ai = null;
try {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    ai = new GoogleGenAI({ apiKey: apiKey });
  }
} catch (error) {
  console.error("Erro ao inicializar o cliente do Gemini:", error);
}

export default async function handler(req, res) {
  // Trata CORS pré-flight se necessário, embora no Vercel geralmente a SPA esteja no mesmo domínio
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Método ${req.method} não suportado. Use POST.` });
  }

  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'O campo "message" é obrigatório no corpo da requisição.' });
    }

    if (!ai) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({
          error: 'A variável de ambiente GEMINI_API_KEY não está configurada no servidor Vercel.'
        });
      }
      ai = new GoogleGenAI({ apiKey: apiKey });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: message,
    });

    // CORS Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).json({ text: response.text });

  } catch (error) {
    console.error('Erro ao processar chamada ao Gemini no Vercel:', error);
    return res.status(500).json({
      error: 'Ocorreu um erro ao processar sua solicitação no servidor.',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}
