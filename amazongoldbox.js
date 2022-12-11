const helper = require('./x-help/helper');
const fs = require('fs');
const database = require('./x-help/database');
const HTMLParser = require('node-html-parser');
const Discord = require('discord.js');
const randomUseragent = require('random-useragent');
const table = 'amazondeal'
const { v4 } = require('uuid');
const { deepStrictEqual } = require('assert');
let offset = 0
let success = 0
let quary = 0
let skulist = []
startmonitor()
async function startmonitor() {
  let query = await database.query(`SELECT * from ${table}`);
  for (row of query.rows) {
    skulist.push(row.sku)
  }
  for (i = 0; i < 200; i++) {
    monitor()
  }
}
async function monitor() {
  try {
    let proxy = await helper.getRandomProxy() //proxy per site
    let agent = randomUseragent.getRandom()
    var ip = (Math.floor(Math.random() * 255) + 1) + "." + (Math.floor(Math.random() * 255)) + "." + (Math.floor(Math.random() * 255)) + "." + (Math.floor(Math.random() * 255));
    let headers = {
      "x-forwarded-for": ip,
      //'cookie': 'ubid-main=131-7158895-3564110; sid="4NPjmTwX5ugg2YllJIYsNA==|naTglXK71Hh/oMtGAV29ABwW9cKLJxqiGW9fVJO8Z4w="; lc-main=en_US; skin=noskin; ubid-acbus=134-5302987-1803100; s_pers=%20s_fid%3D16758A91CD6220FC-3345B643BF25AB60%7C1826337500711%3B%20s_dl%3D1%7C1668572900711%3B%20gpv_page%3DUS%253ASD%253ASOA-sem%7C1668572900713%3B%20s_ev15%3D%255B%255B%2527SEUSSOAGOOG-B10238B-D%2527%252C%25271668571100715%2527%255D%255D%7C1826337500715%3B; s_sess=%20s_cc%3Dtrue%3B%20s_ppvl%3DUS%25253ASD%25253ASOA-sem%252C29%252C29%252C745%252C1242%252C745%252C1920%252C1080%252C1%252CL%3B%20c_m%3DSEUSSOAGOOG-B10238B-Dwww.google.comPaid%2520Search%3B%20s_sq%3D%3B%20s_ppv%3DUS%25253ASD%25253ASOA-sem%252C29%252C29%252C745%252C1242%252C745%252C1920%252C1080%252C1%252CL%3B; s_cc=true; s_sq=%5B%5BB%5D%5D; csrf=1039969867; lwa-context=dbad46f6d0cc9d9e9dee5cdc507efe0c; session-id-apay=139-7338695-9897565; session-id=139-0506219-1434459; cwr_u=1229226c-b906-44c9-b940-8ad62b3867b6; sst-main=Sst1|PQHZiHKSpyAlk-ghnQ_CwntNCW5ABpj09ClLJ_4kb1_T2VLCczGstDZi35SGgmkvn5TVuj1rHN6fikWl_tDBiInbmTZY_z9uZlPMpWcidV3TK-D6qS-xY0pkOSUblLGQfqDkD8nGkmR0w3Ji9Jrziw0Xa-aH0dk4LQGd6S8NCfUA-1w82FM7wSbplwvm6hQ550whfAZMYKZKUrLpdO3D92rWq2yfuZbJMtYvT2_nzgP4tuvbnHOM-AorOqP2BzWRfY6eAzdNEG5TEYki2GCqgCovKFMMEIWYJTErcKwe7B0md-4; i18n-prefs=USD; s_nr=1670559076857-New; s_vnum=2102559076857%26vn%3D1; s_dslv=1670559076858; s_ppv=21; x-main="Ulq4TDrv8W?ZB?EENcYh5CbKC95nuAkFn@IMiaKiaRmDxxyIzkF5hnpCmKIXOBVh"; at-main=Atza|IwEBIESvRCmfnKmzvyxZ_bwhYSsRd9jPPX6YH7uRXE4EsyyWJYWp8euIljKSt5n1MhGNY3o0uPkQi0VqIALRIyavHvtLP4nuAwXC5apMKLPdHJ8FKxFePenbVfwCCnqhGPoeTBOwVDWTPEzJ7UT2e_THW4TomJW86YCmQH1gAay4zXGyZDwiYAPB8lR1ym1XnEW3OR4kNC2lDU3T_Bp0KUungKPc; sess-at-main="mJRUAgPgX1SeFPU4cPbdgcgCHeupYT/SYpDcFcVvC8w="; session-id-time=2082787201l; av-timezone=America/New_York; session-token=61PhNAkGgYcT9J7dYdO/r4S9IookEaIZBM0G2Ooammc4sUuuULc7+hjOo9CBuH2Gj/kcECuai75xjJkrRZAhAqx/TK1w6cB/RLsswCQloC6BkVebGloQj8OuUYns9dKBJ6tc/+1d2YqeBbSqbzIzW+VQCG9iKHgnG2HiVgXTXYWpHeTVqj6HWprVO9FtNA9xsdqiBWWV7TrABUgcFnytH0KYVyY19Ig0TiiYgbADBA+J8PbcRgYV9sp2Mff0A305; csm-hit=tb:JGNTFKG3YHKHZ3HV63T1+s-J54E34M23K0GNC0CT0GS|1670636473239&t:1670636473239&adb:adblk_yes',
      'user-agent': agent
    }

    let method = 'GET'; //request method
    let req = `https://www.amazon.com/gp/goldbox?deals-widget=%257B%2522version%2522%253A1%252C%2522viewIndex%2522%253A${quary}%252C%2522presetId%2522%253A%2522AB48D68973BA06D9DFD05723DA760601%2522%252C%2522prime%2522%253Atrue%252C%2522sorting%2522%253A%2522BY_SCORE%2522%257D`//request url
    let startTime = Date.now()
    let set = await helper.requestBody(req, method, proxy, headers)
    if (set.response.status != 200) {
      monitor();
      return

    } //request function
    //console.log(set.json.products)
    if (set.resp.includes("we just need to make sure you're not a robot")) {
      monitor();
      return
    }
    //offset += 3000
    let products = await set.resp.split(`('slot-15', {"widgetId":"`)[1].split('})')[0]
    products = await JSON.parse('{"widgetId":"' + products + '}')
    quary += 30
    if (products.prefetchedData.aapiSearchDealsTotalCount < quary) {
      quary = 0
    }
    console.log(quary)
    for (let product of products.prefetchedData.aapiGetDealsList[0].entities) {
      asin = 'B071YKRSBX'
      try {
        asin = product.entity.details.entity.landingPage.url.split('/dp/')[1]
      } catch (e) { }
      if (skulist.includes(asin)) {
        //console.log('already in database')
        continue
      }
      if (asin == undefined) {
        continue
      }
      skulist.push(asin)
      console.log(asin)
      success++
      database.query(`insert into ${table}(sku) values('${asin}')`)
    }
    //console.log(success)
    monitor();
    return
  } catch (e) {
    //console.log(e)
    monitor()
    return
  }
}
