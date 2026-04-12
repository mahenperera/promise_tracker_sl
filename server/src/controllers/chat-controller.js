import { GoogleGenerativeAI } from "@google/generative-ai";
import apiResponse from "../utils/api-response.js";

const SYSTEM_PROMPT = `You are a helpful assistant for the Promise Tracker Sri Lanka platform. 
Your primary goal is to help citizens understand politicians' promises, track their progress, handle general political queries, and clarify any confusion objectively. Keep responses concise, helpful, and polite.`;

export const handleChat = async (req, res, next) => {
    try {
        console.log("Current GEMINI_API_KEY:", process.env.GEMINI_API_KEY);
        console.log("Keys in process.env:", Object.keys(process.env).filter(k => k.includes("GEMINI")));

        const { message, history } = req.body;

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json(apiResponse.error("Server is missing the GEMINI_API_KEY. Please set in .env."));
        }

        const cleanKey = process.env.GEMINI_API_KEY.replace(/['"]/g, '').trim();

        if (!message) {
            return res.status(400).json(apiResponse.error("Message is required."));
        }

        const genAI = new GoogleGenerativeAI(cleanKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            systemInstruction: SYSTEM_PROMPT
        });

        const chat = model.startChat({
            history: history || [],
        });

        const result = await chat.sendMessage(message);
        const responseText = result.response.text();

        return res.json(apiResponse.success("Chat interaction successful", { response: responseText }));
    } catch (error) {
        next(error);
    }
};
