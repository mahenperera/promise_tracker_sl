import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config({ path: "c:/Users/ASUS VIvobook/Documents/GitHub/promise_tracker_sl/server/.env" });

const cleanKey = process.env.GEMINI_API_KEY.replace(/['"]/g, '').trim();

const genAI = new GoogleGenerativeAI(cleanKey);

async function testMode(modelName) {
    try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Hello");
        console.log(`[${modelName}] Success:`, result.response.text());
    } catch (e) {
        console.error(`[${modelName}] Failed:`, e.message);
    }
}

async function run() {
    await testMode("gemini-1.5-flash");
    await testMode("gemini-pro");
    await testMode("gemini-1.0-pro");
    await testMode("gemini-1.5-pro-latest");
}

run();
