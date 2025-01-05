const axios = require('axios');

module.exports.config = {
    name: "flux1",
    description: "Generate image from fal ai flux pro",
    cooldown: 5,
    aliases: [],
    role: 0,
    hasPrefix: false,
    cooldowns: 5,
    credits: "cliff", //api by samir
    usage: "{p}{n} <query>",
};

module.exports.run = async function ({ api, event, args }) {
    try {
        const { messageID } = event;
        const prompt = args.join(' ');

        if (!prompt) {
            return api.sendMessage('Please provide a prompt', event.threadID, messageID);
        }

        const cliff = await new Promise(resolve => { 
            api.sendMessage(`⌛ 𝖦𝖾𝗇𝖾𝗋𝖺𝗍𝗂𝗇𝗀 ${prompt} 𝗂𝗆𝖺𝗀𝖾...`, event.threadID, (err, info1) => {
                resolve(info1);
            }, event.messageID);
        });

        const apiUrl = `https://www.samirxpikachu.run.place/ArcticFL?prompt=${encodeURIComponent(prompt)}--styles+1`;

        const h = await axios.get(apiUrl, { responseType: 'stream' });

        const message = {
            attachment: h.data,   
        };

        api.unsendMessage(cliff.messageID);

        api.sendMessage(message, event.threadID, event.messageID);
    } catch (error) {
        api.sendMessage(`An error occurred: ${error.message}`, event.threadID);
    }
};