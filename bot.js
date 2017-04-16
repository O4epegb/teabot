const TelegramBot = require('node-telegram-bot-api');
const _ = require('lodash');
const sendRandomBashImQuote = require('./bashQuote');
const getSecrets = require('./getSecrets');
const getDeclension = require('./utils').getDeclension;
const { getHotTours, getTours } = require('./toursApi.js');

const productionMode = process.env.NODE_ENV === 'production';
const { token } = getSecrets();
const bot = createBot(productionMode, token);

function createBot(productionMode, token) {
    if (productionMode) {
        const bot = new TelegramBot(token);
        bot.setWebHook('https://mysterious-sands-41657.herokuapp.com/' + bot.token);
        return bot;
    } else {
        return new TelegramBot(token, { polling: true });
    }
    console.log('Bot server started in ' + (productionMode ? 'production' : 'debug') + ' mode');
}

const commands = {
    '/bash': {
        description: 'get quote from bash.org',
        call: msg => {
            sendRandomBashImQuote(msg, bot);
        }
    },
    '/sum': {
        description: 'sum some stuff',
        call: (msg, command) => {
            var message = msg.text.replace(command, '').trim();
            var result = 0;
            message.split(/\s+/).forEach(i => {
                result += +i || 0;
            });
            bot.sendMessage(msg.chat.id, result || 'fuck off, stop hurting me');
        }
    },
    '/keys': {
        description: 'test command for keyboard',
        call: msg => {
            var opts = {
                reply_to_message_id: msg.message_id,
                reply_markup: JSON.stringify({
                    keyboard: [['Yes'], ['No']],
                    one_time_keyboard: true,
                    resize_keyboard: true
                })
            };
            bot.sendMessage(msg.chat.id, 'Do you love me?', opts);
        }
    },
    '/coords': {
        description: 'test command for getting location',
        call: msg => {
            var opts = {
                reply_to_message_id: msg.message_id,
                reply_markup: JSON.stringify({
                    keyboard: [
                        [
                            {
                                text: 'Yes',
                                request_location: true
                            }
                        ],
                        ['No']
                    ],
                    one_time_keyboard: true,
                    resize_keyboard: true
                })
            };
            bot.sendMessage(msg.chat.id, 'Want to share your coords?', opts);
        }
    },
    '/help': {
        description: 'helping you',
        call: msg => {
            bot.sendMessage(msg.chat.id, getAllCommandsReply());
        }
    },
    '/checkStuff': {
        description: 'check some tours',
        call: msg => {
            bot.sendChatAction(msg.chat.id, 'typing');
            getHotTours().then(response => {
                const directions = response.data.result.data.directions;
                var opts = {
                    reply_markup: JSON.stringify({
                        inline_keyboard: directions.slice(0, 10).map(direction => {
                            return [
                                {
                                    text: String(direction.countryName),
                                    callback_data: JSON.stringify({
                                        countryId: direction.countryId,
                                        t: 'HTCS'
                                    })
                                }
                            ];
                        })
                    })
                };
                bot.sendMessage(msg.chat.id, `📅 Горячие туры ☀`, opts).then(sended => {
                    console.log('checkStuff sended message', sended);
                });
            });
        }
    }
};

bot.on('callback_query', function(cbQuery) {
    // console.log('callback_query', cbQuery);
    const data = JSON.parse(cbQuery.data);

    if (data.t === 'HTCS') {
        const opts = {
            message_id: cbQuery.message.message_id,
            chat_id: cbQuery.message.chat.id
        };

        getHotTours().then(response => {
            const directions = response.data.result.data.directions;
            const neededDirection = directions.filter(direction => direction.countryId === data.countryId)[0];
            console.log('neededDirection', neededDirection);
            var replyMarkup = {
                inline_keyboard: _.map(neededDirection.categories, category => {
                    return [
                        {
                            text: `${neededDirection.countryName} ${category.starName}, ${category.toursCount} туров от ${category.price}`,
                            callback_data: JSON.stringify({
                                d: {
                                    sId: category.starId,
                                    cId: data.countryId,
                                    cN: neededDirection.countryName
                                },
                                t: 'HTSS'
                            })
                        }
                    ];
                })
            };
            bot.editMessageReplyMarkup(replyMarkup, opts);
        });
    } else if (data.t === 'HTSS') {
        const opts = {
            message_id: cbQuery.message.message_id,
            chat_id: cbQuery.message.chat.id
        };
        const { sId: starId, cId: countryId, cN: countryName } = data.d;
        bot.sendChatAction(opts.chat_id, 'typing');
        getTours(countryId, starId).then(response => {
            const tours = response.data.result.data.tours;
            console.log('getTours', response.data);

            const requestId = response.data.result.data.requestId;

            const text = `
                📅 ${countryName}, горячие туры ☀
                ${tours
                .slice(0, 5)
                .map(tour => {
                    const sourceId = tour[1];
                    const offerId = tour[0];
                    const hotelId = tour[3];
                    const price = tour[42];
                    const hotelName = tour[7];
                    const resortName = tour[19];
                    return `
                        [${hotelName}, ${resortName}](https://sletat.ru/tour.aspx?sourceId=${sourceId}&offerId=${offerId}&requestId=${requestId})
                        ${tour[6]}
                        Даты - с ${tour[12]} до ${tour[13]}
                        Цена за одного - от ${price}р.
                    `;
                })
                .map(text => text.replace(/^ +/gim, ''))
                .join('')}
            `;
            bot.editMessageText('Результаты поиска:', Object.assign({}, opts, { inline_keyboard: [] }));
            // bot.editMessageReplyMarkup({ inline_keyboard: [] }, opts);
            bot.sendMessage(opts.chat_id, text, {
                parse_mode: 'Markdown',
                disable_web_page_preview: true
            });
        });
    }
});

function getAllCommandsReply() {
    var msg = Object.keys(commands).map(command => {
        return `${command}: ${commands[command].description}`;
    });
    return msg.join('\n');
}

// Any kind of message
bot.on('message', msg => {
    console.log('MESSAGE', msg);
    if (msg.entities) {
        var notFoundCommands = [];

        msg.entities
            .filter(entity => entity.type === 'bot_command')
            .map(getCommandFromMessageEntity.bind(null, msg))
            .filter(command => {
                return isValidCommand(command) ? true : (notFoundCommands.push(command), false);
            })
            .forEach(command => commands[command].call(msg, command));

        if (notFoundCommands.length) {
            var commandsString = notFoundCommands.reduce((prev, curr, index, array) => {
                if (array.length === 1) {
                    return curr;
                } else if (index === array.length - 1) {
                    return (prev += `и ${curr}`);
                } else if (index === array.length - 2) {
                    return (prev += `${curr} `);
                } else {
                    return (prev += `${curr}, `);
                }
            }, '');
            var commandNoun = getDeclension(notFoundCommands.length, ['Команд', 'Команда', 'Команды']);
            var foundNoun = getDeclension(notFoundCommands.length, ['найдено', 'найдена', 'найдены']);
            bot.sendMessage(
                msg.chat.id,
                `${commandNoun} ${commandsString} не ${foundNoun}, введите /help, чтобы увидеть список всех команд`
            );
        }
    }
});

function getCommandFromMessageEntity(msg, entity) {
    return msg.text.substr(entity.offset, entity.length);
}

function isValidCommand(command) {
    return commands[command];
}

bot.on('inline_query', msg => {
    console.log('yay inline_query', msg);
    bot.answerInlineQuery(msg.id, [
        {
            type: 'article',
            id: String(Date.now()),
            title: 'Hello, i dont support inline queries just yet!',
            input_message_content: {
                message_text: 'Hello, i dont support inline queries just yet!'
            }
        }
    ]);
});

module.exports = bot;
