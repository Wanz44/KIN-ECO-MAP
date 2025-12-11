
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";

const SYSTEM_INSTRUCTION = `
You are the AI Assistant for KIN ECO-MAP, a waste management and ecology platform in Kinshasa, DRC.
Your name is "Biso Peto AI" (which means "Us Clean" in Lingala).
You are friendly, encouraging, and knowledgeable about recycling, composting, waste reduction, and local environmental issues in Kinshasa.
Keep your answers concise (under 100 words), practical, and easy to understand.
You can speak French (primary) and are familiar with common Lingala terms related to daily life.
If asked about app features, guide them to the Dashboard or Map.
`;

let chatSession: Chat | null = null;
let aiClient: GoogleGenAI | null = null;

const getAiClient = () => {
    if (!aiClient) {
        aiClient = new GoogleGenAI({ apiKey: process.env.API_KEY });
    }
    return aiClient;
};

export const initializeChat = (): Chat => {
    if (chatSession) return chatSession;
    const ai = getAiClient();
    chatSession = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: SYSTEM_INSTRUCTION,
        },
    });
    return chatSession;
};

export const sendMessageToGemini = async (message: string): Promise<string> => {
    try {
        const chat = initializeChat();
        const response = await chat.sendMessage({ message });
        return response.text || "Désolé, je n'ai pas pu traiter votre demande pour le moment.";
    } catch (error) {
        console.error("Gemini API Error:", error);
        return "Une erreur est survenue lors de la communication avec l'assistant. Veuillez réessayer.";
    }
};

// Nouvelle fonction pour l'analyse d'image (Marketplace)
export const analyzeWasteItem = async (base64Image: string): Promise<{
    title: string;
    category: 'electronics' | 'metal' | 'plastic' | 'other';
    weight: number;
    price: number;
    description: string;
}> => {
    try {
        const ai = getAiClient();
        
        // Nettoyage de la chaîne base64 si elle contient l'en-tête data:image/...
        const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");

        const prompt = `
            Analyse cette image d'un objet (déchet ou article usagé) à Kinshasa.
            Identifie l'objet (Téléphone, Laptop, TV, Câbles, Métal, Plastique, etc.).
            Estime son poids en Kg (sois réaliste).
            Estime sa valeur de revente en Francs Congolais (FC) pour le recyclage ou la pièce détachée (sois réaliste pour le marché de Kinshasa).
            
            Réponds UNIQUEMENT au format JSON strict suivant, sans markdown :
            {
                "title": "Nom court de l'objet",
                "category": "electronics" | "metal" | "plastic" | "other",
                "weight": 0.5,
                "price": 5000,
                "description": "Courte description de l'état apparent"
            }
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                    { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } },
                    { text: prompt }
                ]
            }
        });

        const textResponse = response.text || "{}";
        // Nettoyage basique pour extraire le JSON si le modèle ajoute du markdown ```json ... ```
        const jsonString = textResponse.replace(/```json|```/g, '').trim();
        
        return JSON.parse(jsonString);

    } catch (error) {
        console.error("Gemini Vision Error:", error);
        // Fallback en cas d'erreur (ou si pas de clé API valide dans l'environnement de démo)
        return {
            title: "Objet détecté",
            category: "other",
            weight: 1,
            price: 0,
            description: "Impossible d'analyser l'image automatiquement. Veuillez remplir les détails."
        };
    }
};
