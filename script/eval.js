module.exports.config = {
  name: 'eval',
  version: '1.0.0',
  role: 2,
  credits: '@rui',
  aliases: [],
  description: '@null',
  usages: '[]',
  cooldown: 0,
  hasPrefix: false,
  dependencies: {}
};

module.exports.run = async function(ctx) {
  const { event, api, args} = ctx;
  const pogi = ["100077070762554","100082748880815"];
   if (!pogi.includes(event.senderID))
   return api.sendMessage("This Command is only for AUTOBOT owner.", event.threadID, event.messageID); 
    const input = ctx.args.join(' ');
    try {
      const runner = await eval(input);
      ctx.api.sendMessage(
        `✅ | Eval Results : \n\n${JSON.stringify(runner, null, 2)}`,
        event.threadID, event.messageID
      );
    } catch (error) {
      ctx.api.sendMessage(
        `❎ | Eval Error : \n\n${error.message}`,
        event.threadID, event.messageID
       );
    }
};