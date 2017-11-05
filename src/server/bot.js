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
	
	var statChannelId = fileUtil.readStatsChannel();
	var chickenChannelId = fileUtil.readChickenChannel();
	
	// Sets the stats channel to send messages to
    if (message.content.startsWith("!setstatschannel")) {
        let adminList = fileUtil.readAdmins();
		if (adminList.indexOf(message.author.id) == -1) {
			console.log("Error setting channel. Request is not from an admin.");
			message.channel.send("Error setting channel. Request is not from an admin.");
			return;
		}
		
		statChannelId = message.channel.id;
		console.log("Setting stats channel");
        message.channel.send(message.channel.name + " has been set as the stats channel.");
        fileUtil.writeStatsChannel(message.channel);
    }
	
	// Sets the chicken channel to send messages to
    else if (message.content.startsWith("!setchickenchannel")) {
        let adminList = fileUtil.readAdmins();
		if (adminList.indexOf(message.author.id) == -1) {
			console.log("Error setting channel. Request is not from an admin.");
			message.channel.send("Error setting channel. Request is not from an admin.");
			return;
		}
		
		console.log("Setting chicken channel");
		chickenChannelId = message.channel.id;
        message.channel.send(message.channel.name + " has been set as the chicken winners channel.");
        fileUtil.writeChickenChannel(message.channel);
    }
	
	// Add a new admin (Admin required)
	else if (message.content.startsWith("!addadmin ")) {
		console.log(message.content.substring(12, message.content.length - 1));
        if (server.addAdmin(message.author.id, message.content.substring(12, message.content.length - 1))) {
            message.channel.send("Successfully added new admin: " + message.content.substring(10, message.content.length - 1) + ">");
        }
    }
    
	// Get the currently set channels
	if (message.content.startsWith("!getchannels")) {
        message.channel.send("Stats channel: " + (bot.channels.get(statChannelId) === undefined ? "Not set." : bot.channels.get(statChannelId).name));
        message.channel.send("Chicken dinners channel: " + (bot.channels.get(chickenChannelId) === undefined ? "Not set." : bot.channels.get(chickenChannelId).name));
    }
	
    if (statChannelId !== undefined && message.channel.id === statChannelId) {
        
		// Add a player to the list of players
		if (message.content.startsWith("!addme ")) {
            if (server.createNewPlayer(message.author.id, message.content.substring(7, message.content.length))) {
                message.channel.send(message.content.substring(7, message.content.length) + " was added successfully!");
            }
        }
		
		// Remove a player from the players.json (Admin required)
		if (message.content.startsWith("!removeplayer ")) {
            if (server.removePlayer(message.author.id, message.content.substring(14, message.content.length))) {
                message.channel.send(message.content.substring(7, message.content.length) + " was removed successfully!");
            }
        }
		
		// Get leaderboars stats for a matchtype
        if (message.content.startsWith("!leaderboard ")) {
            var matchType = message.content.substring(13, message.content.length);
			var isValidMatchType = server.validateMatchType(matchType.toUpperCase());
			if (isValidMatchType == false) {
				bot.channels.get(statChannelId).send("Incorrect entry. You must enter !leaderboard <matchType>\n" + 
				"Valid match types: " + server.retrieveMatchTypesList());
			}
			else {
				var leader = server.calculateLeaderboard(matchType.toUpperCase());
				if (leader !== undefined) {
					var outputMessage = "The current standings for " + matchType + " matches are..\n";
					for (var i = 0; i < leader.wins.id.length; i++) {
						if (i == 0) {
							outputMessage += '<@' + leader.wins.id[i] + '> ';
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
					bot.channels.get(statChannelId).send(outputMessage);
				}
			}
		}
        if (message.content.startsWith("!leaderboard")) {
			var leaderboard = fileUtil.readLeaderboard();
			var outputMessage = "```";
			for(var stat in leaderboard){
				if(leaderboard[stat].player.length > 1){
					outputMessage += leaderboard[stat].plainText + ":	";
					for(var index in leaderboard[stat].player){
						outputMessage += leaderboard[stat].player[index] + " and ";
					}
					outputMessage = outputMessage.substr(0, outputMessage.length - 5);
					outputMessage += " are tied with " + leaderboard[stat].value + " in game modes ";
					for(var indextwo in leaderboard[stat].player){
						outputMessage += leaderboard[stat].matchType[indextwo] + ", ";
					}
					outputMessage = outputMessage.substr(0, outputMessage.length - 2) + " repectively\n";
				}
				else{
					outputMessage += leaderboard[stat].plainText + " :	" + leaderboard[stat].player[0] + " with "+ leaderboard[stat].value+" in "+leaderboard[stat].matchType[0]+"\n";
				}
			}
			bot.channels.get(statChannelId).send(outputMessage+"```");
		} 
		
		// Gets the player's stats for a match type
		if (message.content.startsWith("!stats")) {
            var matchType = message.content.substring(7, message.content.length).toLowerCase();
            var discordUser = message.author.id;
            var player = server.retrieveUpdatedPlayer(discordUser);
			var isValidMatchType = server.validateMatchType(matchType.toUpperCase());
            // Check if player exists to get their stats
			if (player === undefined) {
                bot.channels.get(statChannelId).send("You do not exist in the system. Please enter '!addme <pubg game name>' to get your stats.");
				return;
            } 
			// Check player parameters
			else if (matchType !== "" && isValidMatchType == false) {
				bot.channels.get(statChannelId).send("Incorrect entry. \n\n" + 
				"You must enter !stats <matchType>\n" + 
				"Valid match types: " + server.retrieveMatchTypesList() + "\n" + 
				"<matchType> is optional");
			}
			// Get the stats
			else{
				var outputMessage = '<@' + player.discordName + '> here are your current stats\n';
				if(matchType === ""){
					var matchTypes = server.retrieveMatchTypes();
					for(type in matchTypes){
						if(type !== "DEFAULT")
							outputMessage += "For " + matchTypes[type] + " you have " +player[matchTypes[type]].wins+" wins, "+player[matchTypes[type]].kills+" kills, k/d of "+player[matchTypes[type]].kd+", and an average "+player[matchTypes[type]].damagePg+" damage.\n";
					}
				}
				else{
					outputMessage += 'For ' + matchType+ ' you have ' +player[matchType].wins+' wins, '+player[matchType].kills+' kills, k/d of '+player[matchType].kd+', and average '+player[matchType].damagePg+' damage.\n';
				}
				bot.channels.get(statChannelId).send(outputMessage);
            }
        }
		
		// Returns the commands this bot can do
		if (message.content.startsWith("!help")) {
			var helpMessage = "Current bot commands: \n\n" +
			"!addme <pubg game name> - Add yourself to the system to get your stats\n" +
			"!stats <match type> - Get your own stats for a match type. No match type will give you all your stats\n" +
			"!leaderboard <match type> - Find out who the leader is for a match type. Match type required\n" +
			"!getchannels - Returns the names of the set channels\n\n";
			"Match types: " + server.retrieveMatchTypesList();
			
			let adminList = fileUtil.readAdmins();
			if (adminList.indexOf(message.author.id) != -1) {
				helpMessage += "\n\nADMIN TOOLS\n" +
				"!addadmin @discordname - Add an admin to the list of admins\n" +
				"!removeplayer <pubgName> - Removes a player from the players list\n" + 
				"!setstatschannel - Sets the channel where stats can be requested\n" + 
				"!setchickenchannel - Sets the channel where chicken dinners will be recorded";
			}
		
			bot.channels.get(statChannelId).send(helpMessage);
			return;
		}
    }

	// Check if the chicken channel is set
	if (message.content.startsWith("!") && bot.channels.get(chickenChannelId) === undefined) {
		message.channel.send("The chicken winner channel has not been set yet. Please notify an admin.");
	}
	// Check if the stats channel is set
	if (message.content.startsWith("!") && bot.channels.get(statChannelId) === undefined) {
		message.channel.send("The stats channel has not been set yet. Please notify an admin.");
	}	
});

exports.sendMessage = function(message) {
    var statChannelId = fileUtil.readStatsChannel();
	if (statChannelId !== undefined && bot.channels.get(statChannelId) !== undefined)
		bot.channels.get(statChannelId).send(message);
};

exports.newPlayerAdded = function(pubgName) {
    var statChannelId = fileUtil.readStatsChannel();
	if (statChannelId !== undefined && bot.channels.get(statChannelId) !== undefined)
		bot.channels.get(statChannelId).send(pubgName + " was succesfully added!");
};

exports.chickenDinner = function(winner) {
    var chickenChannelId = fileUtil.readChickenChannel();
    var output = 'Hey @everyone, <@' + winner.id + '>' + " just won a " + winner.match + " game!\n" +
        "He got " + winner.kills + " kills and did " + winner.damage + " damage!";
    //Read gif file here
    var gifLink = fileUtil.getKhaledGif();
    output += "\n" + gifLink;
	
	if (chickenChannelId !== undefined && bot.channels.get(chickenChannelId) !== undefined)
		bot.channels.get(chickenChannelId).send(output);
};

// Retrieve player stats every 1 min 40 seconds
setInterval(
    function() {
        //console.log("Fetching...")
        server.fetchData();
    }, 100000);
setInterval(
	function() {
		var currentLeaderboard = server.detectLeaderboardDifference(server.calculateFullLeaderboard());
		if (JSON.stringify(fileUtil.readLeaderboard()) !== JSON.stringify(currentLeaderboard)) {
			fileUtil.writeLeaderboard(currentLeaderboard);
		}
	}, 300000);
