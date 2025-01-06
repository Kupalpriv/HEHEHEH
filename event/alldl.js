const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports.config = {
  name: "alldl",
  version: "1.0.2",
  credits: "churchill",
  description: "Download media from TikTok, Facebook, Instagram, and Facebook Reels."
};

module.exports.handleEvent = async function({ event, api }) {
  const { body, threadID, messageID } = event;

  if (!body) return;

  const tiktokRegex = /https?:\/\/(www\.)?tiktok\.com\/[^\s]+/gi;
  const instagramRegex = /https?:\/\/(www\.)?(instagram\.com|instagr\.am)\/[^\s]+/gi;
  const facebookRegex = /https?:\/\/(www\.)?(facebook\.com|fb\.watch|facebook\.reels)\/[^\s]+/gi;

  let platform = null;
  let link = null;

  if (tiktokRegex.test(body)) {
    platform = "TikTok";
    link = body.match(tiktokRegex)[0];
  } else if (instagramRegex.test(body)) {
    platform = "Instagram";
    link = body.match(instagramRegex)[0];
  } else if (facebookRegex.test(body)) {
    platform = "Facebook";
    link = body.match(facebookRegex)[0];
  }

  if (!platform || !link) return;

  try {
    const response = await axios.get(`https://heru-apiv2.ddnsfree.com/api/anydl?url=${encodeURIComponent(link)}`);
    const data = response.data;

    if (data.content.status && data.content.data.result?.length) {
      const videoData = data.content.data.result[0];
      const videoUrl = videoData.url;
      const fileName = `downloaded_video_${Date.now()}.mp4`;
      const filePath = path.join(__dirname, "cache", fileName);

      const videoResponse = await axios({
        url: videoUrl,
        method: "GET",
        responseType: "stream"
      });

      const writer = fs.createWriteStream(filePath);
      videoResponse.data.pipe(writer);

      writer.on("finish", () => {
        api.sendMessage({
          body: `[📥 Media Downloader 📥]\n` +
            `❯ Platform: ${platform}\n` +
            `❯ Quality: ${videoData.quality}\n` +
            `❯ Creator: ${data.content.creator}\n` +
            `❯ User: ${data.content.data.user || "Unknown"}`,
          attachment: fs.createReadStream(filePath)
        }, threadID, () => fs.unlinkSync(filePath), messageID);
      });

      writer.on("error", () => {
        api.sendMessage("An error occurred while saving the video.", threadID, messageID);
      });
    } else {
      api.sendMessage("Unable to fetch media. The link might be invalid or unsupported.", threadID, messageID);
    }
  } catch (error) {
    api.sendMessage("An error occurred while processing your request.", threadID, messageID);
  }
};
