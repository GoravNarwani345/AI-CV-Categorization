const { GoogleGenerativeAI } = require("@google/generative-ai");
const pdf = require('pdf-parse');
const fs = require('fs');
const path = require('path');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const analyzeCV = async (filePath) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.error('❌ GEMINI_API_KEY is missing from .env');
      throw new Error('AI Service not configured (API Key missing)');
    }

    console.log('📄 Starting AI analysis for:', path.basename(filePath));
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    const text = data.text;
    console.log(`📄 Extracted ${text.length} characters of text from PDF`);

    if (text.trim().length === 0) {
      console.warn('⚠️ PDF text extraction returned empty string. Possibly an image-based PDF.');
      // We'll still try to send it to Gemini, but warn about quality
    }

    // Use gemini-1.5-flash which is the recommended model
    const modelName = "gemini-1.5-flash";
    const model = genAI.getGenerativeModel({ model: modelName });

    const prompt = `
        You are an elite HR Tech AI specialized in CV parsing and candidate profiling. 
        Analyze the following resume text and extract the candidate's professional information with high precision.
        
        CRITICAL RULES:
        1. Return ONLY a valid, minified JSON object.
        2. No markdown blocks, no intro/outro text.
        3. If information is missing, use null or an empty array as appropriate.
        4. Standardize dates to "Month Year" or "Year" format.
        5. Location should be "City, State/Country".
        
        STRUCTURE:
        {
          "basicInfo": {
            "phone": "string",
            "location": "string",
            "bio": "A compelling 2-3 sentence professional summary based on their background"
          },
          "education": [
            { "degree": "string", "institution": "string", "year": "string", "grade": "string" }
          ],
          "experience": [
            { "title": "string", "company": "string", "duration": "string", "description": "sentence describing impact" }
          ],
          "skills": [
            { "name": "string", "level": "Beginner/Intermediate/Advanced/Expert" }
          ]
        }

        Resume Text:
        ---
        ${text}
        ---
        `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let jsonString = response.text();
    console.log('🤖 Received response from Gemini API');

    // Clean markdown code blocks if present
    jsonString = jsonString.replace(/```json/g, "").replace(/```/g, "").trim();

    try {
      return JSON.parse(jsonString);
    } catch (parseError) {
      console.error('❌ Failed to parse Gemini response as JSON:', jsonString);
      // Fallback: search for first { and last }
      const start = jsonString.indexOf('{');
      const end = jsonString.lastIndexOf('}');
      if (start !== -1 && end !== -1) {
        return JSON.parse(jsonString.substring(start, end + 1));
      }
      throw parseError;
    }
  } catch (error) {
    if (error.status === 404) {
      console.error('❌ Gemini 404 Error: The model you requested was not found.');
      console.log('💡 TIP: On the Free Plan, ensure your API key has "Gemini API" enabled in Google AI Studio.');
    } else if (error.status === 429) {
      console.error('❌ Gemini 429 Error: Quota Exceeded (Too Many Requests).');
      console.log('💡 TIP: You are using the Free Tier. Please wait a few minutes or try again tomorrow.');
    }
    console.error('AI CV Parsing Error:', error);
    throw new Error(error.status === 429 ? 'AI Quota exceeded. Please try again in a few minutes.' : 'Failed to parse CV with AI');
  }
};

module.exports = { analyzeCV };
