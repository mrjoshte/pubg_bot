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

var channel;


bot.on("ready", () => {
  console.log("Bot is started.");
});

bot.on("message", (message, channel) => {
	console.log("Messaged detected");
	
	// Add a player to the list of players
	if (message.content.startsWith("!addme ")) {
		console.log("Adding new user");
		if(server.createNewPlayer(message.author.id, message.content.substring(7, message.content.length))){
			message.channel.send(message.content.substring(7, message.content.length) + " was added successfully!");
		}
	}
	
	// Sets the channel to send messages to
	else if (message.content.startsWith("!setchannel")) {
		console.log("Setting channel");
		channel = message.channel;
		message.channel.send(channel.name + " has been set");
		console.log(channel);
	}
});


setInterval(function(){ server.fetchData() }, 20000);

module.exports = 
{
	newPlayerAdded: function(pubgName){
		bot.sendMessage(channel, pubgName + " was succesfully added!");
	},
	chickenDinner: function(winner){
		bot.sendMessage(channel, winner.id + " just won a " + winner.match + " game with " + winner.kills + " and did " winner.damage + " damage!");
	}
}