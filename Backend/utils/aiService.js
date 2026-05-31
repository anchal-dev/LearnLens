const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

const analyzeLearningGaps = async (performanceData) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

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
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
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

module.exports = { analyzeLearningGaps, getTutorResponse };
