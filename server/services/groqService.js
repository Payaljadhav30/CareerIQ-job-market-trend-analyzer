const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Robust JSON extractor — handles text before/after JSON, markdown fences, etc.
const extractJSON = (text) => {
  // Remove markdown code fences
  let cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

  // Try direct parse first
  try { return JSON.parse(cleaned); } catch {}

  // Find JSON object or array using brace/bracket matching
  const findJSON = (str, startChar, endChar) => {
    const start = str.indexOf(startChar);
    if (start === -1) return null;
    let depth = 0;
    for (let i = start; i < str.length; i++) {
      if (str[i] === startChar) depth++;
      else if (str[i] === endChar) depth--;
      if (depth === 0) {
        try { return JSON.parse(str.substring(start, i + 1)); } catch {}
      }
    }
    return null;
  };

  const obj = findJSON(cleaned, '{', '}');
  if (obj) return obj;
  const arr = findJSON(cleaned, '[', ']');
  if (arr) return arr;

  throw new Error('Could not parse JSON from AI response: ' + cleaned.substring(0, 200));
};

const ask = async (prompt, maxTokens = 2000) => {
  const res = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: 'You are a helpful AI assistant. Always respond with valid JSON only. No explanations, no markdown, no code fences — just raw JSON.'
      },
      { role: 'user', content: prompt }
    ],
    temperature: 0.7,
    max_tokens: maxTokens,
  });
  const text = res.choices[0]?.message?.content || '';
  return extractJSON(text);
};

// Analyze resume against field and role
const analyzeResume = async (resumeText, fieldOfInterest, targetRole) => {
  return await ask(`
Analyze this resume for a student interested in ${fieldOfInterest} targeting a ${targetRole} role.

Resume Content:
${resumeText.substring(0, 3000)}

Return this exact JSON:
{
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2", "weakness3"],
  "suggestions": ["suggestion1", "suggestion2", "suggestion3", "suggestion4"],
  "skillMatchPercentage": 75,
  "extractedSkills": ["skill1", "skill2", "skill3"],
  "missingSkills": ["missingSkill1", "missingSkill2", "missingSkill3"]
}`, 1500);
};

// Suggest courses — use real searchable URLs
const suggestCourses = async (fieldOfInterest, missingSkills, targetRole) => {
  const skills = Array.isArray(missingSkills) ? missingSkills.join(', ') : 'fundamental skills';
  return await ask(`
A student wants to learn ${fieldOfInterest} to become a ${targetRole || 'professional'}. Missing skills: ${skills}.

Suggest 8 courses. For links use real search URLs like:
- YouTube: https://www.youtube.com/results?search_query=SKILL+tutorial
- freeCodeCamp: https://www.freecodecamp.org/news/search/?query=SKILL
- Coursera: https://www.coursera.org/search?query=SKILL
- Udemy: https://www.udemy.com/courses/search/?q=SKILL

Return this exact JSON:
{
  "courses": [
    {
      "title": "Course Title",
      "platform": "YouTube",
      "skill": "React.js",
      "difficulty": "Beginner",
      "duration": "8 hours",
      "link": "https://www.youtube.com/results?search_query=react+js+tutorial",
      "description": "Short description of what you'll learn"
    }
  ]
}`, 2000);
};

// Generate weekly roadmap
const generateRoadmap = async (targetRole, fieldOfInterest, hoursPerWeek, missingSkills) => {
  const skills = Array.isArray(missingSkills) && missingSkills.length > 0
    ? missingSkills.join(', ')
    : 'core skills for the role';
  return await ask(`
Create an 8-week learning roadmap for someone who wants to become a ${targetRole} in ${fieldOfInterest}.
Available time: ${hoursPerWeek} hours per week.
Focus on: ${skills}

Return this exact JSON:
{
  "weeks": [
    {
      "weekNumber": 1,
      "title": "Foundation Week",
      "topics": ["Topic 1", "Topic 2", "Topic 3"],
      "resources": ["YouTube: search topic", "freeCodeCamp: topic", "MDN Docs"],
      "goals": ["Goal 1", "Goal 2"]
    }
  ]
}`, 2500);
};

// Generate interview questions
const generateInterviewQuestions = async (role, details) => {
  return await ask(`
Generate 10 interview questions for a ${role} position. Context: ${details || 'entry level fresh graduate'}.
Include 6 technical and 4 behavioral questions.

Return this exact JSON:
{
  "questions": [
    { "id": 1, "question": "Explain the concept of X?", "type": "technical" },
    { "id": 2, "question": "Tell me about a time when...", "type": "behavioral" }
  ]
}`, 1500);
};

// Evaluate interview answer
const evaluateAnswer = async (question, answer, role) => {
  return await ask(`
Interviewer for ${role} role evaluating this:
Question: ${question}
Answer: ${answer || '(no answer given)'}

Return this exact JSON:
{
  "score": 7,
  "feedback": "Specific feedback on what was good and what was missing",
  "betterAnswer": "Key points a strong answer should include"
}`, 800);
};

// Generate overall interview feedback
const generateOverallFeedback = async (role, questions) => {
  const avgScore = questions.length > 0
    ? questions.reduce((sum, q) => sum + (q.score || 0), 0) / questions.length
    : 0;
  return await ask(`
Student completed mock interview for ${role}. Average: ${avgScore.toFixed(1)}/10.
Scores: ${questions.map(q => `${q.score}/10`).join(', ')}

Return this exact JSON:
{
  "overallFeedback": "2-3 sentence comprehensive assessment",
  "strongAreas": ["area1", "area2"],
  "improvementAreas": ["area1", "area2"],
  "nextSteps": ["step1", "step2", "step3"]
}`, 1000);
};

module.exports = {
  analyzeResume,
  suggestCourses,
  generateRoadmap,
  generateInterviewQuestions,
  evaluateAnswer,
  generateOverallFeedback
};
