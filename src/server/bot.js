/**
 * Created by mrjoshte on 8/31/2017
 */
//Link dependencies
var auth = require('./auth.json');
var server = require('server.js');

var bot = new Discord.Client();
bot.login(auth.token);

bot.on("ready", () => {
  console.log("Hey everyone!");
});

bot.on("message", (message) => {
	if (message.content.startsWith("!")) {
		server.createNewPlayer(message.author, message.content);
	}
});

