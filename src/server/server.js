/**
 * Created by mrjoshte on 8/31/2017
 */
//Link dependencies
const {
    PubgAPI,
    PubgAPIErrors,
    REGION,
    SEASON,
    MATCH
} = require('pubg-api-redis');
const playerFile = "../storage/players.json";
const fs = require('fs');
var pubgTrackerAPIKey = '21c941ec-f966-4919-ad40-7976405ca06b';
var bot = require('./bot.js');

// If no Redis configuration it wont be cached
const api = new PubgAPI({
    apikey: pubgTrackerAPIKey,
    /*redisConfig: {
      host: '127.0.0.1',
      port: 6379,
      expiration: 300, // Optional - defaults to 300.
    },*/
});

var getPlayerMap = function() {
	try {
        return JSON.parse(fs.readFileSync(playerFile));
    } catch(e) {
        return new Map();
    }
};

var fetchUpdatedPlayerData = function(savedplayerMap) {
    //This will iterate through all the players
    debugger;

	if(savedplayerMap === {})
		return;
	//console.log(savedplayerMap);
	for(var id in savedplayerMap) {
		//console.log('Player');
		var player = savedplayerMap[id];
		//console.log(player);
		
    //for (var i = 0; i < savedplayerMap.length; i++) {
        //This will fetch the player from the pubg api
        //var player = savedplayerMap[i];
        api.getProfileByNickname(player.pubgName)
            .then((profile) => {
                const data = profile.content;
                Object.keys(MATCH).forEach(function(match) {
                    var matchType = MATCH[match];
                    stats = profile.getStats({
                        region: REGION.NA,
                        match: matchType
                    });
                    //This is where we actually compare the saved vs pulled
					var wins = parseInt(stats.performance.wins);
					var kills = parseInt(stats.combat.kills);
					var damageDealt = parseInt(stats.support.damageDealt);
					
                    if (wins > player.wins[matchType] && !player.init) {
                        //save the new data to send to the server
                        var winner = new Object();
                        winner.id = player.discordName;
                        winner.match = matchType;
                        winner.kills = kills - player.kills[matchType];
                        winner.damage = damageDealt - player.damage[matchType];
                        sendWinToDiscord(winner);
                    }
                    //update the file
                    player.wins[matchType] = wins;
                    player.kills[matchType] = kills;
                    player.damage[matchType] = damageDealt;
                });
				
				// Get the list of players again since this is a async api call
                savedplayerMap = getPlayerMap();
                if (player.init) {
					player.init = false;
                    savedplayerMap[player.discordName] = player;
					writeUpdatedplayerMapToFile(savedplayerMap);
                    bot.newPlayerAdded(player.pubgName);
				}
				else {
					//for (var i = 0; i < savedplayerMap.length; i++) {
						var tempPlayer = savedplayerMap[player.discordName];
                        //if (savedplayerMap[i].discordName === player.discordName) {
							if(JSON.stringify(tempPlayer) !== JSON.stringify(player)){
								savedplayerMap[player.discordName] = player;
								writeUpdatedplayerMapToFile(savedplayerMap);
							}
                       // }
                   // }
                }
            });
    }
};

var writeUpdatedplayerMapToFile = function(playerMap) {
	try {
		fs.writeFile(playerFile, JSON.stringify(playerMap));
	}
	catch(e) {
		console.log("Error writing to player.json");
	}
};

var sendWinToDiscord = function(winner) {
    bot.chickenDinner(winner);
};

module.exports = {
    createNewPlayer: function(discordName, pubgName) {
        //double check that the name of this user isn't in the map already
        var playerMap = getPlayerMap();
		
		var newPlayer = false;
		if(playerMap[discordName] == null)
			newPlayer = true;

        if (newPlayer) {
            debugger;
            api.getProfileByNickname(pubgName)
                .then((profile) => {
                    var player = new Object();
                    player.pubgName = pubgName;
                    player.discordName = discordName;
                    player.wins = {
                        solo: 0,
                        duo: 0,
                        squad: 0
                    };
                    player.kills = {
                        solo: 0,
                        duo: 0,
                        squad: 0
                    };
                    player.damage = {
                        solo: 0,
                        duo: 0,
                        squad: 0
                    };
					player.init = true;
					playerMap[discordName] = player;
                    fetchUpdatedPlayerData(playerMap, true);
                    return true;
                }, function(error) {
                    return false;
                });
        } else {
            return false;
        }
    },
    fetchData: function() {
        fetchUpdatedPlayerData(getPlayerMap(), false);
    }
};