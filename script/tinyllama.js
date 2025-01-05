const axios = require('axios');

module.exports.config = {
  name: "tinyllama",
  version: 1.0,
  credits: "heru",
  description: "AI-powered responses using TinyLlama 1.1B Chat API",
  hasPrefix: false,
  usages: "{pn} [prompt]",
  aliases: [],
  cooldown: 0,
};

module.exports.run = async function ({ api, event, args }) {
  try {
    const prompt = args.join(" ");
    if (!prompt) {
      await api.sendMessage("Hello, I'm TinyLlama AI, How can I assist you today?", event.threadID);
      return;
    }

    const initialMessage = await new Promise(resolve => {
      api.sendMessage("Processing your request, please wait...", event.threadID, (err, info) => {
        resolve(info);
      }, event.messageID);
    });

    const response = await axios.get(`https://heru-apis.gleeze.com/api/tinyllama-1.1b-chat?prompt=${encodeURIComponent(prompt)}`);
    const answer = response.data.content;

    await api.editMessage("🤖 𝗧𝗜𝗡𝗬𝗟𝗟𝗔𝗠𝗔\n━━━━━━━━━━━━━━━━━━\n" + answer + "\n━━━━━━━━━━━━━━━━━━", initialMessage.messageID);
  } catch (error) {
    console.error("⚠️", error.message);
    await api.editMessage("An error occurred while processing your request. Please try again later.", initialMessage.messageID);
  }
};