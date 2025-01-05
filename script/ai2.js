const axios = require('axios');

module.exports.config = {
  name: "ai2",
  version: 1.0,
  credits: "heru",
  description: "AI-powered chatbot using GPT-4o",
  hasPrefix: false,
  usages: "{pn} [prompt]",
  aliases: [],
  cooldown: 0,
};

module.exports.run = async function ({ api, event, args }) {
  try {
    const prompt = args.join(" ");
    if (!prompt) {
      await api.sendMessage("🤖 Hey, I'm your virtual assistant, How can I assist you today?", event.threadID);
      return;
    }

    const initialMessage = await new Promise(resolve => {
      api.sendMessage("Thinking, please wait...", event.threadID, (err, info) => {
        resolve(info);
      }, event.messageID);
    });

    const response = await axios.get(`https://heru-apis.gleeze.com/api/gpt-4o?prompt=${encodeURIComponent(prompt)}`);
    const answer = response.data.content;

    await api.editMessage("🌟 𝖠𝗂 𝖺𝗌𝗌𝗂𝗌𝗍𝖺𝗇𝗍\n\n" + answer, initialMessage.messageID);
  } catch (error) {
    console.error("⚠️", error.message);
    await api.editMessage("An error occurred while processing your request. Please try again later.", initialMessage.messageID);
  }
};