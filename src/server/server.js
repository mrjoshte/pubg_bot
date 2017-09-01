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

var getPlayerList = function() {
	try {
        return JSON.parse(fs.readFileSync(playerFile));
    } catch(e) {
        return new Array();
    }
};

var fetchUpdatedPlayerData = function(savedPlayerList, creatingNewPlayer) {
    //This will iterate through all the players
    debugger;
    for (var i = 0; i < savedPlayerList.length; i++) {
        //This will fetch the player from the pubg api
        var player = savedPlayerList[i];
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
					
                    if (wins > player.wins[matchType] && !creatingNewPlayer) {
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
                savedPlayerList = getPlayerList();
                if (!creatingNewPlayer) {
                    for (var i = 0; i < savedPlayerList.length; i++) {
                        if (savedPlayerList[i].discordName === player.discordName) {
                            savedPlayerList.splice(i);
                        }
                    }
                }
                savedPlayerList.push(player);
                writeUpdatedPlayerListToFile(savedPlayerList);
                if (creatingNewPlayer) {
                    bot.newPlayerAdded(player.pubgName);
                }
            });
    }
};

var writeUpdatedPlayerListToFile = function(playerList) {
    fs.writeFile(playerFile, JSON.stringify(playerList), function(err) {
        //something went wrong?
    });
};

var sendWinToDiscord = function(winner) {
    console.log(winner);
    bot.chickenDinner(winner);
};

module.exports = {
    createNewPlayer: function(discordName, pubgName) {
        //double check that the name of this user isn't in the list already
        var playerList = getPlayerList();
        var newPlayer = true;
        for (var i = 0; i < playerList.length; i++) {
            if (playerList[i].discordName === discordName) {
                newPlayer = false;
            }
        }
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
                    fetchUpdatedPlayerData([player], true);
                    return true;
                }, function(error) {
                    return false;
                });
        } else {
            return false;
        }
    },
    fetchData: function() {
        fetchUpdatedPlayerData(getPlayerList(), false);
    }
};