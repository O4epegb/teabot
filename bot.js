var TelegramBot = require('node-telegram-bot-api');
var token;
var bot;

if (process.env.NODE_ENV === 'production') {
    token = process.env.BOT_TOKEN;
    bot = new TelegramBot(token);
    bot.setWebHook('https://mysterious-sands-41657.herokuapp.com/' + bot.token);
} else {
    token = require('./secret').tokenForDebug;
    bot = new TelegramBot(token, {polling: true});
}

console.log('Bot server started in ' + (process.env.NODE_ENV === 'production'
    ? 'production'
    : 'debug') + ' mode');

// hello command
bot.onText(/^\/say_hello (.+)$/, function(msg, match) {
    var name = match[1];
    bot.sendMessage(msg.chat.id, 'Hey, Hola, Hello ' + name + '!').then(function() {
        // reply sent!
    });
});

// sum command
bot.onText(/^\/sum((\s+\d+)+)$/, function(msg, match) {
    var result = 0;
    match[1].trim().split(/\s+/).forEach(function(i) {
        result += (+ i || 0);
    })
    bot.sendMessage(msg.chat.id, result).then(function() {
        // reply sent!
    });
});

// Any kind of message
bot.on('message', function(msg) {
    console.log(msg);
});

var sendRandomBashImQuote = require('./bashQuote');

bot.onText(/^\/bash$/, function(msg) {
    var messageChatId = msg.chat.id;
    var messageText = msg.text;
    var messageDate = msg.date;
    var messageUser = msg.from.username;

    sendRandomBashImQuote(messageChatId, bot);

});

module.exports = bot;
