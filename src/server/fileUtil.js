const playerFile = "../storage/players.json";
const gifsFile = "../storage/winGifs.json";
const channelFile = "../storage/channel.json";
const authFile = require('../../auth.json');

const fs = require('fs');

module.exports = {
    
	// Read the entire players.json file
    readPlayerMap: function() {
        try {
            return JSON.parse(fs.readFileSync(playerFile));
        } catch (e) {
            // File is empty or invalid
			console.log(e);
			console.log("WARNING: Problem reading players.json. File is either empty or invalid.");
			return new Map();
        }
    },

    // Read a specific player from the players.json file
    readPlayer: function(discordId) {
        try {
            return JSON.parse(fs.readFileSync(playerFile))[discordId];
        } catch (e) {
			// File is empty or invalid
			console.log("WARNING: Problem reading players.json using discordId. File is either empty or invalid.");
            return null;
        }
    },

    // Update the players.json file
    writePlayers: function(playerMap) {
        try {
            // Remove the init value from each player
            for (var id in playerMap) {
                var player = playerMap[id];
                player.init = undefined;
            }
            fs.writeFileSync(playerFile, JSON.stringify(playerMap));
        } catch (e) {
            console.log("Error writing to players.json");
        }
    },

    // Get a DJ Khalid gif
    getKhaledGif: function() {
        try {
			var gifs = JSON.parse(fs.readFileSync(gifsFile));
			var randomNum = Math.floor(Math.random() * (gifs.length - 1));
            return gifs[randomNum];
        } catch (e) {
			console.log("Could not retrieve a DJ Khalid Gif");
            return "Could not retrieve a DJ Khalid Gif";
        }
    },

	// Write to the channel.json file
    writeChannel: function(channel) {
        try {
            // Write to the channel.json file
            fs.writeFile(channelFile, JSON.stringify(channel.id));
        } catch (e) {
            console.log("Error writing to channel.json");
        }
    },
	
	// Read from the channel.json file
    readChannel: function() {
        try {
            return JSON.parse(fs.readFileSync(channelFile));
        } catch (e) {
			console.log("WARNING: Problem reading channel.json. File is either empty or invalid.");
        }
    },
	
	// Read the authorization token for the discord bot
	readAuthToken: function() {
        return authFile.token;
	},
	
	// Read the api key for making pubg api calls
	readApiKey: function() {
        return authFile.apiKey;
	}
}