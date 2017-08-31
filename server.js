/**
 * Created by mrjoshte on 8/31/2017
 */
//Link dependencies

const {PubgAPI, PubgAPIErrors, REGION, SEASON, MATCH} = require('pubg-api-redis');
const Discord = require('discord.js');
var pubgTrackerAPIKey = '21c941ec-f966-4919-ad40-7976405ca06b';

// If no Redis configuration it wont be cached
const api = new PubgAPI({
  apikey: pubgTrackerAPIKey,
  redisConfig: {
    host: '127.0.0.1',
    port: 6379,
    expiration: 300, // Optional - defaults to 300.
  },
});






api.getProfileByNickname('javilobo8')
  .then((profile) => {
    const data = profile.content;
    const stats = profile.getStats({
      region: REGION.ALL, // defaults to profile.content.selectedRegion
      season: SEASON.EA2017pre3, // defaults to profile.content.defaultSeason
      match: MATCH.SOLO // defaults to SOLO
    });
    console.log(stats);
  });

api.getAccountBySteamID('76561198084956266')
  .then((account) => {
    console.log(account);
  });