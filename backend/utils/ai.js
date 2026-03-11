const OpenAI = require('openai');
const pdf = require('pdf-parse');
const fs = require('fs');
const path = require('path');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Standardizes AI response by cleaning markdown and parsing JSON
 */
const parseAIResponse = (text) => {
  try {
    // 1. Try strict parsing after removing markdown code blocks
    const jsonString = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(jsonString);
  } catch (parseError) {
    console.error('⚠️ Initial JSON parse failed. Attempting robust repair.');
    try {
      // 2. Extract anything between the first { or [ and last } or ]
      const firstCurly = text.indexOf('{');
      const firstSquare = text.indexOf('[');
      const lastCurly = text.lastIndexOf('}');
      const lastSquare = text.lastIndexOf(']');

      let startIdx = firstCurly;
      let endIdx = lastCurly;

      if (firstSquare !== -1 && (firstCurly === -1 || firstSquare < firstCurly)) {
        startIdx = firstSquare;
      }
      if (lastSquare !== -1 && (lastCurly === -1 || lastSquare > lastCurly)) {
        endIdx = lastSquare;
      }

      if (startIdx !== -1 && endIdx !== -1 && endIdx >= startIdx) {
        let extracted = text.substring(startIdx, endIdx + 1);

        // 3. Attempt to fix common LLM JSON errors
        extracted = extracted
          .replace(/,\s*([}\]])/g, '$1') // Remove trailing commas
          .replace(/([\{\s,])(\w+)\s*:/g, '$1"$2":') // Add missing quotes around keys
          .replace(/\n/g, ' ') // Strip newlines that might break strings
          .replace(/\\"/g, '"'); // Fix over-escaped quotes

        return JSON.parse(extracted);
      }
    } catch (robustError) {
      console.error('❌ Robust JSON parse completely failed:', text);
      throw parseError; // Throw the original error
    }
    throw parseError;
  }
};

const analyzeCV = async (filePath) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('AI Service not configured (API Key missing)');
    }

    console.log('📄 Starting AI analysis for:', path.basename(filePath));
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    const text = data.text;
    console.log(`📄 Extracted ${text.length} characters of text from PDF`);

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

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3
    });
    
    return parseAIResponse(response.choices[0].message.content);
  } catch (error) {
    console.error('AI CV Parsing Error:', error);
    throw error;
  }
};

const rephraseText = async (text, context) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('AI Service not configured (API Key missing)');
    }

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

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3
    });
    
    return response.choices[0].message.content.trim().replace(/^["']|["']$/g, '');
  } catch (error) {
    console.error('AI Rephrase Error:', error);
    throw error;
  }
};

const getJobMatches = async (cvData, jobs) => {
  try {
    const isText = typeof cvData === 'string';
    const candidateInfo = isText
      ? `Raw CV Text:\n---\n${cvData}\n---`
      : `Profile Data:\nBio: ${cvData.basicInfo?.bio}\nSkills: ${JSON.stringify(cvData.skills)}\nExperience: ${JSON.stringify(cvData.experience)}`;

    const prompt = `
        You are an AI matching engine. Compare the candidate's background with the list of jobs provided.
        Calculate a match percentage (0-100) based on how well the candidate's skills and experience fit each job's requirements.
        Consider semantic similarity between the candidate's background and the job description.

        Candidate Information:
        ${candidateInfo}

        Jobs:
        ${jobs.map(j => `ID: ${j._id}, Title: ${j.title}, Requirements: ${JSON.stringify(j.skills)}, Description: ${j.description}`).join('\n\n')}

        Return ONLY a JSON array of objects: 
        [{"jobId": "...", "matchScore": 95, "matchReason": "Overall fit summary", "requirementsMatch": "..." }]
        `;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3
    });
    
    return parseAIResponse(response.choices[0].message.content);
  } catch (error) {
    console.error('AI Matching Error:', error);
    throw error;
  }
};

const getRankedCandidates = async (job, candidates) => {
  try {
    const prompt = `
        You are an AI specialized in technical recruiting. Your task is to rank the top 5 candidates from a given pool for a specific job post.
        
        Job Details:
        Title: ${job.title}
        Description: ${job.description}
        Skills Requested: ${JSON.stringify(job.skills)}
        Formal Requirements: ${JSON.stringify(job.requirements)}

        Candidate Pool:
        ${candidates.map(p => `
            Candidate ID: ${p.user._id}
            Name: ${p.user.name}
            Skills: ${JSON.stringify(p.skills)}
            Experience: ${JSON.stringify(p.experience)}
            Education: ${JSON.stringify(p.education)}
        `).join('\n')}

        Evaluate each candidate against BOTH the technical skills and the formal requirements. 
        
        Return ONLY a JSON array of the top 5 candidates:
        [
            { 
              "candidateId": "...", 
              "name": "...", 
              "matchScore": 95, 
              "matchReason": "Overall fit summary",
              "requirementsMatch": "How they meet specific requirements (e.g. 'Has required degree and 5 years experience')" 
            }
        ]
        `;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3
    });
    
    return parseAIResponse(response.choices[0].message.content);
  } catch (error) {
    console.error('AI Ranking Error:', error);
    throw error;
  }
};

const getAIInsights = async (job, profile) => {
  try {
    const prompt = `
        You are a senior technical recruiter. Analyze the following candidate profile against the job description.
        
        Job Description:
        Title: ${job.title}
        Description: ${job.description}
        Skills Required: ${JSON.stringify(job.skills)}
        Formal Requirements: ${JSON.stringify(job.requirements)}

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

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3
    });
    
    return parseAIResponse(response.choices[0].message.content);
  } catch (error) {
    console.error('AI Insights Error:', error);
    throw error;
  }
};

const getOutreachDraft = async (job, candidate, profile) => {
  try {
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

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3
    });
    
    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error('AI Outreach Draft Error:', error);
    throw error;
  }
};

const getCustomizedCV = async (profile, jobInfo, conversation = []) => {
  try {
    const prompt = `
        You are a World-Class AI Career Architect specializing in high-converting, ATS-optimized CV customization.
        
        GOAL:
        Customize the candidate's CV for a specific target job, INCLUDING FRESHERS AND ENTRY-LEVEL CANDIDATES.
        
        CRITICAL: You MUST handle ALL experience levels - from freshers to senior professionals. For freshers, focus on education, projects, internships, skills, and potential.

        TARGET JOB:
        ${jobInfo}

        CANDIDATE PROFILE:
        Bio: ${profile.basicInfo?.bio || 'N/A'}
        Experience: ${JSON.stringify(profile.experience)}
        Skills: ${JSON.stringify(profile.skills)}
        Education: ${JSON.stringify(profile.education)}

        CONVERSATION HISTORY:
        ${conversation.map(c => `${c.role === 'user' ? 'Candidate' : 'AI'}: ${c.text}`).join('\n')}

        FRESHER/ENTRY-LEVEL HANDLING:
        If candidate has NO professional experience or is a fresher, ask about:
        - Academic projects and assignments
        - Internships or part-time work
        - Personal projects and side projects
        - Certifications and online courses
        - Hackathons, competitions, or coding challenges
        - Volunteer work or freelance projects
        - Technical skills learned through education
        - Soft skills and leadership in college/university

        QUESTION CATEGORIES WITH EXAMPLES:

        **FOR FRESHERS/ENTRY-LEVEL:**
        - "What academic projects, assignments, or capstone projects have you completed? (e.g., built a web application for final year project, created mobile app for coursework, developed database system for college assignment)"
        - "What internships, part-time jobs, or volunteer work have you done? (e.g., 3-month internship at tech company, part-time web development work, volunteered to build website for local NGO)"
        - "What personal projects or side projects have you built? (e.g., personal portfolio website, GitHub projects, mobile apps, automation scripts, open-source contributions)"
        - "What certifications, online courses, or bootcamps have you completed? (e.g., completed React course on Udemy, finished Google Data Analytics Certificate, AWS Cloud Practitioner certified)"
        - "What programming languages and technologies have you learned through education or self-study? (e.g., Java from university, Python through online courses, React from personal projects)"

        **FOR EXPERIENCED PROFESSIONALS:**
        - "What specific programming languages and frameworks are required for this role? (e.g., Python, JavaScript, React, Node.js, Django, PostgreSQL, MongoDB)"
        - "What certifications are preferred or required for this position? (e.g., AWS Solutions Architect, Google Cloud Professional, Microsoft Azure, Docker Certified)"
        - "What specific projects have you worked on with measurable impact? (e.g., built e-commerce platform increasing sales by 40%, optimized database reducing query time by 60%)"
        - "What leadership, mentoring, or team collaboration experience do you have? (e.g., mentored 3 junior developers, led cross-functional team of 8, managed $500K project budget)"

        **FOR ALL CANDIDATES:**
        - "What technical skills do you want to highlight for this role? (e.g., programming languages, frameworks, tools, databases, cloud platforms)"
        - "What soft skills and achievements should we emphasize? (e.g., problem-solving, teamwork, communication, leadership, analytical thinking)"

        DECISION LOGIC:
        - IF candidate is fresher/entry-level (no professional experience) → ask about academic projects, internships, personal projects, certifications
        - IF job info is brief → ask about specific requirements and responsibilities
        - IF experienced candidate lacks details → ask about professional projects and achievements
        - ALWAYS try to create a CV even for freshers by focusing on education, projects, and potential

        IMPORTANT: Never refuse to create a CV for freshers. Always find ways to highlight their education, projects, skills, and potential.

        Return ONLY valid JSON:
        {
          "status": "needs_info" | "completed",
          "questions": ["Question with examples for their experience level?"],
          "customizedData": { 
            "bio": "Tailored bio highlighting education and potential for freshers, or experience for professionals", 
            "experience": [
              { "index": 0, "description": "Enhanced description focusing on relevant skills and achievements" }
            ], 
            "skills": ["Relevant skills for the job"],
            "skillGapAnalysis": {
              "matchedSkills": ["skills they have"],
              "missingSkills": ["skills to develop"]
            }
          }
        }
        `;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2
    });
    
    return parseAIResponse(response.choices[0].message.content);
  } catch (error) {
    console.error('AI CV Customization Error:', error);
    throw error;
  }
};

const getCareerTips = async (cvText) => {
  try {
    const prompt = `
        You are a senior career advisor. Based STRICTLY on the candidate's raw CV text below, provide:
        1. 4 SPECIFIC, non-generic career tips/suggestions that leverage their existing experience and address their actual skill gaps.
        2. 3-4 recommended certificate courses that would logically be the next step for this specific professional journey.

        Avoid generic advice like "networking" or "keep learning". Instead, mention specific technologies, roles, or industry trends relevant to their experience.

        Return ONLY a JSON object: 
        { 
          "tips": [{ "title": "...", "description": "...", "iconType": "book|cert|users|lightbulb" }],
          "courses": [{ "title": "...", "description": "...", "provider": "Coursera|Udemy|edX|Other", "type": "Free|Paid", "relevance": "Explain why this helps", "platformUrl": "https://..." }]
        }
        
        Candidate CV Text:
        ---
        ${cvText}
        ---
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3
    });
    
    return parseAIResponse(response.choices[0].message.content);
  } catch (error) {
    console.error('AI Career Tips Error:', error);
    throw error;
  }
};

const autoShortlistCandidates = async (job, applications) => {
  try {
    const prompt = `
        You are an AI recruiter. Analyze all applications for this job and automatically shortlist the best candidates.
        
        Job Details:
        Title: ${job.title}
        Description: ${job.description}
        Skills Required: ${JSON.stringify(job.skills)}
        Requirements: ${JSON.stringify(job.requirements)}

        Applications:
        ${applications.map(app => `
            Application ID: ${app._id}
            Candidate: ${app.candidateProfile?.user?.name}
            Skills: ${JSON.stringify(app.candidateProfile?.skills)}
            Experience: ${JSON.stringify(app.candidateProfile?.experience)}
            Education: ${JSON.stringify(app.candidateProfile?.education)}
        `).join('\n')}

        Evaluate each candidate and decide if they should be "Shortlisted" or remain "Applied".
        Only shortlist candidates with 70%+ match to requirements.
        
        Return ONLY a JSON array:
        [
            { "applicationId": "...", "status": "Shortlisted", "reason": "Brief reason" },
            { "applicationId": "...", "status": "Applied", "reason": "Brief reason" }
        ]
        `;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3
    });
    
    return parseAIResponse(response.choices[0].message.content);
  } catch (error) {
    console.error('AI Auto-Shortlist Error:', error);
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
  getCustomizedCV,
  getCareerTips,
  autoShortlistCandidates
};
