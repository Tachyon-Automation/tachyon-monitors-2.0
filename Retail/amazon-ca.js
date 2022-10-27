const helper = require('../x-help/helper');
const sites = require('../x-help/sites.json');
const groups = require('../x-help/groups.json');
const database = require('../x-help/database');
const discordBot = require('../x-help/discord')
const randomUseragent = require('random-useragent');
const fs = require('fs');
const HTMLParser = require('node-html-parser');
const Discord = require('discord.js');
const { v4 } = require('uuid');
const CHANNEL = '901934921315135548' //channel id
const site = 'AMAZONCA'; //site name
const version = `Amazon CA v1.0` //Site version
const table = site.toLowerCase();
discordBot.login();
let PRODUCTS = {}
startMonitoring()
async function startMonitoring() {
    let SKUList = await database.query(`SELECT * from ${table}`);
    for (let row of SKUList.rows) {
        PRODUCTS[row.sku] = {
            sku: row.sku,
            waittime: row.waittime,
            sizes: row.sizes
        }
        monitor(row.sku)
    }
    console.log(`[${site}] Monitoring all SKUs!`)
}

async function monitor(sku) {
    try {
        let product = PRODUCTS[sku]
        if (!product)
            return;
        let proxy = 'http://usa.rotating.proxyrack.net:9000' //proxy per site
        let headers = {
            'user-agent': 'Mozilla/5.0 (Linux; Android 5.0; SM-G920A) AppleWebKit (KHTML, like Gecko) Chrome Mobile Safari (compatible; AdsBot-Google-Mobile; +http://www.google.com/mobile/adsbot.html)',
        }
        let method = 'GET'; //request method
        let req = `https://www-amazon-ca.translate.goog/gp/product/ajax/ref=dp_aod_ALL_mbc?experienceId=aodAjaxMain&asin=${sku}&_x_tr_sl=el&_x_tr_tl=en&_x_tr_hl=en&_x_tr_pto=wapp`//request url
        let set = await helper.requestHtml(req, method, proxy, headers)
        //console.log(set.response.status)
        if (set.response.status != 200) {
            monitor(sku);
            return
        } //request function
        let root = HTMLParser.parse(await set.text)
        let status = product.sizes
        if (root.querySelector('.a-price .a-offscreen')) {
            if (root.querySelector('.a-button-inner input[class="a-button-input"]').attributes['aria-label'].includes('Amazon.ca')) {
                let url = `https://www.amazon.com/dp/${sku}#Tachyon`
                let title = root.querySelector('#aod-asin-block-asin').textContent.trim().split('\n')[0]
                let price = root.querySelector('.a-price .a-offscreen').textContent
                let image = root.querySelector('#aod-asin-image-id').attributes.src
                let parse = set.text.split('data-aw-aod-cart-api="')[1].split('">')[0].replaceAll('&quot;', '"')
                let stock = '1'
                parse = JSON.parse(parse)
                let offerid = parse.oid
                if (status !== "In-Stock") {
                    let qt = 'NA'
                    let links = `[ATC](https://www.amazon.com/gp/product/handle-buy-box/ref=dp_start-bbf_1_glance?offerListingID=${offerid}&ASIN=${sku}&isMerchantExclusive=0&merchantID=A3DWYIK6Y9EEQB&isAddon=0&nodeID=&sellingCustomerID=&qid=&sr=&storeID=&tagActionCode=&viewID=glance&rebateId=&ctaDeviceType=desktop&ctaPageType=detail&usePrimeHandler=0&sourceCustomerOrgListID=&sourceCustomerOrgListItemID=&wlPopCommand=&itemCount=20&quantity.1=1&asin.1=${sku}&submit.buy-now=Submit&dropdown-selection=&dropdown-selection-ubb=)`
                    console.log(`[time: ${new Date().toISOString()}, product: ${sku}, title: ${title}]`)
                    for (let group of sites[site]) {
                        await helper.postAmazon(url, title, sku, price, image, stock, offerid, groups[group], site, version, qt, links)
                    }
                    PRODUCTS[sku].sizes = 'In-Stock'
                    database.query(`update ${table} set sizes='In-Stock' where sku='${sku}'`)
                }
            } else {
                if (status !== "Out-of-Stock") {
                    PRODUCTS[sku].sizes = 'Out-of-Stock'
                    database.query(`update ${table} set sizes='Out-of-Stock' where sku='${sku}'`)
                }
            }
        }
        await helper.sleep(product.waittime);
        monitor(sku);
        return
    } catch (e) {
        //console.log(e)
        monitor(sku)
        return
    }
}
helper.discordbot(CHANNEL, PRODUCTS, table, monitor, site)
