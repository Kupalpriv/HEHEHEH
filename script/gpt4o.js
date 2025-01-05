const axios = require('axios');

module.exports.config = {
  name: "gpt4o",
  version: 1.0,
  credits: "heru",
  description: "Conversational AI",
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

    const uid = Math.random().toString(36).substring(2, 15); // Generate a random UID

    const initialMessage = await new Promise(resolve => {
      api.sendMessage("⌛ Searching...", event.threadID, (err, info) => {
        resolve(info);
      }, event.messageID);
    });

    const response = await axios.get(`https://yt-video-production.up.railway.app/gpt4-omni?ask=${encodeURIComponent(prompt)}&userid=${uid}`);
    const answer = response.data.response;

    await api.editMessage("🤖 | 𝗔𝗜 𝗖𝗢𝗡𝗩𝗘𝗥𝗦𝗔𝗧𝗜𝗢𝗡\n━━━━━━━━━━━━━━━━━━\n" + answer + "\n━━━━━━━━━━━━━━━━━━", initialMessage.messageID);
  } catch (error) {
    console.error("⚠️", error.message);
    await api.editMessage("An error occurred while processing your request. Please try again later.", event.messageID);
  }
};