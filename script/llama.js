const axios = require('axios');

module.exports.config = {
  name: "llama",
  version: 1.0,
  credits: "heru",
  description: "AI-powered chatbot using Llama 2-7B",
  hasPrefix: false,
  usages: "{pn} [prompt]",
  aliases: [],
  cooldown: 0,
};

module.exports.run = async function ({ api, event, args }) {
  try {
    const prompt = args.join(" ");
    if (!prompt) {
      await api.sendMessage("Please provide a question first.", event.threadID);
      return;
    }

    const initialMessage = await new Promise(resolve => {
      api.sendMessage("Thinking, please wait...", event.threadID, (err, info) => {
        resolve(info);
      }, event.messageID);
    });

    const response = await axios.get(`https://heru-apis.gleeze.com/api/llama-2-7b-chat-fp16?prompt=${encodeURIComponent(prompt)}`);
    const answer = response.data.content;

    await api.editMessage("🤖 | 𝗟𝗹𝗮𝗺𝗮 𝟮-𝟳𝗕\n━━━━━━━━━━━━━━━━━━\n" + answer + "\n━━━━━━━━━━━━━━━━━━", initialMessage.messageID);
  } catch (error) {
    console.error("⚠️", error.message);
    await api.editMessage("An error occurred while processing your request. Please try again later.", initialMessage.messageID);
  }
};