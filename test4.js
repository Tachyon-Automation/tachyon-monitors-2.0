const database = require('./x-help/database');
const table = 'amazondeal'
let skulist = []
let asin = 'B0B8QFDKHP'
checksku()
async function checksku() {
  let query = await database.query(`SELECT * from ${table}`);
  for (row of query.rows) {
    skulist.push(row.sku)
  }
  if (skulist.includes(asin)) {
    console.log('exists')
  } else {
    console.log('does not exist')
  }
}
