const { GoogleGenAI } = require('@google/genai');
const dotenv = require('dotenv');

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function getChatResponse(message, history = []) {
    try {
        // We will build a conversation format that Gemini 2.5 Flash understands
        const systemInstruction = `
You are MedSENSE AI, an intelligent and empathetic medical assistant chatbot.
You help users understand medical terminology, provide general health advice, and answer questions about medical reports.
ALWAYS include a disclaimer that you are an AI and they should consult a real doctor for medical advice.
Be concise, friendly, and professional.
`;

        const contents = [];
        
        // Add history
        for (const msg of history) {
            contents.push({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.content }]
            });
        }
        
        // Add current message
        contents.push({
            role: 'user',
            parts: [{ text: message }]
        });

        // Generate response
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            systemInstruction: systemInstruction,
            contents: contents
        });

        return response.text;
    } catch (error) {
        console.error("Gemini Chat API Error:", error);
        throw new Error("Failed to get chat response: " + error.message);
    }
}

module.exports = { getChatResponse };
