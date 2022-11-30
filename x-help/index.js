const helper = require('./helper');

const chrome_filtered = require('./chromeFiltered.json');

module.exports = {
    getRandomFiltered: function () {
        return chrome_filtered[helper.getRandomNumber(0, chrome_filtered.length)];
    }
}