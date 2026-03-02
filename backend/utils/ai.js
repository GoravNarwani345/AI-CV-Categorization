const { GoogleGenerativeAI } = require("@google/generative-ai");
const pdf = require('pdf-parse');
const fs = require('fs');
const path = require('path');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const MODEL_NAME = "gemini-2.5-flash";

/**
 * Standardizes AI response by cleaning markdown and parsing JSON
 */
const parseAIResponse = (text) => {
  try {
    const jsonString = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(jsonString);
  } catch (parseError) {
    console.error('❌ Failed to parse AI response as JSON:', text);
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start !== -1 && end !== -1) {
      try {
        return JSON.parse(text.substring(start, end + 1));
      } catch (e) {
        throw parseError;
      }
    }
    throw parseError;
  }
};

const analyzeCV = async (filePath) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('AI Service not configured (API Key missing)');
    }

    console.log('📄 Starting AI analysis for:', path.basename(filePath));
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    const text = data.text;
    console.log(`📄 Extracted ${text.length} characters of text from PDF`);

    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const prompt = `
        You are an elite HR Tech AI specialized in CV parsing and candidate profiling. 
        Analyze the following resume text and extract the candidate's professional information with high precision.
        
        CRITICAL RULES:
        1. Return ONLY a valid JSON object.
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
    return parseAIResponse(response.text());
  } catch (error) {
    console.error('AI CV Parsing Error:', error);
    throw error;
  }
};

const rephraseText = async (text, context) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('AI Service not configured (API Key missing)');
    }

    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const prompt = `
        You are an elite AI Career Coach and Resume Writer.
        Your task is to take the user's resume text and professionally rewrite/rephrase it according to the requested context.
        
        Original Text:
        ---
        ${text}
        ---
        
        Request/Context:
        ${context}
        
        CRITICAL RULES:
        1. Return ONLY the newly rewritten text.
        2. Do NOT include any conversation, intro, outro, or markdown formatting blocks.
        3. Make it impactful, action-oriented, and ATS-friendly.
        `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim().replace(/^["']|["']$/g, '');
  } catch (error) {
    console.error('AI Rephrase Error:', error);
    throw error;
  }
};

const getJobMatches = async (profile, jobs) => {
  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const prompt = `
        You are an AI matching engine. Compare the candidate's profile with the list of jobs provided.
        Calculate a match percentage (0-100) based on how well the candidate's skills and experience fit each job's requirements.
        Consider semantic similarity.

        Candidate Profile:
        Skills: ${JSON.stringify(profile.skills)}
        Experience: ${JSON.stringify(profile.experience)}

        Jobs:
        ${jobs.map(j => `ID: ${j._id}, Title: ${j.title}, Requirements: ${JSON.stringify(j.skills)}, Description: ${j.description}`).join('\n\n')}

        Return ONLY a JSON array of objects: 
        [{"jobId": "...", "matchScore": 85, "reason": "short explanation"}]
        `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return parseAIResponse(response.text());
  } catch (error) {
    console.error('AI Matching Error:', error);
    throw error;
  }
};

const getRankedCandidates = async (job, candidates) => {
  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const prompt = `
        You are an AI specialized in technical recruiting. Your task is to rank the top 5 candidates from a given pool for a specific job post.
        
        Job Details:
        Title: ${job.title}
        Description: ${job.description}
        Skills Required: ${JSON.stringify(job.skills)}

        Candidate Pool:
        ${candidates.map(p => `
            Candidate ID: ${p.user._id}
            Name: ${p.user.name}
            Skills: ${JSON.stringify(p.skills)}
            Experience: ${JSON.stringify(p.experience)}
        `).join('\n')}

        Evaluate each candidate and provide:
        1. A matchScore (0-100).
        2. A brief matchReason (1 sentence) explaining their fit.
        3. Return the top 5 candidates ranked by score.

        Return ONLY a JSON array:
        [
            { "candidateId": "...", "name": "...", "matchScore": 95, "matchReason": "..." },
            ...
        ]
        `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return parseAIResponse(response.text());
  } catch (error) {
    console.error('AI Ranking Error:', error);
    throw error;
  }
};

const getAIInsights = async (job, profile) => {
  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const prompt = `
        You are a senior technical recruiter. Analyze the following candidate profile against the job description.
        
        Job Description:
        Title: ${job.title}
        Description: ${job.description}
        Skills Required: ${JSON.stringify(job.skills)}

        Candidate Profile:
        Skills: ${JSON.stringify(profile.skills)}
        Experience: ${JSON.stringify(profile.experience)}
        Education: ${JSON.stringify(profile.education)}

        Provide:
        1. A 2-sentence "Executive Summary" of why this candidate is or isn't a good fit.
        2. 3 targeted "Technical Interview Questions" that specifically address the gaps or strengths in their background relative to this job.
        3. A 3-item "Screening Checklist" of specific items the recruiter MUST verify during the first call.

        Return ONLY a clean JSON object: 
        {
            "summary": "...",
            "interviewQuestions": ["...", "...", "..."],
            "screeningChecklist": ["...", "...", "..."]
        }
        `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return parseAIResponse(response.text());
  } catch (error) {
    console.error('AI Insights Error:', error);
    throw error;
  }
};

const getOutreachDraft = async (job, candidate, profile) => {
  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const prompt = `
        You are a world-class executive recruiter. Write a professional, warm, and highly personalized LinkedIn-style outreach message.
        
        Job Details:
        Title: ${job.title}
        Company: ${job.company}
        
        Candidate Background:
        Name: ${candidate.name}
        Experience: ${JSON.stringify(profile.experience)}
        Skills: ${JSON.stringify(profile.skills)}
        
        Instructions:
        1. Mention a specific highlight from their experience that makes them a great fit.
        2. Be concise (max 150 words).
        3. Include a clear call to action.
        4. Do NOT use placeholders; use the actual data.
        5. Return ONLY the text of the message.
        `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error('AI Outreach Draft Error:', error);
    throw error;
  }
};

const getCustomizedCV = async (profile, jobInfo, conversation = []) => {
  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const prompt = `
        You are an elite AI Career Coach specializing in hyper-personalized CV customization.
        
        GOAL:
        Customize the candidate's CV for a specific job. If you have enough information, generate the content. 
        If crucial information is missing (e.g., job-specific keywords in their background), ask brief, high-impact questions.

        TARGET JOB:
        ${jobInfo}

        CANDIDATE PROFILE:
        Bio: ${profile.basicInfo.bio}
        Experience: ${JSON.stringify(profile.experience)}
        Skills: ${JSON.stringify(profile.skills)}

        CONVERSATION HISTORY:
        ${conversation.map(c => `${c.role === 'user' ? 'Candidate' : 'AI'}: ${c.text}`).join('\n')}

        INSTRUCTIONS:
        1. Evaluate if the Candidate Profile (including Conversation History) provides enough "proof points" to effectively meet the Target Job requirements.
        2. IF INSUFFICIENT DATA: Return a JSON object with "status": "needs_info" and "questions": ["question 1", "question 2"]. 
           Ask max 3 questions. Focus on identifying missing skills or quantifiable achievements related to the job.
        3. IF SUFFICIENT DATA: Return a JSON object with "status": "completed" and "customizedData": {
              "bio": "Rewritten bio targeting the job",
              "experience": [{"index": 0, "description": "Rewritten bullet points for this role"}],
              "skills": ["Updated skill names/levels if relevant"]
           }.
        4. Return ONLY valid JSON.
        `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return parseAIResponse(response.text());
  } catch (error) {
    console.error('AI CV Customization Error:', error);
    throw error;
  }
};

module.exports = {
  analyzeCV,
  rephraseText,
  getJobMatches,
  getRankedCandidates,
  getAIInsights,
  getOutreachDraft,
  getCustomizedCV
};
