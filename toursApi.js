var axios = require('axios');
var cookie = require('cookie');
var _ = require('lodash');
const getSecrets = require('./getSecrets');

var cachedCooksik;

module.exports = {
    getHotTours: getHotTours,
    getTours: getTours
};

function getHotTours() {
    return login().then(cooksik => {
        return axios({
            url: 'https://mobile-api.sletat.ru/v40/jsonapi.ashx',
            method: 'post',
            data: {
                id: 1,
                params: {
                    nightsMin: 3,
                    cityFromId: 832
                },
                method: 'hotTours.core.getDirections'
            },
            headers: {
                Cookie: cooksik
            }
        });
    });
}

function getTours(countryId, starId) {
    return login().then(cooksik => {
        return axios({
            url: 'https://mobile-api.sletat.ru/v40/jsonapi.ashx',
            method: 'post',
            data: {
                id: 1,
                params: {
                    specifiedFields: [-1, 0, 1, 5, 6, 19, 18, 3, 7, 11, 9, 10, 12, 13, 14, 42],
                    // specifiedFields: _.range(-1, 88),
                    countryId: countryId,
                    nightsMin: 3,
                    cityFromId: 832,
                    stars: [starId],
                    pageNumber: 1,
                    pageSize: 20
                },
                method: 'hotTours.core.getToursResult'
            },
            headers: {
                Cookie: cooksik
            }
        });
    });
}

function print(obj) {
    console.log(JSON.stringify(obj, null, 2));
}

function login() {
    return new Promise((resolve, reject) => {
        if (cachedCooksik) {
            console.log('WE ARE CACHED');
            var cooksik = cookie.serialize('.SLTAUTHC', cachedCooksik);
            return resolve(cooksik);
        }
        return axios({
            url: 'https://mobile-api.sletat.ru/v40/jsonapi.ashx',
            method: 'post',
            data: {
                id: 1,
                params: {
                    password: getSecrets().apiPassword,
                    login: getSecrets().apiLogin
                },
                method: 'system.login'
            }
        })
            .then(response => {
                var cooksik = cookie.parse(response.headers['set-cookie'][0])['.SLTAUTHC'];
                var setCookie = cookie.serialize('.SLTAUTHC', cooksik);
                // cachedCooksik = setCookie;
                return resolve(setCookie);
            })
            .catch(error => {
                console.log(error);
                reject(error);
            });
    });
}

var testTour = {
    countryId: 19,
    countryName: 'Болгария',
    imageURL: 'http://hotels.sletat.ru/cri/?t=1&sr=1&id=19&w=##width##&h=##height##',
    categories: {
        star3: {
            starId: 402,
            starName: '3*',
            toursCount: 2838,
            price: 15870
        },
        star4: {
            starId: 403,
            starName: '4*',
            toursCount: 2787,
            price: 17371
        },
        star5: {
            starId: 404,
            starName: '5*',
            toursCount: 1168,
            price: 17770
        }
    }
};

var tt1 = {
    id: 1,
    params: {
        sourceId: 51,
        deviceToken: 'APA91bFgvQd54HUPZfYzpIkAQ8uLCmIGptDAD1zT5FleYmwSnLKnF7u7lq91HrFocsgot-lHcYZNvOp0zXCVXSPgy16SJScWzwQkFEcUgjKQADtAOcffnlM',
        requestId: 0,
        isHotToursRequest: true,
        tourNumber: 0,
        maxPriceHistoryPoints: 9,
        offerId: 564505249
    },
    method: 'core.actualizeTour'
};

var tt2 = {
    id: 1,
    params: {
        isHotToursRequest: true,
        sourceId: 51,
        requestId: 0,
        offerId: 564505249
    },
    method: 'core.queueActualization'
};

var tt3 = {
    id: 1,
    params: {
        isHotToursRequest: true,
        actualizationSessionId: 'YXEi2Rei7kqNHai0pRjKuA\u003d\u003d'
    },
    method: 'core.getActualizationResult'
};
