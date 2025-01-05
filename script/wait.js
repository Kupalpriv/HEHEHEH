const axios = require('axios');
const fs = require('fs');

module.exports.config = {
  name: "wait",
  version: 1.0,
  credits: "heru",
  description: "Send wait video.",
  hasPrefix: false,
  usages: "{pn}",
  aliases: [],
  cooldown: 0,
};

module.exports.run = async function ({ api, event }) {
  try {
    const videoUrl = "https://i.imgur.com/9qhbnMn.mp4";
    const response = await axios.get(videoUrl, { responseType: 'stream' });
    const videoPath = `${__dirname}/wait.mp4`;
    const writer = fs.createWriteStream(videoPath);

    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    await api.sendMessage(
      {
        body: "🖐🏻 wait...",
        attachment: fs.createReadStream(videoPath),
      },
      event.threadID,
      event.messageID
    );

    fs.unlinkSync(videoPath);
  } catch (error) {
    console.error("⚠️", error.message);
    await api.sendMessage("An error occurred while processing your request. Please try again later.", event.threadID);
  }
};