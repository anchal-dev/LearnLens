const dotenv = require('dotenv');
dotenv.config();

const { getTutorResponse } = require('./utils/aiService');

(async () => {
  try {
    console.log('AI_PROVIDER=', process.env.AI_PROVIDER);
    const res = await getTutorResponse([], 'Explain Newton\'s second law with an example');
    console.log('AI response:', res);
  } catch (err) {
    console.error('Test chat error:', err);
  }
})();
