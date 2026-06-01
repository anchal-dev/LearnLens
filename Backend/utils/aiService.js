const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { OpenAI } = require('openai');

dotenv.config();

const AI_PROVIDER = (process.env.AI_PROVIDER || 'google').toLowerCase();
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const GOOGLE_MODEL = process.env.GOOGLE_MODEL || 'gemini-1.5-flash';
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4.1-mini';

let googleClient = null;
let openaiClient = null;

if (AI_PROVIDER === 'google') {
  if (!GOOGLE_API_KEY) {
    throw new Error('Missing GOOGLE_API_KEY. Set GOOGLE_API_KEY in Backend/.env to use Gemini.');
  }
  googleClient = new GoogleGenerativeAI(GOOGLE_API_KEY);
} else if (AI_PROVIDER === 'openai') {
  if (!OPENAI_API_KEY) {
    throw new Error('Missing OPENAI_API_KEY. Set OPENAI_API_KEY in Backend/.env to use OpenAI.');
  }
  openaiClient = new OpenAI({ apiKey: OPENAI_API_KEY });
} else {
  throw new Error('Unsupported AI_PROVIDER. Set AI_PROVIDER=google or AI_PROVIDER=openai in Backend/.env.');
}

const tutorSystemPrompt = `You are LearnLens AI Tutor, a friendly and patient educational tutor. Your task is to answer student questions clearly, explain concepts step-by-step, provide examples, and help the student learn. Keep the tone supportive, concise, and accurate. If the student asks about school subjects, explain with clarity and use simple analogies when helpful.`;

const buildChatHistoryForGoogle = (chatHistory) => {
  const history = chatHistory.map((msg) => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.content }],
  }));

  return [{ role: 'system', parts: [{ text: tutorSystemPrompt }] }, ...history];
};

const buildChatHistoryForOpenAI = (chatHistory) => {
  const history = chatHistory.map((msg) => ({
    role: msg.role === 'user' ? 'user' : 'assistant',
    content: msg.content,
  }));

  return [{ role: 'system', content: tutorSystemPrompt }, ...history];
};

const analyzeLearningGaps = async (performanceData) => {
  try {
    if (AI_PROVIDER === 'openai') {
      const prompt = `As an expert educational psychologist and data analyst, analyze the following student quiz performance data:\n${JSON.stringify(performanceData)}\n\nIdentify:\n1. Specific weak topics (where accuracy is low).\n2. Potential conceptual gaps based on the topics.\n3. A confidence score (0-100) reflecting their mastery.\n4. Actionable, encouraging feedback for the student.\n5. Three specific recommended actions (e.g., "Revise trigonometry identities", "Practice 10 linear equations").\n\nReturn the analysis in STRICT JSON format:\n{\n  "weakTopics": ["Topic 1", "Topic 2"],\n  "weakConcepts": ["Concept A", "Concept B"],\n  "confidenceScore": 85,\n  "aiFeedback": "Your encouraging feedback here...",\n  "recommendedActions": ["Action 1", "Action 2", "Action 3"],\n  "riskLevel": "Low" | "Medium" | "High"\n}`;

      const completion = await openaiClient.chat.completions.create({
        model: OPENAI_MODEL,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 500,
      });

      const text = completion.choices?.[0]?.message?.content?.trim();
      const jsonMatch = text?.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('Could not parse OpenAI response for learning gaps.');
    }

    const model = googleClient.getGenerativeModel({ model: GOOGLE_MODEL });
    const prompt = `As an expert educational psychologist and data analyst, analyze the following student quiz performance data:\n${JSON.stringify(performanceData)}\n\nIdentify:\n1. Specific weak topics (where accuracy is low).\n2. Potential conceptual gaps based on the topics.\n3. A confidence score (0-100) reflecting their mastery.\n4. Actionable, encouraging feedback for the student.\n5. Three specific recommended actions (e.g., "Revise trigonometry identities", "Practice 10 linear equations").\n\nReturn the analysis in STRICT JSON format:\n{\n  "weakTopics": ["Topic 1", "Topic 2"],\n  "weakConcepts": ["Concept A", "Concept B"],\n  "confidenceScore": 85,\n  "aiFeedback": "Your encouraging feedback here...",\n  "recommendedActions": ["Action 1", "Action 2", "Action 3"],\n  "riskLevel": "Low" | "Medium" | "High"\n}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('Could not parse Gemini response for learning gaps.');
  } catch (error) {
    console.error('AI Analysis Error:', error);
    return null;
  }
};

const getTutorResponse = async (chatHistory, newUserMessage) => {
  try {
    if (AI_PROVIDER === 'openai') {
      const messages = [...buildChatHistoryForOpenAI(chatHistory), { role: 'user', content: newUserMessage }];
      const completion = await openaiClient.chat.completions.create({
        model: OPENAI_MODEL,
        messages,
        max_tokens: 500,
      });
      return completion.choices?.[0]?.message?.content?.trim() || 'I could not create a response. Please try again.';
    }

    const model = googleClient.getGenerativeModel({ model: GOOGLE_MODEL });
    const history = buildChatHistoryForGoogle(chatHistory);
    const chat = model.startChat({ history, generationConfig: { maxOutputTokens: 500 } });
    const result = await chat.sendMessage({ author: 'user', content: [{ text: newUserMessage }] });
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error('AI Tutor Error:', error);

    // OpenAI quota / rate limit — attempt Google fallback when available
    if (AI_PROVIDER === 'openai' && (error.code === 'insufficient_quota' || error.status === 429)) {
      if (googleClient) {
        try {
          const model = googleClient.getGenerativeModel({ model: GOOGLE_MODEL });
          const history = buildChatHistoryForGoogle(chatHistory || []);
          const chat = model.startChat({ history, generationConfig: { maxOutputTokens: 500 } });
          const result = await chat.sendMessage({ author: 'user', content: [{ text: newUserMessage }] });
          const response = await result.response;
          return response.text().trim();
        } catch (gErr) {
          console.error('Fallback to Google failed:', gErr);
          return 'AI tutor error: OpenAI quota exceeded and Google fallback failed. Check API keys or try again later.';
        }
      }
      return 'AI tutor error: OpenAI quota exceeded or rate limited. Check your OpenAI billing/usage or switch to Google Gemini (set AI_PROVIDER=google).';
    }

    // OpenAI auth problems
    if (AI_PROVIDER === 'openai' && (error.status === 401 || /invalid api key/i.test(error.message || '')) ) {
      return 'AI tutor error: OpenAI API key invalid or unauthorized. Verify OPENAI_API_KEY in Backend/.env.';
    }

    // Google API missing
    if (AI_PROVIDER === 'google' && error.message?.includes('Missing GOOGLE_API_KEY')) {
      return 'AI tutor is not configured. Please set the required GOOGLE_API_KEY in Backend/.env.';
    }

    return 'I am sorry, I am having trouble connecting to my brain right now. Please try again later.';
  }
};

module.exports = { analyzeLearningGaps, getTutorResponse };
