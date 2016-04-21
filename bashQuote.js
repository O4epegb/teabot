var http = require('http');
var iconv = require('iconv-lite');

var options = {
    host: "bash.im",
    port: 80,
    path: "/forweb/"
};

function sendRandomBashImQuote(aMessageObject, bot) {
    http.get(options, function(res) {
        res.pipe(iconv.decodeStream('win1251')).collect(function(err, decodedBody) {
            // console.log(decodedBody)
            var content = getQuoteBlockFromContent(decodedBody);
            content = removeAllMarkUp(content[1]);
            sendMessageByBot(aMessageObject.chat.id, content, bot);
        });
    });
}

function removeAllMarkUp(aString) {
    var cleanQuote = replaceAll(aString, "<' + 'br>", '\n');
    cleanQuote = replaceAll(cleanQuote, "<' + 'br />", '\n');
    cleanQuote = replaceAll(cleanQuote, '&quot;', '\"');
    cleanQuote = replaceAll(cleanQuote, '&lt;', '<');
    cleanQuote = replaceAll(cleanQuote, '&gt;', '>');
    return cleanQuote;
}

function replaceAll(aString, aFingString, aReplaceString) {
    return aString.split(aFingString).join(aReplaceString);
}

function getQuoteBlockFromContent(aString) {
    var quoteBlock = aString.replace('<\' + \'div id="b_q_t" style="padding: 1em 0;">', '__the_separator__');
    quoteBlock = quoteBlock.replace('<\' + \'/div><\' + \'small>', '__the_separator__');
    return quoteBlock.split('__the_separator__');
}

function sendMessageByBot(aChatId, aMessage, bot) {
    bot.sendMessage(aChatId, aMessage, {
        caption: 'I\'m a cute bot!'
    });
}

module.exports = sendRandomBashImQuote;
