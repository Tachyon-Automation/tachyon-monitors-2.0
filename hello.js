const helper = require('./x-help/helper');
const fs = require('fs');
const fetch = require('node-fetch');
const randomUseragent = require('random-useragent');
const HTTPSProxyAgent = require('https-proxy-agent')
const HTMLParser = require('node-html-parser');
const Discord = require('discord.js');
const { v4 } = require('uuid');
let count = 0
monitor()
for (let i = 0; i < 5; i++) {
  monitor()
}
async function monitor() {
  try {
    let proxy = await helper.getRandomProxy2() //proxy per site
    let agent = randomUseragent.getRandom()
    var ip = (Math.floor(Math.random() * 255) + 1) + "." + (Math.floor(Math.random() * 255)) + "." + (Math.floor(Math.random() * 255)) + "." + (Math.floor(Math.random() * 255));

    let headers = {
        "content-type": "application/x-www-form-urlencoded",
        //"User-Agent": agent,
        'X-Forwarded-For': ip,
    }

    let body = "widgetConfig=%257B%2522query%2522%253A%257B%2522queryType%2522%253A%2522AND%2522%252C%2522conditions%2522%253A%255B%257B%2522queryType%2522%253A%2522OR%2522%252C%2522conditions%2522%253A%255B%257B%2522conditionType%2522%253A%2522PROGRAM%2522%252C%2522values%2522%253A%255B%2522sns%2522%255D%257D%255D%257D%255D%257D%252C%2522sortType%2522%253A%2522MOST_POPULAR%2522%252C%2522title%2522%253A%2522Subscribe%2520and%2520Save%2520Coupons%2522%252C%2522moreCouponLinkUrl%2522%253A%2522%252Fb%253Fnode%253D13213777011%2522%252C%2522moreCouponLinkText%2522%253A%2522%255BSee%2520more%255D%2522%252C%2522showSort%2522%253A%25221%2522%252C%2522preRenderCouponCount%2522%253A%252210%2522%252C%2522couponsPerPage%2522%253A%2522200%2522%252C%2522maxCouponsPerRequest%2522%253A%252230%2522%252C%2522excludedPromotionIds%2522%253A%255B%255D%252C%2522promotionIds%2522%253A%255B%255D%252C%2522recentOrExpiring%2522%253A%2522recent%2522%252C%2522creativeId%2522%253A%25225192aa3a-5e99-47ec-a654-a78b16601a73%2522%252C%2522placementId%2522%253A%25224e355e62-ec13-40f8-8be0-f2bdc89e513e%2522%257D&offset=0&limit=3000&widgetType=SHOVELER&sortType=MOST_POPULAR"
    let method = 'POST'; //request method
    let req = `https://www.amazon.com/hz/coupons/loadMoreCoupons`//request url
    let set = await fetch(req, { method: method, headers: headers, agent: await new HTTPSProxyAgent(proxy), body: body, timeout: 2000 })
    console.log(set.status)
    if (set.status != 200) {
      monitor();
      return
    } //request function
    let root = HTMLParser.parse(await set.text())
    let products  = root.querySelectorAll('.a-section.a-text-left.coupon')
    for(let product of products){
        console.log(product.attributes['data-asin'])
    }
    monitor();
    return
  } catch (e) {
    //console.log(e)
    monitor()
    return
  }
}