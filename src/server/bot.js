/**
 * Created by mrjoshte on 8/31/2017
 */
//Link dependencies

const {PubgAPI, PubgAPIErrors, REGION, SEASON, MATCH} = require('pubg-api-redis');
const Discord = require('discord.js');
var pubgTrackerAPIKey = '21c941ec-f966-4919-ad40-7976405ca06b';
var auth = require('./auth.json');

// If no Redis configuration it wont be cached
const api = new PubgAPI({
  apikey: pubgTrackerAPIKey,
  redisConfig: {
    host: '127.0.0.1',
    port: 6379,
    expiration: 300, // Optional - defaults to 300.
  },
});

var bot = new Discord.Client({
   token: auth.token,
   autorun: true
});



//Users will set their pubg name in their note?

//We will have to save their discord username and somehow attach it to their pubg profile
//There will need to be a registration process for it..


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
  
  

