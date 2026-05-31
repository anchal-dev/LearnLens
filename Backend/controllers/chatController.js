const ChatHistory = require('../models/ChatHistory');
const { getTutorResponse } = require('../utils/aiService');

// @desc    Chat with AI Tutor
exports.chatWithTutor = async (req, res) => {
  const { message } = req.body;

  try {
    let chatHistory = await ChatHistory.findOne({ student: req.user._id });
    
    if (!chatHistory) {
      chatHistory = await ChatHistory.create({
        student: req.user._id,
        messages: []
      });
    }

    // Call AI Service
    const aiResponse = await getTutorResponse(chatHistory.messages, message);

    // Save history
    chatHistory.messages.push({ role: 'user', content: message });
    chatHistory.messages.push({ role: 'model', content: aiResponse });
    chatHistory.updatedAt = Date.now();
    await chatHistory.save();

    res.json({ response: aiResponse, history: chatHistory.messages });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get chat history
exports.getChatHistory = async (req, res) => {
  try {
    const chatHistory = await ChatHistory.findOne({ student: req.user._id });
    res.json(chatHistory ? chatHistory.messages : []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
