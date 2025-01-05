const axios = require('axios');

module.exports.config = {
  name: "gemini",
  role: 0,
  credits: "heru",
  description: "Interact with Gemini API",
  hasPrefix: false,
  version: "1.0.0",
  aliases: ["describe", "gemini"],
  usage: "gemini [prompt]"
};

module.exports.run = async function ({ api, event, args }) {
  const prompt = args.join(" ");

  if (!prompt) {
    return api.sendMessage('Please provide a prompt.', event.threadID, event.messageID);
  }

  if (event.type !== "message_reply" || !event.messageReply.attachments[0] || event.messageReply.attachments[0].type !== "photo") {
    return api.sendMessage('Please reply to a photo with this command.', event.threadID, event.messageID);
  }

  const url = encodeURIComponent(event.messageReply.attachments[0].url);
  api.sendTypingIndicator(event.threadID);

  // Send the "Searching, please wait..." message
  const initialMessage = await new Promise(resolve => {
    api.sendMessage("Searching, please wait...", event.threadID, (err, info) => {
      resolve(info);
    }, event.messageID);
  });

  try {
    const response = await axios.get(`https://api.joshweb.click/gemini?prompt=${encodeURIComponent(prompt)}&url=${url}`);
    const description = response.data.gemini;

    // Edit the initial message with the response
    await api.editMessage("📸 | 𝗚𝗘𝗠𝝞𝝢𝝞 𝗙𝗟𝝖𝗦𝗛\n━━━━━━━━━━━━━━━━━━\n" + description + "\n━━━━━━━━━━━━━━━━━━", initialMessage.messageID);
  } catch (error) {
    console.error(error);
    await api.editMessage('❌ | An error occurred while processing your request.', initialMessage.messageID);
  }
};
