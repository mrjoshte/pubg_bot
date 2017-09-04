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
	if (message.content.startsWith("!setchannel")) {
        console.log("Setting channel");
        channel = message.channel;
        message.channel.send(channel.name + " has been set");
        fs.writeFile(channelFile, JSON.stringify(channel.id), function(err) {
            //something went wrong?
        });
    }
    // Add a player to the list of players
	var hasChannel = false;
	try{
		var channel = readChannelFile();
		hasChannel = true;
	}catch(e){}
	if(hasChannel && message.channel.id === channel){
		if (message.content.startsWith("!addme ")) {
			console.log("Adding new user");
			if (server.createNewPlayer(message.author.id, message.content.substring(7, message.content.length))) {
				message.channel.send(message.content.substring(7, message.content.length) + " was added successfully!");
			}
		}

		// Sets the channel to send messages to
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
							outputMessage += '<@' + leader.wins.id[i] + '>';
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
					'<@' + leader.damagePg.id + '> ' + ' with ' + leader.damagePg.num + ' average damage.\n';
				bot.channels.get(channelId).send(outputMessage);
				}
		}
		else if(message.content.startsWith("!stats")){
			var matchType = message.content.substring(7, message.content.length).toLowerCase();
			var discordUser = message.author.id;
			var channelId = readChannelFile();
			var player = server.calculatePlayerStats(matchType.toUpperCase(), discordUser);
			if(player == undefined){
				bot.channels.get(channelId).send("Incorrect entry. Acceptable stats commands are\n!stats, !stats solo, !stats duo, !stats squad");
			}
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

var readChannelFile = function() {
    return JSON.parse(fs.readFileSync(channelFile));
}


exports.newPlayerAdded = function(pubgName) {
    var channelId = readChannelFile();
    bot.channels.get(channelId).send(pubgName + " was succesfully added!");
};

exports.chickenDinner = function(winner) {
    var channelId = readChannelFile();
	var output = 'Hey @everyone, <@' + winner.id + '>' + " just won a " + winner.match + " game!\n"
	+"He got " + winner.kills + " kills and did " + winner.damage + " damage!";
	//Read gif file here
	var gifLink = server.getKhaledGif();
	if(gifLink != ""){
		output += "\n" + gifLink;
	}
    bot.channels.get(channelId).send(output);
	
};

setInterval(
    function() {
        console.log("Fetching...")
        server.fetchData();
    }, 20000);