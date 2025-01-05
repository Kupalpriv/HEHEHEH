const axios = require('axios');

module.exports.config = {
  name: "llama1",
  version: 1.0,
  credits: "heru",
  description: "AI-powered responses using Llama-2-7B Chat API",
  hasPrefix: false,
  usages: "{pn} [prompt]",
  aliases: [],
  cooldown: 0,
};

module.exports.run = async function ({ api, event, args }) {
  try {
    const prompt = args.join(" ");
    if (!prompt) {
      await api.sendMessage("Hello, I'm Llama1 AI! Please provide a prompt for me to process.", event.threadID);
      return;
    }

    const initialMessage = await new Promise(resolve => {
      api.sendMessage("Processing your request, please wait...", event.threadID, (err, info) => {
        resolve(info);
      }, event.messageID);
    });

    const response = await axios.get(`https://heru-apis.gleeze.com/api/llama-2-7b-chat-fp16?prompt=${encodeURIComponent(prompt)}`);
    const answer = response.data.response;

    await api.editMessage("🦙 | 𝗟𝗹𝗮𝗺𝗮-𝟭\n━━━━━━━━━━━━━━━━━━\n" + answer + "\n━━━━━━━━━━━━━━━━━━", initialMessage.messageID);
  } catch (error) {
    console.error("⚠️", error.message);
    await api.editMessage("An error occurred while processing your request. Please try again later.", initialMessage.messageID);
  }
};