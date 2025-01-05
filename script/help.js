module.exports.config = {
  name: 'help',
  version: '1.1.0',
  role: 0,
  hasPrefix: true,
  aliases: ['guide', 'assist'],
  description: "Display all available commands or guide for a specific command",
  usage: "help [all/page/command]",
  credits: 'churchill',
  commandsPerPage: 10
};

module.exports.run = async function ({ api, event, enableCommands, args, prefix }) {
  const input = args.join(' ').toLowerCase();
  try {
    const commands = enableCommands[0].commands;
    const commandsPerPage = module.exports.config.commandsPerPage;
    const totalCommands = commands.length;

    let helpMessage = '';

    if (input === 'all') {
      helpMessage += `✨ 𝗔𝗹𝗹 𝗔𝘃𝗮𝗶𝗹𝗮𝗯𝗹𝗲 𝗖𝗼𝗺𝗺𝗮𝗻𝗱𝘀\n━━━━━━━━━━━━━━━\n`;

      commands.forEach(cmd => {
        helpMessage += `⊂⊃ ➤ ${prefix}${cmd}\n`;
      });

      helpMessage += `━━━━━━━━━━━━━━━\n⊂⊃ ➤ 𝗧𝗼𝘁𝗮𝗹 𝗖𝗼𝗺𝗺𝗮𝗻𝗱𝘀: ${totalCommands}\n\n📌 𝗧𝘆𝗽𝗲 "${prefix}help [command]" for detailed usage.`;
    } else if (!input || !isNaN(input)) {
      const page = parseInt(input) || 1;
      const totalPages = Math.ceil(totalCommands / commandsPerPage);

      if (page < 1 || page > totalPages) {
        api.sendMessage('Invalid page number.', event.threadID, event.messageID);
        return;
      }

      const start = (page - 1) * commandsPerPage;
      const end = Math.min(start + commandsPerPage, totalCommands);

      helpMessage += `✨ 𝗖𝗼𝗺𝗺𝗮𝗻𝗱 𝗟𝗶𝘀𝘁 (𝗣𝗮𝗴𝗲 ${page} of ${totalPages})\n━━━━━━━━━━━━━━━\n`;

      for (let i = start; i < end; i++) {
        helpMessage += `⊂⊃ ➤ ${prefix}${commands[i]}\n`;
      }

      helpMessage += `━━━━━━━━━━━━━━━\n⊂⊃ ➤ 𝗧𝗼𝘁𝗮𝗹 𝗖𝗼𝗺𝗺𝗮𝗻𝗱𝘀: ${totalCommands}\n\n📌 𝗧𝘆𝗽𝗲 "${prefix}help all" to see all commands.\n📌 𝗧𝘆𝗽𝗲 "${prefix}help [command]" for detailed usage.`;
    } else {
      const command = commands.find(cmd => cmd.toLowerCase() === input);
      if (command) {
        helpMessage += `✨ 𝗛𝗲𝗹𝗽 𝗳𝗼𝗿 𝗖𝗼𝗺𝗺𝗮𝗻𝗱: ${prefix}${command}\n━━━━━━━━━━━━━━━\nDescription: ${command.description || 'No description provided.'}\nUsage: ${command.usage || 'No usage provided.'}\n━━━━━━━━━━━━━━━`;
      } else {
        helpMessage = `Command "${input}" not found. Use "${prefix}help all" to see all commands.`;
      }
    }

    await api.sendMessage(helpMessage, event.threadID, event.messageID);
  } catch (error) {
    console.error(error);
    api.sendMessage('An error occurred while processing the help command.', event.threadID, event.messageID);
  }
};

module.exports.handleEvent = async function ({ api, event, prefix }) {
  const { threadID, messageID, body } = event;

  const message = prefix
    ? `🤖 𝗖𝗵𝗮𝘁𝗯𝗼𝘁 𝗽𝗿𝗲𝗳𝗶𝘅 ➠ 【 ${prefix} 】`
    : "🤖 𝗖𝗵𝗮𝘁𝗯𝗼𝘁 𝗽𝗿𝗲𝗳𝗶𝘅 ➠ 【 𝙽𝙾𝙽𝙴-𝙿𝚁𝙴𝙵𝙸𝚇 】";

  if (body?.toLowerCase().startsWith('prefix')) {
    api.sendMessage(message, threadID, messageID);
  }

  if (body?.toLowerCase().startsWith('help all')) {
    api.sendMessage(
      `Typing "${prefix}help all" displays all available commands.`,
      threadID,
      messageID
    );
  }
};
