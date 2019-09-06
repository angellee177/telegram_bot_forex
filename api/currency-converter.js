const Axios = require('axios'); // Axios library for promisified fetch
const apiKey = "d318f794f645eb9e8b80"


BASE_URL = "https://free.currconv.com/api/v7/";

module.exports = {
    /**
     * Get the rate exchange
     * @param {*} source
     * @param {*} destination
     */
    getRate(source, destination) {
        const query = source + '_' + destination;
        return Axios.get(`${BASE_URL}convert?q=${query}&compact=ultra&apiKey=${apiKey}`);
    }
};