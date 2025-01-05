const axios = require('axios');

module.exports.config = {
  name: "gemma",
  version: 1.0,
  credits: "heru",
  description: "Gemma AI",
  hasPrefix: false,
  usages: "{pn} [prompt]",
  aliases: [],
  cooldown: 0,
};

module.exports.run = async function ({ api, event, args }) {
  try {
    const prompt = args.join(" ");
    if (!prompt) {
      await api.sendMessage("Please provide a question or prompt.", event.threadID);
      return;
    }

    const initialMessage = await new Promise(resolve => {
      api.sendMessage("Thinking, please wait...", event.threadID, (err, info) => {
        resolve(info);
      }, event.messageID);
    });

    const response = await axios.get(`https://api.joshweb.click/api/gemma-7b?q=${encodeURIComponent(prompt)}`);
    const answer = response.data.result;

    await api.editMessage("🤖 | 𝗚𝗘𝗠𝗠𝗔 𝗔𝗜\n━━━━━━━━━━━━━━━━━━\n" + answer + "\n━━━━━━━━━━━━━━━━━━", initialMessage.messageID);
  } catch (error) {
    console.error("⚠️", error.message);
    await api.editMessage("An error occurred while processing your request. Please try again later.", initialMessage.messageID);
  }
};