var Discord = require('discord.js');
var logger = require('winston');
var request = require('request');
var auth = require('./auth.json');

// configure the logger
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true,
    json: false
})
logger.level = 'info';

// server of interest
var SERVER_NAME = 'Valeor Campaign';
//var ICON_URL = 'https://imgur.com/x6i6bIp';
var ICON_URL = 'https://steamuserimages-a.akamaihd.net/ugc/791986132470357926/BBD7082715E6747FADCC1F72466BBDF9AB2BB058/';

// server list API
var NWN2_LIST_SERVER = 'http://www.nwnlist.com/servers/NWN2';

// testing the pinging of the server
var SERVER_IP = 'vulcan-atx.ddns.net';
var SERVER_PORT = 5121;

// initialize the bot
var client = new Discord.Client();

/// Will look for the server of interest that is defined for this instance.
function find_server() {
    var found_server = null;

    // go to the url and search for our server
    request.get({url: NWN2_LIST_SERVER, json: true}, function(error, response, body) {
        logger.info(`status: ${response.statusCode}`);
        if (error !== null) {
            logger.error(`message: ${error}`);
            return;
        }

        // look for our server
        body.forEach(server => {
            if (server.server_name === SERVER_NAME) {
                logger.info(`found server!`);
                found_server = server;
                return;
            }
        });
    });
    return found_server;
}

/// Will generate the failure embed message.
function generate_fail_embed() {
    // otherwise we will generate the offline message
    var server_details = [
        {name: 'Status', value: `**OFF-LINE**`}
    ];

    // the embeded object
    var embed = new Discord.MessageEmbed()
        .setColor('RED')
        .setTitle(`${SERVER_NAME}`)
        .setDescription('**Server Status**')
        .setThumbnail(ICON_URL)
        .addFields(server_details)
        .setTimestamp()
        .setFooter(`${SERVER_NAME}`);
    return embed;
}

/// Will generate our successful embed message.
function generate_success_embed(found_server) {
    // collect our metadata
    var active_count = found_server.active_player_count;
    var max_count = found_server.maximum_player_count;
    var build_id = found_server.build_number;
    var min_lvl = found_server.minimum_level;
    var max_lvl = found_server.maximum_level;

    // the fields that we will generate
    var server_details = [
        {name: 'Status', value: `**ONLINE**`, inline: true},
        {name: 'User Count', value: `${active_count} / ${max_count}`, inline: true},
        {name: 'Level Details', value: `${min_lvl} / ${max_lvl}`, inline: true}
    ];

    // the embeded object
    var embed = new Discord.MessageEmbed()
        .setColor('GREEN')
        .setTitle(`${SERVER_NAME} [_Build: ${build_id}_]`)
        .setDescription('**Server Status**')
        .setThumbnail(ICON_URL)
        .addFields(server_details)
        .setTimestamp()
        .setFooter(`${SERVER_NAME}`);
    return embed;
}

/// Will fetch the server of interest that is mentioned above.  If found, then
/// the embeded message will 
function get_server_status(msg) {
    var found_server = null;

    // go to the url and search for our server
    request.get({url: NWN2_LIST_SERVER, json: true}, function(error, response, body) {
        logger.info(`status: ${response.statusCode}`);
        if (error !== null) {
            logger.error(`message: ${error}`);
            return;
        }

        // look for our server
        body.forEach(server => {
            logger.debug(`current server: ${server.server_name}`);

            if (server.server_name === SERVER_NAME) {
                logger.info(`found server!`);
                found_server = server;
                return;
            }
        });

        // establish the embed message
        var embed = new Discord.MessageEmbed();
        if (found_server !== null) {
            embed = generate_success_embed(found_server);
        }
        else {
            // otherwise we will generate our failed embed message
            embed = generate_fail_embed();
        }

        // send the embed message
        return msg.channel.send(embed);
    });

    return;
}

// bot methods
client.on('ready', () => {
    logger.info('Connected');
    var botName = `${client.user.tag}`;
    logger.info(`Logged in as: ${botName}`);
})

client.on('message', msg => {
    logger.info(`recieved ${msg} from user ${msg.author.username}...`);
    logger.info(`content: ${msg.content}`);

    var type = msg.content.substr(0, 1);
    if (type === '!') {
        // then we will get the arguments provided in order to process the
        // request
        var args = msg.content.substr(1).split(' ');
        logger.info(`args: ${args}`);
        var cmd = args[0];
        logger.info(`cmd: ${cmd}`);

        var spliced = args.splice(1);
        logger.info(`spliced: ${spliced}`);

        switch(cmd) {
            // !ping
            case 'ping':
                msg.channel.send('pong!');
                break;
            // !test
            case 'nwn':
                var second_cmd = '';
                if (spliced.length == 1) {
                    second_cmd = spliced[0];
                }

                switch(second_cmd) {
                    case 'status':
                        return get_server_status(msg);

                    case 'setup':
                        logger.info('need to add more details for setup...');
                        break;
                }
            default:
                logger.warn(`no handling of provided command: ${cmd}`);
        }
    }
})

// login
client.login(auth.token);

// EOF
