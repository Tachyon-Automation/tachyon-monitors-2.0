const helper = require('./x-help/helper');
const fs = require('fs');
const database = require('./x-help/database');
const HTMLParser = require('node-html-parser');
const Discord = require('discord.js');
const table = 'amazondeal'
const { v4 } = require('uuid');
const { Console } = require('console');
let success = 0
let asinslegth = 0
let asinstotal = 0
let skulist
startSet()
startMonitor()
async function startSet() {
  while (true) {
    skulist = await database.query(`SELECT * from ${table}`);
    asinslegth = skulist.rows.length
    await helper.sleep(300000)
  }
}
async function startMonitor() {
  skulist = await database.query(`SELECT * from ${table}`);
  asinslegth = skulist.rows.length
  for (i = 0; i < 300; i++) {
    let products = []
    for (j = 0; j < 25; j++) {
      try {
        products.push(skulist.rows[asinstotal + j].sku)
      } catch (e) { }
    }
    //console.log(products)
    //console.log('----------------------')
    monitor(products)
  }
}
async function monitor(products) {
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
      "user-agent": 'Sosospider+(+http://help.soso.com/webspider.htm)',
    }
    let method = 'POST'; //request method
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
      "ASINList": products,
    }

    let req = `https://www.amazon.com/juvec`//request url
    //console.log(req, method, proxy, headers, body)
    let set = await helper.requestJson3(req, method, proxy, headers, body)
    //console.log(set.response.status)
    if (set.response.status != 200) {
      monitor(products);
      return
    }
    asinstotal += 25
    //console.log(asinstotal)
    if (asinstotal > asinslegth) {
      asinstotal = 0
      return
    }
    products = []
    for (j = 0; j < 25; j++) {
      try {
        products.push(skulist.rows[asinstotal + j].sku)
      } catch (e) { }
    }
    //console.log(set.json.products)
    for (let product of set.json.products) {
      let title = product.title.displayString
      //let image = product.swatchImages.dimensions[0].dimensionValues[0].imageAttributes.media.url
      let asin = product.asin
      let totalsavings = 0
      //console.log(product.buyingOptions.length)
      if (product.productCategory.websiteDisplayGroup.displayString == 'eBooks' || product.productCategory.websiteDisplayGroup.displayString == 'Book' || product.productCategory.websiteDisplayGroup.displayString == 'Audible')
        continue
      for (let buyingOption of product.buyingOptions) {
        if (buyingOption.availability.type == 'OUT_OF_STOCK')
          continue
        try {
          if (buyingOption.price.basisPrice && totalprice < uyingOption.price.basisPrice.moneyValueOrRange.value.amount) {
            totalprice = buyingOption.price.basisPrice.moneyValueOrRange.value.amount
          } else {
            if (buyingOption.price.priceToPay.moneyValueOrRange.range && totalprice < buyingOption.price.priceToPay.moneyValueOrRange.range.min)
              totalprice = buyingOption.price.priceToPay.moneyValueOrRange.range.min
            else {
              if(totalprice < buyingOption.price.priceToPay.moneyValueOrRange.value.amount)
              totalprice = buyingOption.price.priceToPay.moneyValueOrRange.value.amount
            }
          }
        } catch (e) { }
        try {
          if (buyingOption.promotionsUnified.length = 1 && buyingOption.promotionsUnified.summary.unifiedIds.length > 0 && buyingOption.promotionsUnified.summary.length == 5 && buyingOption.promotionsUnified.summary.accessConfirmationShortMessage.fragments) {
            totalsavings += buyingOption.promotionsUnified.summary.accessConfirmationShortMessage.fragments[0].money.amount
          }
        } catch (e) { }
        try {
          if (buyingOption.promotionsUnified.length = 1 && buyingOption.promotionsUnified.summary.unifiedIds.length > 0 && buyingOption.promotionsUnified.summary.length == 5 && buyingOption.promotionsUnified.summary.mediumMessage.label.includes('%')) {
            totalsavings += Number(buyingOption.promotionsUnified.summary.mediumMessage.label.text.replace('Save ', '').replace('%', '')) / 100 * totalprice
          }
        } catch (e) { }
        if (buyingOption.price.savings) {
          totalsavings += buyingOption.price.savings.money.amount
        }
      }
      if (totalsavings > 0) {
        if ((totalsavings / totalprice) * 100 > 20) {
          //console.log(asin, totalsavings, totalprice)
        }
        if (totalsavings >= totalprice) {
          console.log(asin, totalsavings, totalprice)
        }
      }
    }
    monitor(products);
    return
  } catch (e) {
    //console.log(e)
    monitor(products)
    return
  }

}
