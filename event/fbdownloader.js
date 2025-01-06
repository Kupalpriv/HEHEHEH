const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "fbdownloader",
  version: "1.0.0",
  credits: "churchill",
  description: "Automatically download Facebook videos including Reels.",
};

module.exports.handleEvent = async function ({ event, api }) {
  const { body, threadID, messageID } = event;

  if (!body) return;

  const facebookRegex = /https?:\/\/(www\.)?(facebook\.com|fb\.watch|facebook\.reels)\/[^\s]+/gi;
  const link = body.match(facebookRegex)?.[0];

  if (!link) return;

  // Processing Indicator
  api.sendMessage(
    `[📥 Facebook Video Downloader 📥]\n❯ Processing your video...`,
    threadID,
    async () => {
      try {
        const response = await axios.get(
          `https://heru-apiv2.ddnsfree.com/api/anydl?url=${encodeURIComponent(
            link
          )}`
        );
        const data = response.data;

        if (data.content.status && data.content.data.result?.length) {
          // Prioritize HD if available
          const videoData =
            data.content.data.result.find((vid) => vid.quality === "HD") ||
            data.content.data.result[0];

          const videoUrl = videoData.url;
          const fileName = `facebook_video_${Date.now()}.mp4`;
          const filePath = path.join(__dirname, "cache", fileName);

          // Download video
          const videoResponse = await axios({
            url: videoUrl,
            method: "GET",
            responseType: "stream",
          });

          const writer = fs.createWriteStream(filePath);
          videoResponse.data.pipe(writer);

          writer.on("finish", () => {
            api.sendMessage(
              {
                body:
                  `[📥 Facebook Video Downloader 📥]\n` +
                  `❯ Quality: ${videoData.quality}\n` +
                  `❯ Creator: ${
                    data.content.creator || "Unknown"
                  }\n` +
                  `❯ User: ${data.content.data.user || "Unknown"}\n` +
                  `❯ Quoted: ${data.content.data.quoted || "None"}`,
                attachment: fs.createReadStream(filePath),
              },
              threadID,
              () => fs.unlinkSync(filePath),
              messageID
            );
          });

          writer.on("error", () => {
            api.sendMessage(
              "❌ Error occurred while saving the video. Please try again.",
              threadID,
              messageID
            );
          });
        } else {
          api.sendMessage(
            "❌ Unable to fetch the video. The link might be invalid or unsupported.",
            threadID,
            messageID
          );
        }
      } catch (error) {
        api.sendMessage(
          "❌ An error occurred while processing your request.",
          threadID,
          messageID
        );
      }
    }
  );
};
