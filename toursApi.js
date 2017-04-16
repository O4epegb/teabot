var google = require('google')

// google.resultsPerPage = 25;
//
// google('bulbasor pitures', (err, res) => {
//     if (err) {
//         console.error(err)
//     }
//     var subStrStart = String(res.body).substr(String(res.body).indexOf('class="q" href="/search?q'))
//     var ampIndex = subStrStart.indexOf('&');
//     var queueIndex = subStrStart.indexOf('/search?q=');
//     console.log(subStrStart.substring(ampIndex, queueIndex).replace('/search?q=', ''));
//
// })

var axios = require('axios');
var cookie = require('cookie');
var secrets = require('./secret');

var cachedCooksik = secrets.cachedCooksik;

// main();

module.exports = {
  getHotTours: getHotTours,
  getTours: getTours
}

// function getHotToursMain() {
//     if (cachedCooksik) {
//         console.log('WE ARE CACHED');
//         var setCookie = cookie.serialize('.SLTAUTHC', cachedCooksik);
//         return getHotTours(setCookie);
//     }
//     return axios({
//         url: 'https://mobile-api.sletat.ru/v40/jsonapi.ashx',
//         method: 'post',
//         data: {
//             "id": 1,
//             "params": {
//                 "password": secrets.apiPassword,
//                 "login": secrets.apiLogin
//             },
//             "method": "system.login"
//         }
//     }).then(function(response) {
//         // console.log(response.status);
//         // console.log(response.headers);
//         var cooksik = cookie.parse(response.headers['set-cookie'][0])['.SLTAUTHC'];
//         // console.log('COOKSIK', cooksik)
//         var setCookie = cookie.serialize('.SLTAUTHC', cooksik);
//         // console.log('setCookie', setCookie)
//         // console.log('DATAAA', response.data);
//         return getHotTours(setCookie);
//     }).catch(function(error) {
//         console.log(error);
//     });
// }

function getHotTours() {
    return login().then((cooksik) => {
        return axios({
            url: 'https://mobile-api.sletat.ru/v40/jsonapi.ashx',
            method: 'post',
            data: {
                "id": 1,
                "params": {
                    "nightsMin": 3,
                    "cityFromId": 832
                },
                "method": "hotTours.core.getDirections"
            },
            headers: {
                'Cookie': cooksik
            }
        });
    });
}

function getTours(countryId, starId) {
    return login().then((cooksik) => {
        return axios({
            url: 'https://mobile-api.sletat.ru/v40/jsonapi.ashx',
            method: 'post',
            data: {
                "id": 1,
                "params": {
                    "specifiedFields": [-1, 0, 1, 5, 19, 18, 3, 7, 11, 9, 10, 12, 13, 14, 42],
                    "countryId": countryId,
                    "nightsMin": 3,
                    "cityFromId": 832,
                    "stars": [starId],
                    "pageNumber": 1,
                    "pageSize": 20
                },
                "method": "hotTours.core.getToursResult"
            },
            headers: {
                'Cookie': cooksik
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
                "id": 1,
                "params": {
                    "password": secrets.apiPassword,
                    "login": secrets.apiLogin
                },
                "method": "system.login"
            }
        }).then(function(response) {
            var cooksik = cookie.parse(response.headers['set-cookie'][0])['.SLTAUTHC'];
            var setCookie = cookie.serialize('.SLTAUTHC', cooksik);
            // cachedCooksik = setCookie;
            return resolve(setCookie);
        }).catch(function(error) {
            console.log(error);
            reject(error)
        });
    });
}

var testTour = {
    "countryId": 19,
    "countryName": "Болгария",
    "imageURL": "http://hotels.sletat.ru/cri/?t=1&sr=1&id=19&w=##width##&h=##height##",
    "categories": {
        "star3": {
            "starId": 402,
            "starName": "3*",
            "toursCount": 2838,
            "price": 15870
        },
        "star4": {
            "starId": 403,
            "starName": "4*",
            "toursCount": 2787,
            "price": 17371
        },
        "star5": {
            "starId": 404,
            "starName": "5*",
            "toursCount": 1168,
            "price": 17770
        }
    }
}
