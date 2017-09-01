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

var getPlayerDataFromAPI = function(player){
	api.getProfileByNickname(player.pubgName)
            .then((profile) => {
                const data = profile.content;
                Object.keys(MATCH).forEach(function(match) {
                    var matchType = MATCH[match];
					try{
						stats = profile.getStats({
							region: REGION.NA,
							match: matchType
						});
						var wins = parseInt(stats.performance.wins);
						var kills = parseInt(stats.combat.kills);
						var damageDealt = parseInt(stats.support.damageDealt);
					}catch(e){
						var wins = 0;
						var kills = 0;
						var damageDealt = 0;
					}
                    //This is where we actually compare the saved vs pulled
					
                    if (!player.init && wins > player.wins[matchType]) {
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
					player.init = 0;
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
		getPlayerDataFromAPI(player);
    //for (var i = 0; i < savedplayerMap.length; i++) {
        //This will fetch the player from the pubg api
        //var player = savedplayerMap[i];
        
    }
};

var initLeader = function(){
	return {wins:{num:0, id:0}, kills:{num:0, id:0}, damage:{num:0, id:0}};;
}

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
					player.init = 1;
					playerMap[discordName] = player;
                    getPlayerDataFromAPI(player);
                    return true;
                }, function(error) {
                    return false;
                });
        } else {
            return false;
        }
    },
    fetchData: function() {
        fetchUpdatedPlayerData(getPlayerMap());
    },
	calculateLeaderboard: function(matchType){
		if(MATCH[matchType] != undefined){
			matchType = matchType.toLowerCase();
			console.log("calculating leaderboard");
			fetchUpdatedPlayerData(getPlayerMap());
			var players = getPlayerMap();
			var leader = initLeader();
			for(id in players){
				var player = players[id];
				if(player.wins[matchType] > leader.wins.num){
					leader.wins.num = player.wins[matchType];
					leader.wins.id = player.discordName;
				}
				if(player.kills[matchType] > leader.kills.num){
					leader.kills.num = player.kills[matchType];
					leader.kills.id = player.discordName;
				}
				if(player.damage[matchType] > leader.damage.num){
					leader.damage.num = player.damage[matchType];
					leader.damage.id = player.discordName;
				}
			}
			return leader;
		}
	}
};