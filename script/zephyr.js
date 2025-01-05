const axios = require('axios');

module.exports.config = {
  name: "zephyr",
  version: 1.0,
  credits: "heru",
  description: "AI-powered chatbot using Zephyr 7B Beta",
  hasPrefix: false,
  usages: "{pn} [prompt]",
  aliases: [],
  cooldown: 0,
};

module.exports.run = async function ({ api, event, args }) {
  try {
    const prompt = args.join(" ");
    if (!prompt) {
      await api.sendMessage("Please provide a question.", event.threadID);
      return;
    }

    const initialMessage = await new Promise(resolve => {
      api.sendMessage("Thinking, please wait...", event.threadID, (err, info) => {
        resolve(info);
      }, event.messageID);
    });

    const response = await axios.get(`https://heru-apis.gleeze.com/api/zephyr-7b-beta?prompt=${encodeURIComponent(prompt)}`);
    const answer = response.data.content;

    await api.editMessage("🤖 | 𝗭𝗲𝗽𝗵𝘆𝗿 𝟳𝗕 𝗕𝗲𝘁𝗮\n━━━━━━━━━━━━━━━━━━\n" + answer + "\n━━━━━━━━━━━━━━━━━━", initialMessage.messageID);
  } catch (error) {
    console.error("⚠️", error.message);
    await api.editMessage("An error occurred while processing your request. Please try again later.", initialMessage.messageID);
  }
};