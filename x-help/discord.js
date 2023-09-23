const fs = require('fs')
const Discord = require('discord.js');
const client = new Discord.Client();
const helper = require('./helper');
const bot = {
commandPrefix: '!',
getClient: client,
login: function () {
    client.login('clentkey');
    console.log("Discord Bot Logging in..");
},
sendChannelMessage: function (id, message) {
    try {
        client.channels.cache.get(id).send(message);
    } catch (err) { console.error("Failed to send discord message"); console.log(err); }
},
addRole: function (serverID, memberID, roleName) {
    let server = client.guilds.cache.get(serverID)
    let memberRole = server.roles.cache.find(role => role.name === roleName)
    let member = server.members.cache.get(memberID)

    member.roles.add(memberRole)
},
addMember: function (serverID, memberID, access_token) {
    client.guilds.cache.get(serverID).addMember(memberID, { accessToken: access_token });
},

}
module.exports = bot;
