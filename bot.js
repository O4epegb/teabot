var TelegramBot = require('node-telegram-bot-api');
var sendRandomBashImQuote = require('./bashQuote');
var getDeclension = require('./utils').getDeclension;

var token;
var bot;
var productionMode = process.env.NODE_ENV === 'production';

if (productionMode) {
    token = process.env.BOT_TOKEN;
    bot = new TelegramBot(token);
    bot.setWebHook('https://mysterious-sands-41657.herokuapp.com/' + bot.token);
} else {
    token = require('./secret').tokenForDebug;
    bot = new TelegramBot(token, {
        polling: true
    });
}

console.log('Bot server started in ' + (productionMode ? 'production' : 'debug') + ' mode');

// hello command
bot.onText(/^\/say_hello (.+)$/, (msg, match) => {
    var name = match[1];
    bot.sendMessage(msg.chat.id, 'Hey, Hola, Hello ' + name + '!').then(() => {
        // reply sent!
    });
});

var commands = {
    "/bash": {
        description: 'get quote from bash.org',
        call: (msg) => {
            sendRandomBashImQuote(msg, bot);
        }
    },
    "/sum": {
        description: 'ololol',
        call: (msg, command) => {
            var message = msg.text.replace(command, '').trim();
            var result = 0;
            message.split(/\s+/).forEach((i) => {
                result += (+i || 0);
            })
            bot.sendMessage(msg.chat.id, result || 'fuck off')
        }
    },
    "/keys": {
        description: 'test command for keyboard',
        call: (msg) => {
            var opts = {
                reply_to_message_id: msg.message_id,
                reply_markup: JSON.stringify({
                    keyboard: [
                        ['Yes'],
                        ['No']
                    ],
                    one_time_keyboard: true,
                    resize_keyboard: true
                })
            };
            bot.sendMessage(msg.chat.id, 'Do you love me?', opts);
        }
    },
    "/coords": {
        description: 'test command for getting location',
        call: (msg) => {
            var opts = {
                reply_to_message_id: msg.message_id,
                reply_markup: JSON.stringify({
                    keyboard: [
                        [{
                            text: 'Yes',
                            request_location: true
                        }],
                        ['No']
                    ],
                    one_time_keyboard: true,
                    resize_keyboard: true
                })
            };
            bot.sendMessage(msg.chat.id, 'Want to share your coords?', opts);
        }
    },
    "/help": {
        description: 'helping you',
        call: (msg) => {
            bot.sendMessage(msg.chat.id, getAllCommandsReply());
        }
    }
}

bot.on('text', function(msg) {
    var messageChatId = msg.chat.id;
    var messageText = msg.text;

    if (messageText === 'Yes') {
        bot.sendMessage(messageChatId, 'I\'m too love you!', {
            caption: 'I\'m bot!'
        });
    }

    if (messageText === 'No') {
        bot.sendMessage(messageChatId, ':(', {
            caption: 'I\'m bot!'
        });
    }
});


function getAllCommandsReply() {
    var msg = Object.keys(commands).map(command => {
        return `${command}: ${commands[command].description}`
    })
    return msg.join('\n');
}

// Any kind of message
bot.on('message', (msg) => {
    console.log('MESSAGE', msg);
    if (msg.entities) {
        var notFoundCommands = [];

        msg.entities
            .filter(entity => entity.type === 'bot_command')
            .map(getCommandFromMessageEntity.bind(null, msg))
            .filter(command => {
                return isValidCommand(command) ? true : (notFoundCommands.push(command), false)
            })
            .forEach(command => commands[command].call(msg, command))

        if (notFoundCommands.length) {
            var commandsString = notFoundCommands.reduce((prev, curr, index, array) => {
                if (array.length === 1) {
                    return curr;
                } else if (index === array.length - 1) {
                    return prev += `и ${curr}`;
                } else if (index === array.length - 2) {
                    return prev += `${curr} `;
                } else {
                    return prev += `${curr}, `;
                }
            }, '');
            var commandNoun = getDeclension(notFoundCommands.length, ['Команд', 'Команда', 'Команды']);
            var foundNoun = getDeclension(notFoundCommands.length, ['найдено', 'найдена', 'найдены']);
            bot.sendMessage(msg.chat.id,
                `${commandNoun} ${commandsString} не ${foundNoun}, введите /help, чтобы увидеть список всех команд`);
        }
    }
});

function getCommandFromMessageEntity(msg, entity) {
    return msg.text.substr(entity.offset, entity.length);
}

function isValidCommand(command) {
    return commands[command];
}

function sendCommandNotFoundMessage(msg, command) {
    bot.sendMessage(msg.chat.id, `Команда ${command} не найдена, введите /help, чтобы увидеть список всех команд`);
}

bot.on('inline_query', (msg) => {
    console.log('yay inline_query', msg);
    bot.answerInlineQuery(msg.id, [{
        type: 'article',
        id: String(Date.now()),
        title: 'Hello, inline queries are not supported just yet!',
        input_message_content: {
            message_text: 'Hello, inline queries are not supported just yet!'
        }
    }]);
});

module.exports = bot;
