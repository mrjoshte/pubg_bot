# PUG-BOT

## Welcome to my PUBG-BOT

This project has just been started so I will update this as I go..

I am using https://github.com/hydrabolt/discord.js/ in order to communicate with the discord api
and https://github.com/javilobo8/pubg-api-redis in order to communicate with the pubg tracker api

Update for the future

- Adding in more stats for !leaderboard and !stats
- Update the win posting if players won a match together
- autopost updated leaderboard changes as they happen
- add !shame @player and list out all of their undesireable stats like loses, team kills, ect..
- add channel only for checking stats and leaderboard
- add admins to this

The full list of commands are as follows..

| Command       | Argument      |Description|
| --------------|:-------------:|:-----|
| !setchannel   |               |This will set the current discord channel for the bot to write to|
| !addme        | pubg username |This will enroll the current discord user to the bot to keep track of stats.|
| !stats        |               |This will post current stats for solo, duo, and squad matches.|
| !stats        | match type    |This is the same as the previous one, except you can specify which match type.|
| !leaderboard  | match type    |This will have a leaderboard of everyone in the current discord server and post only the highest stats.|
