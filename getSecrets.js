module.exports = function() {
    const isProduction = process.env.NODE_ENV === 'production';
    return {
        token: isProduction ? process.env.BOT_TOKEN : require('./secret').tokenForDebug,
        apiPassword: isProduction ? process.env.API_PASSWORD : require('./secret').apiPassword,
        apiLogin: isProduction ? process.env.API_LOGIN : require('./secret').apiLogin
    };
};
