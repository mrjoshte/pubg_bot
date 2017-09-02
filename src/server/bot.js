/**
 * Created by mrjoshte on 8/31/2017
 */
//Link dependencies
var auth = require('../../auth.json');
var server = require('./server.js');
const Discord = require('discord.js');
const fs = require('fs');
const channelFile = "../storage/channel.json";

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
        if (server.createNewPlayer(message.author.id, message.content.substring(7, message.content.length))) {
            message.channel.send(message.content.substring(7, message.content.length) + " was added successfully!");
        }
    }

    // Sets the channel to send messages to
    else if (message.content.startsWith("!setchannel")) {
        console.log("Setting channel");
        channel = message.channel;
        message.channel.send(channel.name + " has been set");
        fs.writeFile(channelFile, JSON.stringify(channel.id), function(err) {
            //something went wrong?
        });
    }
	else if(message.content.startsWith("!leaderboard ")){
		var matchType = message.content.substring(13, message.content.length);
		matchType = matchType.toUpperCase();
		
			var leader = server.calculateLeaderboard(matchType);
			if(leader != undefined){
			var channelId = readChannelFile();
			matchType = matchType.toLowerCase();
			var outputMessage = "The current standings for "+matchType+" matches are..\n";
				for(var i =0; i < leader.wins.id.length; i++){
					if(i == 0){
						outputMessage += ' <@' + leader.wins.id[i] + '>';
					}
					else{
						if(leader.wins.id.length > 2){
							outputMessage += ', ';
						}
						if(i == leader.wins.id.length-1){
							outputMessage+='and ';
						}
						outputMessage+='<@' + leader.wins.id[i] + '>';
					}
				}
				if(i > 1){
					outputMessage += ' tied with ' + leader.wins.num + ' win(s),\n';
				}
				else{
					if(leader.wins.num == 1){
					outputMessage += ' with ' + leader.wins.num + ' win,\n';
					}
					else{
						outputMessage += ' with ' + leader.wins.num + ' win,\n';
					}
				}
				outputMessage +='<@' + leader.kills.id + '> ' + ' with ' + leader.kills.num + ' kills, and\n'+
				'<@' + leader.damage.id + '> ' + ' with ' + leader.damage.num + ' damage.\n';
			bot.channels.get(channelId).send(outputMessage);
			}
	}
	else if(message.content.startsWith("!stats ")){
		var matchType = message.content.substring(7, message.content.length);
		matchType = matchType.toUpperCase();
		var leader = server.calculateLeaderboard(matchType);
	}
});

var readChannelFile = function() {
    return JSON.parse(fs.readFileSync(channelFile));
}


exports.newPlayerAdded = function(pubgName) {
    var channelId = readChannelFile();
    bot.channels.get(channelId).send(pubgName + " was succesfully added!");
};

exports.chickenDinner = function(winner) {
    var channelId = readChannelFile();
    bot.channels.get(channelId).send('Hey @everyone, <@' + winner.id + '>' + " just won a " + winner.match + " game!\n"
	+"He got " + winner.kills + " kills and did " + winner.damage + " damage!");
};

setInterval(
    function() {
        console.log("Starting fetch.")
        server.fetchData();
    }, 100000);