module.exports.config = {
  name: "bbm",
  version: "1.0.0",
  role: 0,
  credits: "cliff",
  description: "Generate BBM canvas meme",
  hasPrefix: false,
  aliases: [],
  usage: "{pn}bbm <text1> | <text2>",
  cooldown: 5
};

const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.run = async function({ api, event, args }) {
  try {
      const input = args.join(" ");
      const [text1, text2] = input.split(" | ");

      if (!text1 || !text2) {
          return api.sendMessage(`Invalid Usage: Use ${module.exports.config.usage}`, event.threadID);
      }

      const apiUrl = `https://api-canvass.vercel.app/bbm?text1=${encodeURIComponent(text1)}&text2=${encodeURIComponent(text2)}`;

      const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });

      const canvasPath = path.join(__dirname, "cache", "bbmCanvas.jpg");

      fs.writeFileSync(canvasPath, response.data);      

      api.sendMessage({
          attachment: fs.createReadStream(canvasPath)
      }, event.threadID, () => {
          fs.unlinkSync(canvasPath);
      });

  } catch (error) {
      api.sendMessage("An error occurred while generating the BBM canvas.", event.threadID);
  }
};