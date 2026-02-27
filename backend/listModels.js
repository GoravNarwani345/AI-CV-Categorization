const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

async function listModels() {
    try {
        if (!process.env.GEMINI_API_KEY) {
            console.error("❌ GEMINI_API_KEY missing in .env");
            return;
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

        console.log("🔍 Fetching available models for your API key...");

        // Note: listModels is currently available on the genAI instance
        // depending on the version of the SDK.
        // We'll try the common fetch approach if it's missing or use the client.

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
        const data = await response.json();

        if (data.models) {
            console.log("✅ Available Models:");
            data.models.forEach(m => {
                console.log(`- ${m.name} (Methods: ${m.supportedGenerationMethods.join(', ')})`);
            });
        } else {
            console.log("❌ No models found or error in response:", data);
        }
    } catch (error) {
        console.error("❌ Error listing models:", error.message);
    }
}

listModels();
