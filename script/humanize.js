const axios = require('axios');
const { kaizen } = require('../api');

module.exports.config = {
    name: 'humanize',
    version: '1.0.0',
    role: 0,
    hasPrefix: true,
    aliases: [],
    description: 'Get a human-like response using the Humanizer API',
    usage: 'humanize [your text]',
    credits: 'churchill',
    cooldown: 3,
};

module.exports.run = async function ({ api, event, args }) {
    const userText = args.join(' ');

    if (!userText) {
        return api.sendMessage('❌ Please provide a message to humanize.', event.threadID, event.messageID);
    }

    const apiUrl = `${kaizen}/api/humanizer?q=${encodeURIComponent(userText)}`;

    try {
        const response = await axios.get(apiUrl);
        const apiResponse = response.data.response?.trim() || 'I apologize, but I could not retrieve a valid response.';

        const formattedResponse = `🎨 Humanized Response 🎨\n\n📤 Input:\n${userText}\n\n📥 Response:\n${apiResponse}`;

        api.sendMessage(formattedResponse, event.threadID, event.messageID);
    } catch (error) {
        const errorMessage =
            error.response?.data?.response?.trim() || '❌ An unexpected error occurred. Please try again later.';
        api.sendMessage(errorMessage, event.threadID, event.messageID);
    }
};
