const axios = require('axios');

module.exports.config = {
  name: "okeyai",
  version: 1.0,
  credits: "heru",
  description: "AI-powered responses using OkeyAI API",
  hasPrefix: false,
  usages: "{pn} [prompt]",
  aliases: [],
  cooldown: 0,
};

module.exports.run = async function ({ api, event, args }) {
  try {
    const prompt = args.join(" ");
    if (!prompt) {
      await api.sendMessage("Hello, I'm OkeyAI! Please provide a question.", event.threadID);
      return;
    }

    const initialMessage = await new Promise(resolve => {
      api.sendMessage("Processing your request, please wait...", event.threadID, (err, info) => {
        resolve(info);
      }, event.messageID);
    });

    const response = await axios.get(`https://www.pinkissh.site/api/okeyai?prompt=${encodeURIComponent(prompt)}`);
    const answer = response.data.response;

    await api.editMessage("🤖 | 𝗢𝗸𝗲𝘆𝗔𝗜\n━━━━━━━━━━━━━━━━━━\n" + answer + "\n━━━━━━━━━━━━━━━━━━", initialMessage.messageID);
  } catch (error) {
    console.error("⚠️", error.message);
    await api.editMessage("An error occurred while processing your request. Please try again later.", initialMessage.messageID);
  }
};