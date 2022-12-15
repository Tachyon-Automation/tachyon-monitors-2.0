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
    await helper.sleep(6000)
  }
}
async function startMonitor() {
  skulist = await database.query(`SELECT * from ${table}`);
  asinslegth = skulist.rows.length
  for (i = 0; i < 300; i++) {
    let products = []
    for (j = 0; j < 30; j++) {
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
      "x-amz-acp-params": "tok=JMk1ilIzYvfpKP_3W1FrspccfAtiCzxtgJA60ucHLTg;ts=1670852860499;rid=7XC062R6ESYF2TDCTDNA;d1=213;d2=V4;tpm=CGHDB.content-id;ref=rp",
      "cookie": `x-main="pnGYktozOY8iXT2XFOhK5S5MNOliyp?mnw29x0k??pmqTYXaLNcalN7zNytnDlNU"; at-main=Atza|IwEBIKgD8lBb5tucNx6tqQd0Y_hgFn7g2sSVJRxw5Y8geWg-ODtwFzF5M63KJ1BMTqlvrlhJnwT5r-YBVpztwZwd5Uv0TujKEls6PJ1XkGDnPcB4d6W0sl9TxZE6jMIYQZAxV2THZL61ikbPDoj_popeSVlLaPbn6GStSOjvI2FLzkzqp4wGzBRIWcuo4U_n21MceRbxYUtOuxEm907JsfQ86KF0wfXGoPBMlXo4cUW2ba8giQ;`,
      "user-agent": 'Sosospider+(+http://help.soso.com/webspider.htm)',
    }
    let method = 'POST'; //request method
    let setasins = []
    for (let asin of products) {
      let seter = `{\"id\":\"${asin}\",\"index\":0,\"linkParameters\":{\"dataType\":\"Map\",\"value\":[[\"pd_rd_i\",\"\"]]},\"metadataMap\":{\"dataType\":\"Map\",\"value\":[]}}`
      setasins.push(seter)
    }
    let body = JSON.stringify({ "indexes": [], "ids": setasins, "almCardContextJson": "{}" })
    let req = `https://www.amazon.com/acp/buy-again-aisle-carousel-mobile/buy-again-aisle-carousel-mobile-18e5b038-781c-4185-af34-514e37cc9f2d-1670537684944/getCarouselItems`//request url
    let set = await helper.requestJson4(req, method, proxy, headers, body)
    if (set.response.status != 200) {
      monitor(products);
      return
    }
    asinstotal += 30
    //console.log(asinstotal)
    if (asinstotal > asinslegth) {
      asinstotal = 0
      return
    }
    products = []
    for (j = 0; j < 30; j++) {
      try {
        products.push(skulist.rows[asinstotal + j].sku)
      } catch (e) { }
    }
    //console.log(set.json.products)
    let root = set.html
    parse = root.querySelectorAll('li[class="a-carousel-card-fragment"]')
    for (let product of parse) {
      let totalsavings = 0
      if (set.text.includes('Out of stock'))
      continue
      let title = product.querySelector('.a-size-small.a-color-base').textContent
      //console.log(title)
      //let image = product.swatchImages.dimensions[0].dimensionValues[0].imageAttributes.media.url
      let asin = product.querySelector('.a-section.a-spacing-none').attributes['data-asin']
      let originalprice = Number(product.querySelector('._YnV5L_strikethroughPrice_3-ZUw .a-offscreen').textContent.replace('$', ''))
      let totalprice = Number(product.querySelector('._YnV5L_singlePriceToPay_1QbWS .a-offscreen').textContent.replace('$', ''))
      totalsavings += originalprice - totalprice
      if (set.text.includes('a-label a-checkbox-label')) {
        totalsavings += Number(product.querySelector('.a-label.a-checkbox-label').textContent.replace('Save $', ''))
      }
      if ((totalsavings / originalprice) * 100 >= 90) {
        console.log(asin, totalsavings, originalprice)
      }
      if (totalsavings >= originalprice) {
        console.log(asin, totalsavings, originalprice)
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
//https://www.amazon.com/gp/goldbox?deals-widget=%257B%2522version%2522%253A1%252C%2522viewIndex%2522%253A120%252C%2522presetId%2522%253A%2522AB48D68973BA06D9DFD05723DA760601%2522%252C%2522prime%2522%253Atrue%252C%2522sorting%2522%253A%2522BY_SCORE%2522%257D
//https://www.amazon.com/gp/goldbox?deals-widget=%257B%2522version%2522%253A1%252C%2522viewIndex%2522%253A0%252C%2522presetId%2522%253A%2522AB48D68973BA06D9DFD05723DA760601%2522%252C%2522prime%2522%253Atrue%252C%2522sorting%2522%253A%2522BY_SCORE%2522%257D
//https://www.amazon.com/gp/goldbox?deals-widget=%257B%2522version%2522%253A1%252C%2522viewIndex%2522%253A60%252C%2522presetId%2522%253A%2522AB48D68973BA06D9DFD05723DA760601%2522%252C%2522prime%2522%253Atrue%252C%2522sorting%2522%253A%2522BY_SCORE%2522%257D