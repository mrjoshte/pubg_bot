/**
 * Created by mrjoshte and eswan95 on 8/31/2017
 */

//Link dependencies
var server = require('./server.js');
var fileUtil = require('./fileUtil.js');
const Discord = require('discord.js');

// Log the bot into discord
var bot = new Discord.Client();
bot.login(fileUtil.readAuthToken());


bot.on("ready", () => {
    console.log("Bot has started.");
});

bot.on("message", (message, channel) => {
	
	// Sets the channel to send messages to
    if (message.content.startsWith("!setchannel")) {
        console.log("Setting channel");
        message.channel.send(message.channel.name + " has been set");
        fileUtil.writeChannel(message.channel);
    }
	
    var channelId = fileUtil.readChannel();
    if (channelId != undefined && message.channel.id === channelId) {
        
		// Add a player to the list of players
		if (message.content.startsWith("!addme ")) {
            console.log("Adding new user");
            if (server.createNewPlayer(message.author.id, message.content.substring(7, message.content.length))) {
                message.channel.send(message.content.substring(7, message.content.length) + " was added successfully!");
            }
        }

		// Get leaderboars stats for a matchtype
        else if (message.content.startsWith("!leaderboard ")) {
            var matchType = message.content.substring(13, message.content.length);
			var isValidMatchType = server.validateMatchType(matchType.toUpperCase());
			if (isValidMatchType == false) {
				bot.channels.get(channelId).send("Incorrect entry. Acceptable leaderboard commands are\n!leaderboard solo, !leaderboard duo, !leaderboard squad");
			}
			else {
				var leader = server.calculateLeaderboard(matchType.toUpperCase());
				if (leader != undefined) {
					var channelId = fileUtil.readChannel();
					var outputMessage = "The current standings for " + matchType + " matches are..\n";
					for (var i = 0; i < leader.wins.id.length; i++) {
						if (i == 0) {
							outputMessage += ' <@' + leader.wins.id[i] + '>';
						} 
						else {
							if (leader.wins.id.length > 2) {
								outputMessage += ', ';
							}
							if (i == leader.wins.id.length - 1) {
								outputMessage += 'and ';
							}
							outputMessage += '<@' + leader.wins.id[i] + '>';
						}
					}
					if (i > 1) {
						outputMessage += ' tied with ' + leader.wins.num + ' win(s),\n';
					} 
					else {
						if (leader.wins.num == 1) {
							outputMessage += ' with ' + leader.wins.num + ' win,\n';
						} 
						else {
							outputMessage += ' with ' + leader.wins.num + ' win,\n';
						}
					}
					outputMessage +='<@' + leader.kills.id + '> ' + ' with ' + leader.kills.num + ' kills, and\n'+
					'<@' + leader.damagePg.id + '> ' + ' with ' + leader.damagePg.num + ' average damage.\n';
				bot.channels.get(channelId).send(outputMessage);
				}
			}
        } 
		
		// Gets the player's stats for a match type
		else if (message.content.startsWith("!stats")) {
            var matchType = message.content.substring(7, message.content.length).toLowerCase();
            var discordUser = message.author.id;
            var channelId = fileUtil.readChannel();
            var player = server.retrieveUpdatedPlayer(discordUser);
			var isValidMatchType = server.validateMatchType(matchType.toUpperCase());
            // Check if player exists to get their stats
			if (player == undefined) {
                bot.channels.get(channelId).send("You do not exist in the system. Please enter '!addme <pubg game name>' to get your stats.");
				return;
            } 
			// Check player parameters
			else if (matchType !== "" && isValidMatchType == false) {
				bot.channels.get(channelId).send("Incorrect entry. Acceptable stats commands are\n!stats, !stats solo, !stats duo, !stats squad");
			}
			// Get the stats
			else{
				var outputMessage = '<@' + player.discordName + '> here are your current stats\n';
				if(matchType === ""){
					outputMessage += 'For solo you have ' +player["solo"].wins+' wins, '+player["solo"].kills+' kills, k/d of '+player["solo"].kd+', and average '+player["solo"].damagePg+' damage.\n';
					outputMessage += 'For duos you have ' +player["duo"].wins+' wins, '+player["duo"].kills+' kills, k/d of '+player["duo"].kd+', and average '+player["duo"].damagePg+' damage.\n';
					outputMessage += 'For squad you have ' +player["squad"].wins+' wins, '+player["squad"].kills+' kills, k/d of '+player["duo"].kd+', and average '+player["squad"].damagePg+' damage.\n';
					}
				else{
					outputMessage += 'For ' + matchType+ ' you have ' +player[matchType].wins+' wins, '+player[matchType].kills+' kills, k/d of '+player[matchType].kd+', and average '+player[matchType].damagePg+' damage.\n';
				}
				bot.channels.get(channelId).send(outputMessage);
            }
        }
    }
});

exports.newPlayerAdded = function(pubgName) {
    var channelId = fileUtil.readChannel();
    bot.channels.get(channelId).send(pubgName + " was succesfully added!");
};

exports.chickenDinner = function(winner) {
    var channelId = fileUtil.readChannel();
    var output = 'Hey @everyone, <@' + winner.id + '>' + " just won a " + winner.match + " game!\n" +
        "He got " + winner.kills + " kills and did " + winner.damage + " damage!";
    //Read gif file here
    var gifLink = fileUtil.getKhaledGif();
    output += "\n" + gifLink;
	
    bot.channels.get(channelId).send(output);
};

// Retrieve player stats every 20 seconds
setInterval(
    function() {
        console.log("Fetching...")
        server.fetchData();
    }, 20000);