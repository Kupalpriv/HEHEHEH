const fs = require('fs-extra');
const path = require('path');

module.exports.config = {
  name: "update_noti",
  version: "69",
  credits: "cliff",
  description: "autogreet"
};

async function getData(threadID) {
  const filePath = path.join(__dirname, `/cache/${threadID}.json`);
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  }
  return { threadInfo: { adminIDs: [], nicknames: {}, threadName: "", threadIcon: "", threadColor: "" } };
}

async function setData(threadID, data) {
  const filePath = path.join(__dirname, `/cache/${threadID}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

module.exports.handleEvent = async function({ event, api }) {
  async function getUserNames(api, uid) {
    try {
      const userInfo = await api.getUserInfo([uid]);
      return Object.values(userInfo).map(user => user.name || `User${uid}`);
    } catch (error) {
      api.sendMessage('Error getting user names:', error);
      return [];
    }
  }

  const { author, threadID, logMessageType, logMessageData, logMessageBody, eventType } = event;
  const threadInfo = await api.getThreadInfo(threadID);
  const iconPath = path.join(__dirname, "cache", "emoji.json");
  if (!fs.existsSync(iconPath)) fs.writeFileSync(iconPath, JSON.stringify({}));
  if (author === threadID) return;

  try {
    let dataThread = (await getData(threadID)).threadInfo;

    switch (logMessageType) {
      case "log:thread-admins": {
        if (logMessageData.ADMIN_EVENT === "add_admin") {
          dataThread.adminIDs.push({ id: logMessageData.TARGET_ID });
          const name = await getUserNames(api, logMessageData.TARGET_ID);
          api.sendMessage(`[ GROUP UPDATE ]\n❯ USER ${name} became a group admin`, threadID);
        } else if (logMessageData.ADMIN_EVENT === "remove_admin") {
          dataThread.adminIDs = dataThread.adminIDs.filter(item => item.id !== logMessageData.TARGET_ID);
          api.sendMessage(`[ GROUP UPDATE ]\n❯ Removed admin rights for user ${logMessageData.TARGET_ID}`, threadID);
        }
        break;
      }
      case "log:user-nickname": {
        const { participant_id, nickname } = logMessageData;
        if (participant_id && nickname) {
          dataThread.nicknames = dataThread.nicknames || {};
          dataThread.nicknames[participant_id] = nickname;
          const participantName = await getUserNames(api, participant_id);
          const formattedNickname = nickname || "deleted nickname";
          api.sendMessage(`[ GROUP UPDATE ]\n❯ Updated nickname for ${participantName}: ${formattedNickname}.`, threadID);
        }
        break;
      }
      case "log:thread-name": {
        dataThread.threadName = logMessageData.name || null;
        api.sendMessage(`[ GROUP UPDATE ]\n❯ ${(dataThread.threadName) ? `Updated Group Name to: ${dataThread.threadName}` : 'Cleared the Group Name'}.`, threadID);
        break;
      }
      case "log:thread-icon": {
        const preIcon = JSON.parse(fs.readFileSync(iconPath));
        dataThread.threadIcon = logMessageData.thread_icon || "👍";
        api.sendMessage(`[ GROUP UPDATE ]\n❯ ${logMessageBody.replace("emoji", "icon")}\n❯ Original Emoji: ${preIcon[threadID] || "unknown"}`, threadID, async (error, info) => {
          preIcon[threadID] = dataThread.threadIcon;
          fs.writeFileSync(iconPath, JSON.stringify(preIcon));
          await new Promise(resolve => setTimeout(resolve, 5000));
          return api.unsendMessage(info.messageID);
        });
        break;
      }
      case "log:thread-call": {
        if (logMessageData.event === "group_call_started") {
          const name = await getUserNames(api, logMessageData.caller_id);
          api.sendMessage(`[ GROUP UPDATE ]\n❯ ${name} STARTED A ${(logMessageData.video) ? 'VIDEO ' : ''}CALL.`, threadID);
        } else if (logMessageData.event === "group_call_ended") {
          const callDuration = logMessageData.call_duration;
          const hours = Math.floor(callDuration / 3600);
          const minutes = Math.floor((callDuration - (hours * 3600)) / 60);
          const seconds = callDuration - (hours * 3600) - (minutes * 60);
          const timeFormat = `${hours}:${minutes}:${seconds}`;
          api.sendMessage(`[ GROUP UPDATE ]\n❯ ${(logMessageData.video) ? 'Video' : ''} call has ended.\n❯ Call duration: ${timeFormat}`, threadID);
        } else if (logMessageData.joining_user) {
          const name = await getUserNames(api, logMessageData.joining_user);
          api.sendMessage(`❯ [ GROUP UPDATE ]\n❯ ${name} Joined the ${(logMessageData.group_call_type == '1') ? 'Video' : ''} call.`, threadID);
        }
        break;
      }
      case "log:link-status": {
        api.sendMessage(logMessageBody, threadID);
        break;
      }
      case "log:magic-words": {
        api.sendMessage(`» [ GROUP UPDATE ] Theme ${logMessageData.magic_word} added effect: ${logMessageData.theme_name}\nEmoji: ${logMessageData.emoji_effect || "No emoji"}\nTotal ${logMessageData.new_magic_word_count} word effect added`, threadID);
        break;
      }
      case "log:thread-poll": {
        if (logMessageData.event_type === "question_creation" || logMessageData.event_type === "update_vote") {
          api.sendMessage(logMessageBody, threadID);
        }
        break;
      }
      case "log:thread-approval-mode": {
        api.sendMessage(logMessageBody, threadID);
        break;
      }
      case "log:thread-color": {
        dataThread.threadColor = logMessageData.thread_color || "🌤";
        api.sendMessage(`[ GROUP UPDATE ]\n❯ ${logMessageBody.replace("Theme", "color")}`, threadID, async (error, info) => {
          await new Promise(resolve => setTimeout(resolve, 5000));
          return api.unsendMessage(info.messageID);
        });
        break;
      }
    }

    await setData(threadID, { threadInfo: dataThread });
  } catch (error) {
    console.error();
  }
};