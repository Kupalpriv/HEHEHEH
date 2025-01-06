const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { markApi } = require('../api');

module.exports.config = {
    name: 'video',
    version: '1.0.0',
    role: 0,
    hasPrefix: true,
    aliases: [],
    description: 'Search and download YouTube videos',
    usage: 'video [search query]',
    credits: 'churchill',
    cooldown: 5,
};

module.exports.run = async function ({ api, event, args }) {
    const query = args.join(' ');

    if (!query) {
        return api.sendMessage('❌ Please provide a search query.', event.threadID, event.messageID);
    }

    const searchApiUrl = `${markApi}/new/api/youtube?q=${encodeURIComponent(query)}`;

    try {
        const searchResponse = await axios.get(searchApiUrl);
        const videoData = searchResponse.data.response[0];

        if (!videoData) {
            return api.sendMessage('❌ No video found for your query.', event.threadID, event.messageID);
        }

        const videoTitle = videoData.title;
        const videoUrl = videoData.url;
        const downloadApiUrl = `https://yt-video-production.up.railway.app/ytdl?url=${encodeURIComponent(videoUrl)}`;

        const downloadResponse = await axios.get(downloadApiUrl);
        const videoDownloadUrl = downloadResponse.data.video;

        if (!videoDownloadUrl) {
            return api.sendMessage('❌ Unable to download the video. Please try again later.', event.threadID, event.messageID);
        }

        const filePath = path.join(__dirname, `${videoTitle.replace(/[\\/:*?"<>|]/g, '')}.mp4`);
        const videoStream = await axios.get(videoDownloadUrl, { responseType: 'stream' });
        const writer = fs.createWriteStream(filePath);

        videoStream.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        await api.sendMessage(
            {
                body: `🎬 Video Title: ${videoTitle}\n📺 Views: ${videoData.views.toLocaleString()}\n⏱ Duration: ${videoData.duration.timestamp}\n\n🔗 ${videoUrl}`,
                attachment: fs.createReadStream(filePath),
            },
            event.threadID,
            () => fs.unlinkSync(filePath),
            event.messageID
        );
    } catch (error) {
        api.sendMessage('❌ An error occurred while processing your request. Please try again later.', event.threadID, event.messageID);
    }
};
