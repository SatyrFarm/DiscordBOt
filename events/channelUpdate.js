// This event executes when a message is deleted
const Discord = require('discord.js');

function parseChange(message) {
  if (!message) {
    return message;
  }
  return message
    .replace(/_/g, ' ');
}

// FUTURE: This will help parse the permissions when added
/*
function permissionParser(oldArr) {
  let newArr = [];
  oldArr.forEach((perm) => {
    let obj = {
      deny,
      type,
      id,
      allow,
    };
    newArr.push(obj);
  });
  return newArr;
}
*/

module.exports = async (client, channel) => {
  // console.log(channel);

  const logs = channel
    .guild
    .channels
    .find('name', 'logging');

  const entry = await channel
    .guild
    .fetchAuditLogs({type: 'CHANNEL_UPDATE'})
    .then((audit) => audit.entries.first());

  /*
    NOTE: These are the basic parts of the entry object
    User: entry.executor
    Changes: entry.changes array
    Channel ID: entry.id
    Channel Type: entry.target.type
    Channel Name: entry.target.name
    */

  // NOTE: If the changes are permission changes then its another array of objects

  let thingsChanged = [];

  entry
    .changes
    .forEach((change) => {
      change.key = parseChange(change.key);
      change.old = parseChange(change.old);

      thingsChanged.push(change);
    });

  const embed = new Discord
    .RichEmbed()
    .setTitle('Channel Update')
    .setAuthor(client.user.username, client.user.avatarURL)
    .setColor(0xfaff52);
  embed.addField('User', entry.executor.username + '#' + entry.executor.discriminator);
  embed.addField('Channel Type', entry.target.type);
  embed.addField('Channel Name', entry.target.name);

  let n = 0;
  thingsChanged.forEach((change) => {
    n++;

    // NOTE: Ugly way to check if is permission overwrites
    if (change.new.length > 0 && !entry.target.name == change.new) {
      // FUTURE: Add permission changes
      embed.addField('Change #' + n, `Permissions Changed` || 'Error');
    } else {
      embed.addField('Change #' + n, `${change.key} \nOld: ${change.old} \nNew: ${change.new}` || 'Error');
    }
  });

  let currentdate = new Date();
  let datetime = currentdate.getDate() + '/' + (currentdate.getMonth() + 1) + '/' + currentdate.getFullYear() + ' @ ' + currentdate.getHours() + ':' + currentdate.getMinutes() + ':' + currentdate.getSeconds();

  embed.addField('Time', datetime);

  logs.send(embed);
};
