const helper = require('./x-help/helper');
const fs = require('fs');
const database = require('./x-help/database');
const HTMLParser = require('node-html-parser');
const Discord = require('discord.js');
const table = 'amazondeal'
const { v4 } = require('uuid');
let count = 0
let success = 0
monitor()
for (let i = 0; i < 300; i++) {
  monitor()
}
async function monitor() {
  try {
    let proxy = await helper.getRandomProxy() //proxy per site
    let headers = {
      "accept": "*/*",
      "accept-encoding": "gzip, deflate, br",
      "cache-control": "max-age=0",
      "content-type": "application/json",
      "dnt": "1",
      "sec-fetch-dest": "document",
      "sec-fetch-mode": "navigate",
      "sec-fetch-site": "none",
      "sec-fetch-user": "?1",
      "sec-gpc": "1",
      "upgrade-insecure-requests": "1",
      "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.114 Safari/537.36",
    }
    let method = 'POST'; //request method
    let rms = ''
    let skus = []
    let items = ['7', '8', '9', 'B']
    let items2 = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
    for (let i = 0; i < 25; i++) {
      let item = items[Math.floor(Math.random() * items.length)]
      for (let i = 0; i < 8; i++) {
        rms += items2[Math.floor(Math.random() * items2.length)]
      }
      let sku = `B0${rms}`
      rms = ''
      skus.push(sku)
    }
    //console.log(skus)
    let body = {
      "requestContext": {
        "obfuscatedMarketplaceId": "ATVPDKIKX0DER",
        "obfuscatedMerchantId": "ATVPDKIKX0DER",
        "language": "en-US",
        "sessionId": "",
        "currency": "USD",
        "amazonApiAjaxEndpoint": "data.amazon.com"
      },
      "content": {
        "includeOutOfStock": true
      },
      "includeOutOfStock": true,
      "endpoint": "ajax-data",
      "ASINList": skus
    }
    let req = `https://www.amazon.com/juvec`//request url
    let startTime = Date.now()
    let set = await helper.requestJson3(req, method, proxy, headers, body)
    //console.log(set.response.status)
    count++
    if (set.response.status != 200) {
      monitor();
      return
    } //request function
    //console.log(set.json.products)
    let endtime = Date.now()
    if(set.json.products.length > 0){
      for(let product of set.json.products) {
        let sku = product.asin
        let query = await database.query(`SELECT * from ${table} where sku='${sku}'`);
        if (query.rows.length > 0)
        continue
        console.log(sku)
        database.query(`insert into ${table}(sku) values('${sku}')`)
      }
      success += set.json.products.length
    }
    console.log(success)
    monitor();
    return
  } catch (e) {
    //console.log(e)
    monitor()
    return
  }
}
