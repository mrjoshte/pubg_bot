const playerFile = "../storage/players.json";
const leaderboardFile = "../storage/leaderboard.json";
const gifsFile = "../storage/winGifs.json";
const channelFile = "../storage/channel.json";
const adminFile = "../storage/admins.json";
const seasonFile = "../storage/season.json";
const authFile = require('../../auth.json');

const fs = require('fs');

module.exports = {
    
	// Update the admins.json file
    writeAdmins: function(adminList) {
        try {
            fs.writeFileSync(adminFile, JSON.stringify(adminList));
        } catch (e) {
            console.log("Error writing to admins.json");
        }
    },
	
	// Read the admins.json file
    readAdmins: function() {
        try {			
            return JSON.parse(fs.readFileSync(adminFile));
        } catch (e) {
            // File is empty or invalid
			console.log(e);
			console.log("WARNING: Problem reading admins.json. File is either empty or invalid.");
			return new Array();
        }
    },
	
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

    readLeaderboard: function(){
        try{
            return JSON.parse(fs.readFileSync(leaderboardFile))
        } catch (e) {  
        // File is empty or invalid
        console.log(e);
        console.log("WARNING: Problem reading leaderboard.json. File is either empty or invalid.");
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

    // Update the leaderboard.json file
    writeLeaderboard: function(leaderboard) {
        try {
            fs.writeFileSync(leaderboardFile, JSON.stringify(leaderboard));
        } catch (e) {
            console.log("Error writing to leaders.json");
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

	// Write to the channel.json file for the stats channel
    writeStatsChannel: function(channel) {
		var file = JSON.parse(fs.readFileSync(channelFile));
		file.statsChannel = channel.id;
        try {
            // Write to the channel.json file
            fs.writeFileSync(channelFile, JSON.stringify(file));
        } catch (e) {
            console.log("Error writing to channel.json for the stats channel");
        }
    },
	
	// Read from the channel.json file for the stats channel
    readStatsChannel: function() {
		try {
            return JSON.parse(fs.readFileSync(channelFile)).statsChannel;
        } catch (e) {
			// File is empty or invalid
			console.log("WARNING: Problem reading channel.json. File is either empty or invalid.");
            return null;
        }
    },
	
	// Write to the channel.json file for the chicken channel
    writeChickenChannel: function(channel) {
		var file = JSON.parse(fs.readFileSync(channelFile));
		file.chickenChannel = channel.id;
		try {
            // Write to the channel.json file
            fs.writeFileSync(channelFile, JSON.stringify(file));
        } catch (e) {
            console.log("Error writing to channel.json for the chicken channel");
        }
    },
	
	
	// Read from the channel.json file for the chicken channel
    readChickenChannel: function() {
		try {
            return JSON.parse(fs.readFileSync(channelFile)).chickenChannel;
        } catch (e) {
			// File is empty or invalid
			console.log("WARNING: Problem reading channel.json using discordId. File is either empty or invalid.");
            return null;
        }
    },
	
	// Read from the season.json file
    readSeason: function() {
		try {
            return JSON.parse(fs.readFileSync(seasonFile)).season;
        } catch (e) {
			// File is empty or invalid
			console.log(e);
			console.log("WARNING: Problem reading season.json. File is either empty or invalid.");
            return null;
        }
    },
	
	// Write to the season.json file
    writeSeason: function(season) {
		var file = JSON.parse(fs.readFileSync(seasonFile));
		file.season = season;
		try {
            // Write to the season.json file
            fs.writeFileSync(seasonFile, JSON.stringify(file));
        } catch (e) {
            console.log("Error writing to season.json");
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