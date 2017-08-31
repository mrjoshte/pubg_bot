/**
 * Created by mrjoshte on 8/31/2017
 */
//Link dependencies

const {PubgAPI, PubgAPIErrors, REGION, SEASON, MATCH} = require('pubg-api-redis');
const playerFile = "./storage/players.json";
const Discord = require('discord.js');
const fs = require('fs');
var pubgTrackerAPIKey = '21c941ec-f966-4919-ad40-7976405ca06b';
const MATCH = {
  SOLO: 'solo',
  DUO: 'duo',
  SQUAD: 'squad',
};

// If no Redis configuration it wont be cached
const api = new PubgAPI({
  apikey: pubgTrackerAPIKey,
  redisConfig: {
    host: '127.0.0.1',
    port: 6379,
    expiration: 300, // Optional - defaults to 300.
  },
});

var getPlayerList = function(){
	var listOfPlayers;
	fs.readFile(playerFile, function(err, data){
        if(err){
            console.log(err);
        } else{
            listOfPlayers = JSON.parse(data);
        }
        if(startupCallback){ startupCallback() }
    });
}
var fetchUpdatedPlayerData = function(savedPlayerList){
	//This will iterate through all the players
	for(var i=0; i<savedPlayerList.length; i++){
			//This will fetch the player from the pubg api
			api.getProfileByNickname(savedPlayerList[i].pubgName)
				  .then((profile) => {
					const data = profile.content;
					for(var j=0; j<MATCH.length; j++){
						stats = profile.getStats({
						  region: REGION.NA,
						  match: MATCH[j]
						});
						//This is where we actually compare the saved vs pulled
						if(stats.performance.wins > savedPlayerList[i][wins].MATCH[j]){
							//save the new data to send to the server
						var winner = new Object();
							winner.kills = stats.combat.kills - savedPlayerList[i][kills].MATCH[j];
							winner.damage = stats.support.damageDealt - savedPlayerList[i][damage].MATCH[j];
							sendWinToDiscord(winner);
						}
						//update the file
							savedPlayerList[i][wins].MATCH[j] = stats.performance.wins;
							savedPlayerList[i][kills].MATCH[j] = stats.combat.kills;
							savedPlayerList[i][damage].MATCH[j] = stats.support.damageDealt
					}
				  });
		}
	}
	writeUpdatedPlayerListToFile(savedPlayerList);
}

var writeUpdatedPlayerListToFile = function(playerList){
	//TODO
}

var sendWinToDiscord = function(winner){
	//TODO
}

var createNewPlayer = function(discordName, pubgName){
	//TODO
}

api.getProfileByNickname(name)
  .then((profile) => {
    const data = profile.content;
    const stats = profile.getStats({
      region: REGION.NA, // defaults to profile.content.selectedRegion
      season: SEASON.EA2017pre3, // defaults to profile.content.defaultSeason
      match: MATCH.SOLO // defaults to SOLO
    });
    console.log(stats);
  });

api.getAccountBySteamID('76561198084956266')
  .then((account) => {
    console.log(account);
  });
  
  

