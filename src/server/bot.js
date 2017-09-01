/**
 * Created by mrjoshte on 8/31/2017
 */
//Link dependencies
var auth = require('../../auth.json');
var server = require('./server.js');
const Discord = require('discord.js');

var bot = new Discord.Client();
debugger;
bot.login(auth.token);
var channel = bot.get("servers");

bot.on("ready", () => {
  console.log("Bot is started.");
});

bot.on("message", (message, channel) => {
	console.log("Messaged detected");
	if (message.content.startsWith("!addme ")) {
		console.log("Adding new user");
		if(server.createNewPlayer(message.author.id, message.content.substring(7, message.content.length))){
			message.channel.send(message.content.substring(7, message.content.length) + " was added successfully!");
		}
	}
});
module.exports = 
{
	newPlayerAdded: function(pubgName){
		bot.sendMessage(channel, "Hello");
	}
}