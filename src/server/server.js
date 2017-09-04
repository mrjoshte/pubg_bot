/**
 * Created by mrjoshte and eswan95 on 8/31/2017
 */
 
//Link dependencies
var fileUtil = require('./fileUtil.js');
var bot = require('./bot.js');
var pubgTrackerAPIKey = fileUtil.readApiKey();

const {
    PubgAPI,
    PubgAPIErrors,
    REGION,
    SEASON,
    MATCH
} = require('pubg-api-redis');

// If no Redis configuration it wont be cached
const api = new PubgAPI({
    apikey: pubgTrackerAPIKey,
});

// Send a chicken dinner message to discord
var sendWinToDiscord = function(winner) {
    bot.chickenDinner(winner);
};

// Collect data from the pubg api
var getPlayerDataFromAPI = function(player){
	api.getProfileByNickname(player.pubgName)
            .then((profile) => {
                const data = profile.content;
                Object.keys(MATCH).forEach(function(match) {
                    var matchType = MATCH[match];
					var stats;
					try{
						stats = profile.getStats({
							region: REGION.NA,
							match: matchType
						});
						var kills = parseInt(stats.combat.kills);
						var damagePg = parseInt(stats.perGame.damagePg);
						var roundMostKills = parseInt(stats.combat.roundMostKills);
						var suicides = parseInt(stats.combat.suicides);
						var teamKills = parseInt(stats.combat.teamKills);
						var headshots = parseInt(stats.combat.headshotKills);
						
						var wins = parseInt(stats.performance.wins);
						var kd = parseFloat(stats.performance.killDeathRatio);
						var topTonRatio = parseFloat(stats.performance.top10Ratio);
						var winRatio = parseFloat(stats.performance.winRatio);
						var losses = parseInt(stats.performance.losses);
						
						var longestKill = parseFloat(stats.distance.longestKill);
						var damageDealt = parseInt(stats.support.damageDealt);
						
					}catch(e){
						var kills = 0;
						var damagePg = 0;
						var roundMostKills = 0;
						var suicides = 0;
						var teamKills = 0;
						var headshots = 0;
						
						var wins = 0;
						var kd = 0;
						var topTonRatio = 0;
						var winRatio = 0;
						var losses = 0;
						
						var longestKill = 0;
						var damageDealt = 0;
					}
                    
					
                    if (!player.init && wins > player[matchType].wins) {
                        //save the new data to send to the server
                        var winner = new Object();
                        winner.id = player.discordName;
                        winner.match = matchType;
                        winner.kills = kills - player[matchType].kills;
                        winner.damage = damageDealt - player[matchType].damage;
                        sendWinToDiscord(winner);
                    }
                    //update the file
                    player[matchType].kills = kills;
					player[matchType].damagePg = damagePg;
					player[matchType].roundMostKills = roundMostKills;
                    player[matchType].suicides = suicides;
                    player[matchType].teamKills = teamKills;
                    player[matchType].headshots = headshots;
                    player[matchType].wins = wins;
                    player[matchType].kd = kd;
                    player[matchType].topTonRatio = topTonRatio;
                    player[matchType].winRatio = winRatio;
                    player[matchType].losses = losses;
                    player[matchType].longestKill = longestKill;
                    player[matchType].damage = damageDealt;					
                });
				
				// Get the list of players again since this is a async api call
                savedplayerMap = fileUtil.readPlayerMap();
                if (player.init) {
					player.init = 0;
                    savedplayerMap[player.discordName] = player;
					fileUtil.writePlayers(savedplayerMap);
                    bot.newPlayerAdded(player.pubgName);
				}
				else {
					var tempPlayer = savedplayerMap[player.discordName];
					if(JSON.stringify(tempPlayer) !== JSON.stringify(player)){
						savedplayerMap[player.discordName] = player;
						console.log("Updating "+player.pubgName+"'s");
						fileUtil.writePlayers(savedplayerMap);
					}
                }
            });
}

// This will iterate through all the players and get their pubg data
var fetchUpdatedPlayerData = function(savedplayerMap) {
    debugger;

	for(var id in savedplayerMap) {
		var player = savedplayerMap[id];
		getPlayerDataFromAPI(player);
    }
};

// Create a blank slate player to compare against
var initLeader = function(){
	return {wins:{num:-1, id:[]}, kills:{num:-1, id:0}, damagePg:{num:-1, id:0}};;
}

var initPlayer = function(discordName, pubgName){
	var player = new Object();
	player.pubgName = pubgName;
	player.discordName = discordName;
	Object.keys(MATCH).forEach(function(match) {
		var matchType = MATCH[match];
		player[matchType] = {
			kills: 0,
			damagePg: 0,
			roundMostKills: 0,
			suicides: 0,
			teamKills: 0,
			headshots: 0,
			wins: 0,
			kd: 0,
			topTonRatio: 0,
			winRatio: 0,
			losses: 0,
			longestKill: 0,
			damage: 0,
		}
	});
	player.init = 1;
	return player;
}

module.exports = {
    createNewPlayer: function(discordName, pubgName) {
        //double check that the name of this user isn't in the map already
        var playerMap = fileUtil.readPlayerMap();
		
		var newPlayer = false;
		if(playerMap[discordName] == null)
			newPlayer = true;

        if (newPlayer) {
            debugger;
            api.getProfileByNickname(pubgName)
                .then((profile) => {
                    var player = initPlayer(discordName, pubgName);
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
        fetchUpdatedPlayerData(fileUtil.readPlayerMap());
    },
	calculateLeaderboard: function(matchType){
		if(MATCH[matchType] != undefined){
			matchType = matchType.toLowerCase();
			console.log("Calculating leaderboard");
			fetchUpdatedPlayerData(fileUtil.readPlayerMap());
			var players = fileUtil.readPlayerMap();
			var leader = initLeader();
			var count = 0;
			for(id in players){
				var player = players[id];
				if(player[matchType].wins > leader.wins.num){
					leader.wins.num = player[matchType].wins;
					leader.wins.id = [];
					count = 0;
					leader.wins.id[count] = player.discordName;
					count++;
				}
				else if(player[matchType].wins == leader.wins.num){
					leader.wins.num = player[matchType].wins;
					leader.wins.id[count] = player.discordName;
					count++;
				}
				if(player[matchType].kills > leader.kills.num){
					leader.kills.num = player[matchType].kills;
					leader.kills.id = player.discordName;
				}
				if(player[matchType].damagePg > leader.damagePg.num){
					leader.damagePg.num = player[matchType].damagePg;
					leader.damagePg.id = player.discordName;
				}
			}
			return leader;
		}
	}, 
	retrieveUpdatedPlayer: function(discordUser){
		fetchUpdatedPlayerData(fileUtil.readPlayerMap());
		var player = fileUtil.readPlayer(discordUser);
		if(player != null){			
			console.log("Retrieved " + player.pubgName + "'s stats");
			return player;
		}
		return undefined;
	},	
	validateMatchType: function(matchType){
		return MATCH[matchType] != undefined;
	}
};