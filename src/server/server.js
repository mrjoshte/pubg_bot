/**
 * Created by mrjoshte and eswan95 on 8/31/2017
 */

//Link dependencies
const fileUtil = require('./fileUtil.js');
const bot = require('./bot.js');
const pubgTrackerAPIKey = fileUtil.readApiKey();

const {
    PubgAPI,
    REGION,
    MATCH
} = require('pubg-api-redis');

// If no Redis configuration it wont be cached
/**
   @property {function}  getProfileByNickname
 */
const api = new PubgAPI({
    apikey: pubgTrackerAPIKey,
});

// Collect data from the pubg api
const getPlayerDataFromAPI = function (player) {
    try {
        api.getProfileByNickname(player.pubgName)
            .then(function (profile) {
                Object.keys(MATCH).forEach(function (match) {
                    let matchType = MATCH[match];
                    let kills = 0;
                    let damagePg = 0;
                    let roundMostKills = 0;
                    let suicides = 0;
                    let teamKills = 0;
                    let headshots = 0;

                    let wins = 0;
                    let kd = 0;
                    let topTenRatio = 0;
                    let winRatio = 0;
                    let losses = 0;

                    let longestKill = 0;
                    let damageDealt = 0;
                    try {
                        /**
                         * @property combat
                         * @property combat.headshotKills
                         * @property perGame
                         * @property performance
                         * @property performance.killDeathRatio
                         * @property performance.top10Ratio
                         * @property distance.top10Ratio
                         * @property support.damageDealt
                         */
                        const stats = profile.getStats({
                            region: REGION.NA,
                            match: matchType
                        });

                        kills = parseInt(stats.combat.kills);
                        damagePg = parseInt(stats.perGame.damagePg);
                        roundMostKills = parseInt(stats.combat.roundMostKills);
                        suicides = parseInt(stats.combat.suicides);
                        teamKills = parseInt(stats.combat.teamKills);
                        headshots = parseInt(stats.combat.headshotKills);

                        wins = parseInt(stats.performance.wins);
                        kd = parseFloat(stats.performance.killDeathRatio);
                        topTenRatio = parseFloat(stats.performance.top10Ratio);
                        winRatio = parseFloat(stats.performance.winRatio);
                        losses = parseInt(stats.performance.losses);

                        longestKill = parseFloat(stats.distance.longestKill);
                        damageDealt = parseInt(stats.support.damageDealt);

                    } catch (e) {
                    }

                    // Check if the player has any new wins
                    if (!player.init && wins > player[matchType].wins) {
                        let winner = {};
                        winner.id = player.discordName;
                        winner.match = matchType;
                        winner.kills = kills - player[matchType].kills;
                        winner.damage = damageDealt - player[matchType].damage;
                        bot.chickenDinner(winner);
                    }

                    // Update the player
                    player[matchType].kills = kills;
                    player[matchType].damagePg = damagePg;
                    player[matchType].roundMostKills = roundMostKills;
                    player[matchType].suicides = suicides;
                    player[matchType].teamKills = teamKills;
                    player[matchType].headshots = headshots;
                    player[matchType].wins = wins;
                    player[matchType].kd = kd;
                    player[matchType].topTenRatio = topTenRatio;
                    player[matchType].winRatio = winRatio;
                    player[matchType].losses = losses;
                    player[matchType].longestKill = longestKill;
                    player[matchType].damage = damageDealt;
                });

                // Get the list of players again since this is a async api call
                let savedplayerMap = fileUtil.readPlayerMap();

                // If this is a new player, simply save it to the player.json file
                if (player.init) {
                    player.init = 0;
                    savedplayerMap[player.discordName] = player;
                    fileUtil.writePlayers(savedplayerMap);
                    bot.newPlayerAdded(player.pubgName);
                }
                else {
                    // Don't update the players.json file unless there is a difference for the player
                    let tempPlayer = savedplayerMap[player.discordName];
                    if (JSON.stringify(tempPlayer) !== JSON.stringify(player)) {
                        savedplayerMap[player.discordName] = player;
                        console.log("Updating " + player.pubgName + "'s");
                        fileUtil.writePlayers(savedplayerMap);
                    }
                }
            });
    }
    catch (e) {
		console.log("Error trying to call pubg api to get player's stats.");
    }
};

// This will iterate through all the players and get their newest pubg data
const fetchUpdatedPlayerData = function (savedplayerMap) {
    debugger;

    for (let id in savedplayerMap) {
        if (savedplayerMap.hasOwnProperty(id)) {
			let player = savedplayerMap[id];
			getPlayerDataFromAPI(player);
		}
    }
};

// Create a blank object used to help calculate the leaderboard
const initLeader = function () {
    return {wins: {num: -1, id: []}, kills: {num: -1, id: 0}, damagePg: {num: -1, id: 0}};
};

// Create a new player object
const initPlayer = function (discordName, pubgName) {
    let player = {};
    player.pubgName = pubgName;
    player.discordName = discordName;
    player.init = 1;
    Object.keys(MATCH).forEach(function (match) {
        let matchType = MATCH[match];
        player[matchType] = {
            kills: 0,
            damagePg: 0,
            roundMostKills: 0,
            suicides: 0,
            teamKills: 0,
            headshots: 0,
            wins: 0,
            kd: 0,
            topTenRatio: 0,
            winRatio: 0,
            losses: 0,
            longestKill: 0,
            damage: 0
        }
    });
    return player;
};

const getLeaderboardSkeleton = function(){
    return {
        kills: {
            plainText : "kills",
            value: 0,
            matchType: [],
            player: []
          },
          damagePg: {
            plainText : "damange per game",
            value: 0,
            matchType: [],
            player: []
          },
          roundMostKills: {
            plainText : "most kills in a single round",
            value: 0,
            matchType: [],
            player: []
          },
          headshots: {
            plainText : "headshots",
            value: 0,
            matchType: [],
            player: []
          },
          wins: {
            plainText : "wins",
            value: 0,
            matchType: [],
            player: []
          },
          kd: {
            plainText : "k/d ratio",
            value: 0,
            matchType: [],
            player: []
          },
          topTenRatio: {
            plainText : "top ten ratio",
            value: 0,
            matchType: [],
            player: []
          },
          winRatio: {
            plainText : "win ratio",
            value: 0,
            matchType: [],
            player: []
          },
          longestKill: {
            plainText : "longest kill",
            value: 0,
            matchType: [],
            player: []
          },
          damage: {
            plainText : "total damage",
            value: 0,
            matchType: [],
            player: []
          }
    };
}
getDiscordNameFromPubgName =  function(pubgName){
    var playerMap = fileUtil.readPlayerMap();
    for (var id in playerMap) {
        var player = playerMap[id];
        if(player.pubgName === pubgName) {
            return player.discordName;
        }
    }
}

module.exports = {

    // Function to add a new player to the system
    createNewPlayer: function (discordName, pubgName) {
        console.log("Adding user. Discordname: " + discordName + ", pubgname: " + pubgName);
		let playerMap = fileUtil.readPlayerMap();
		debugger;
        // Make sure the player doesn;t already exist
        if (playerMap[discordName] === undefined) {
            debugger;
			try {
				api.getProfileByNickname(pubgName)
					.then(function () {
						let player = initPlayer(discordName, pubgName);
						playerMap[discordName] = player;
						getPlayerDataFromAPI(player);
						console.log("Successfully added player: " + pubgName);
						return true;
					}, function (error) {
						console.log("Player name does not exist in the pubg api.");
						bot.sendMessage("Player name does not exist in the pubg api.");
						return false;
					});
			}
			catch (e) {
				console.log("Error retrieving initial player data from the pubg api.");
				bot.sendMessage("Error retrieving initial player data from the pubg api.");
				return false;
			}
        } else {
			console.log("Account: " + discordName + " already has a pubg player in the system: " + playerMap[discordName].pubgName);
			bot.sendMessage("Your discord account already has a pubg player in the system: " + playerMap[discordName].pubgName);
			return false;
        }
    },

    // Function to update player data
    fetchData: function () {
        fetchUpdatedPlayerData(fileUtil.readPlayerMap());
    },

    // Function to calculate the leaderboard for a specific match type
	calculateLeaderboard: function(matchType){
		let modifiedMatchType = matchType.replace("-", "");
		matchType = matchType.toLowerCase();
		if(MATCH[modifiedMatchType] != undefined){
			modifiedMatchType = modifiedMatchType.toLowerCase();
			console.log("Calculating leaderboard");
			fetchUpdatedPlayerData(fileUtil.readPlayerMap());
			let players = fileUtil.readPlayerMap();
			let leader = initLeader();
			let count = 0;
			for(id in players){
				let player = players[id];
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
    
    calculateFullLeaderboard: function(){
        var leaderboard = getLeaderboardSkeleton();
        //var leaderboard = readLeaderboard();
        var playerMap = fileUtil.readPlayerMap();
        for(var player in playerMap){
            player = playerMap[player];
            for(var type in MATCH){
                type = MATCH[type];
                if(player[type].wins > 0){
                    for(var stat in leaderboard){
                        if(player[type][stat] >= leaderboard[stat].value){
                            if(player[type][stat] == leaderboard[stat].value && !(leaderboard[stat].player.indexOf(player.pubgName) > -1)){
                                leaderboard[stat].value = player[type][stat];
                                leaderboard[stat].matchType.push(type);
                                leaderboard[stat].player.push(player.pubgName);
                            }
                            if(player[type][stat] > leaderboard[stat].value){
                                leaderboard[stat].value = player[type][stat];
                                leaderboard[stat].matchType[0] = type;
                                leaderboard[stat].player[0] = player.pubgName;
                            }
                            else if(leaderboard[stat].matchType.length == 0 || leaderboard[stat].player[0] == player.pubgName){
                                leaderboard[stat].value = player[type][stat];
                                leaderboard[stat].matchType[0] = type;
                                leaderboard[stat].player[0] = player.pubgName;
                            }
                        }
                    }
                }
            }
        }
        return leaderboard;
    },

    detectLeaderboardDifference: function(currentLeaderboard){
        var actualLeaderboard = fileUtil.readLeaderboard();
        if (JSON.stringify(currentLeaderboard) !== JSON.stringify(actualLeaderboard)) {
            for(var stat in actualLeaderboard){
                if(actualLeaderboard[stat].value != currentLeaderboard[stat].value){
                    if(!(actualLeaderboard[stat].player.indexOf(currentLeaderboard[stat].pubgName) > -1)){
                        var outputMessage = 'Hey @everyone, <@' + getDiscordNameFromPubgName(currentLeaderboard[stat].player[0]) + '> just knocked <@' + getDiscordNameFromPubgName(actualLeaderboard[stat].player[0]) + '> off the leaderboard. \n';
                        outputMessage += currentLeaderboard[stat].value +' '+currentLeaderboard[stat].plainText+ ' in '+currentLeaderboard[stat].matchType;
                        bot.sendMessage(outputMessage);
                    }
                    actualLeaderboard[stat].value = currentLeaderboard[stat].value;
                    actualLeaderboard[stat].matchType = currentLeaderboard[stat].matchType;
                    actualLeaderboard[stat].player =  currentLeaderboard[stat].player;
                }
            }
        }
        return actualLeaderboard;
    },
    // Function to update all players and return a specific player
    retrieveUpdatedPlayer: function (discordUser) {
        fetchUpdatedPlayerData(fileUtil.readPlayerMap());
        let player = fileUtil.readPlayer(discordUser);
        if (player !== null) {
            console.log("Retrieved " + player.pubgName + "'s stats");
            return player;
        }
        return undefined;
    },

    // Validate the matchType matches a value in the constants file
    validateMatchType: function (matchType) {
        let modifiedMatchType = matchType.replace("-", "");
        return MATCH[modifiedMatchType] !== undefined;
    },

    // Get the matchTypesList
    retrieveMatchTypesList: function () {
        let matchTypes = new String();
        for (let type in MATCH) {
            if (MATCH.hasOwnProperty(type)) {
                if (matchTypes.length === 0) {
                    matchTypes = MATCH[type];
                }
                else if (type !== "DEFAULT") {
                    matchTypes += ", " + MATCH[type];
                }
            }
        }
        return matchTypes;
    },

    // Get the matchTypes
    retrieveMatchTypes: function () {
        return MATCH;
    }
};