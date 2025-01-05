const axios = require('axios');

module.exports.config = {
  name: "catgpt",
  version: 1.0,
  credits: "heru",
  description: "AI-powered chatbot using CatGPT",
  hasPrefix: false,
  usages: "{pn} [prompt]",
  aliases: [],
  cooldown: 0,
};

module.exports.run = async function ({ api, event, args }) {
  try {
    const prompt = args.join(" ");
    if (!prompt) {
      await api.sendMessage("Hey, I'm CatGPT, your purr-fect virtual assistant. Ask me a question!", event.threadID);
      return;
    }

    const initialMessage = await new Promise(resolve => {
      api.sendMessage("Thinking, please wait...", event.threadID, (err, info) => {
        resolve(info);
      }, event.messageID);
    });

    const response = await axios.get(`https://heru-apis.gleeze.com/api/catgpt?prompt=${encodeURIComponent(prompt)}`);
    const answer = response.data.response;

    await api.editMessage("😺 𝗖𝗔𝗧𝗚𝗣𝗧\n━━━━━━━━━━━━━━━━━━\n" + answer + "\n━━━━━━━━━━━━━━━━━━", initialMessage.messageID);
  } catch (error) {
    console.error("⚠️", error.message);
    await api.editMessage("An error occurred while processing your request. Please try again later.", initialMessage.messageID);
  }
};