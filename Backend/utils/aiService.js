const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

const analyzeLearningGaps = async (performanceData) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `
      As an expert educational psychologist and data analyst, analyze the following student quiz performance data:
      ${JSON.stringify(performanceData)}

      Identify:
      1. Specific weak topics (where accuracy is low).
      2. Potential conceptual gaps based on the topics.
      3. A confidence score (0-100) reflecting their mastery.
      4. Actionable, encouraging feedback for the student.
      5. Three specific recommended actions (e.g., "Revise trigonometry identities", "Practice 10 linear equations").

      Return the analysis in STRICT JSON format:
      {
        "weakTopics": ["Topic 1", "Topic 2"],
        "weakConcepts": ["Concept A", "Concept B"],
        "confidenceScore": 85,
        "aiFeedback": "Your encouraging feedback here...",
        "recommendedActions": ["Action 1", "Action 2", "Action 3"],
        "riskLevel": "Low" | "Medium" | "High"
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from the markdown code block if present
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('Could not parse AI response');
  } catch (error) {
    console.error('AI Analysis Error:', error);
    return null;
  }
};

const getTutorResponse = async (chatHistory, newUserMessage) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    // Filter history for the Gemini format
    const contents = chatHistory.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    const chat = model.startChat({
      history: contents,
      generationConfig: {
        maxOutputTokens: 500,
      },
    });

    const result = await chat.sendMessage(newUserMessage);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('AI Tutor Error:', error);
    return 'I am sorry, I am having trouble connecting to my brain right now. Please try again later.';
  }
};

const generateQuizQuestions = async (subject, topic, difficulty, count) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `
      You are an expert educator creating a diagnostic quiz for senior secondary students (Class 10–12).
      Generate exactly ${count} multiple-choice questions on the topic "${topic}" in subject "${subject}" at "${difficulty}" difficulty.

      Rules:
      - Each question must have exactly 4 options.
      - correctOption is a 0-based index (0, 1, 2, or 3) of the correct answer.
      - Include a brief explanation for the correct answer.
      - Questions must be distinct and educational.
      - Difficulty "${difficulty}": Easy = conceptual recall, Medium = application, Hard = analysis/synthesis.

      Return STRICT valid JSON only — no markdown, no extra text:
      {
        "questions": [
          {
            "questionText": "Question text here?",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correctOption": 0,
            "explanation": "Brief explanation of why Option A is correct.",
            "topic": "${topic}"
          }
        ]
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    // Strip markdown code fences if present
    const cleaned = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed.questions || [];
    }
    throw new Error('Could not parse AI quiz response');
  } catch (error) {
    console.error('AI Quiz Generation Error:', error);
    return null;
  }
};

module.exports = { analyzeLearningGaps, getTutorResponse, generateQuizQuestions };

