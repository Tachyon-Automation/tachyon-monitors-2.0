const pg = require('pg');
const helper = require('./helper');
const pool = new pg.Pool({
    user: 'postgres',
    host: '143.244.222.127',
    database: 'monitors',
    password: 'thisistooeasy',
    port: 5432,
});

module.exports = pool;
 function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
sleep(1000)