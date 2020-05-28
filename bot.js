var Discord = require('discord.io');
var logger = require('winston');
var auth = require('./auth.json');

// configure the logger
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true
})
logger.level = 'debug';

// initialize the bot
var bot = new Discord.Client({
    token: auth.token,
    autorun: true
});

// bot methods
bot.on('ready', function(event) {
    logger.info('Connected');
    var botName = bot.username + ' - (' + bot.id + ')';
    logger.info('Logged in as: ' + botName);
})

bot.on('message', function(user, userId, channelId, message, event) {
    // our bot needs to know if it will execute a command
    // it will listen for messages that will start with `!`
    if (message.substring(0, 1) == '!') {
        var args = message.substring(1).split(' ');
        var cmd = args[0];

        args = args.splice(1);
        switch(cmd) {
            // !ping
            case 'ping': {
                bot.sendMessage({
                    to: channelId,
                    message: 'pong!'
                });
            }
            break;

            // more handling of commands
        }
    }
})

// EOF
