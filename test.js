var google = require('google');

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

const { getHotTours, getTours } = require('./toursApi.js');

getTours(19, 402).then(response => {
    console.log('test', response.data.result.data);
});
