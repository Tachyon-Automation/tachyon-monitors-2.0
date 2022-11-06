const helper = require('../x-help/helper');
const groups = require('../x-help/groups.json');
const database = require('../x-help/database');
const discordBot = require('../x-help/discord')
const randomUseragent = require('random-useragent');
const fs = require('fs');
const HTMLParser = require('node-html-parser');
const Discord = require('discord.js');
const { v4 } = require('uuid');
const CHANNEL = '810936211027001354' //channel id
const site = 'BESTBUYUS'; //site name
const catagory = 'RETAIL'
const version = `Bestbuy US v1.0` //Site version
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
            'user-agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36",
        }
        let method = 'GET'; //request method
        let req = `https://www-bestbuy-com.translate.goog/api/3.0/priceBlocks?skus=${sku}&_x_tr_sl=auto&_x_tr_tl=en&_x_tr_hl=en&_x_tr_pto=wapp`//request url
        let set = await helper.requestJson(req, method, proxy, headers)
        //console.log(set.response.status)
        if (set.response.status != 200) {
            monitor(sku);
            return
        }
        let body = await set.json //request function
        let status = PRODUCTS[sku].sizes
        if (body[0].sku.buttonState.purchasable && body[0].sku.buttonState.buttonState == 'ADD_TO_CART') {
            let url = `https://www.bestbuy.com/site/tachyon/${sku}.p?skuId=${sku}#Tachyon`
            let price = '$' + body[0].sku.price.currentPrice
            let title = body[0].sku.names.short
            let image = `https://pisces.bbystatic.com/image2/BestBuy_US/images/products/${sku.substring(0, 4)}/${sku}_sd.jpg`
            let stock = '1'
            if (status !== "In-Stock") {
                let sites = await helper.dbconnect(catagory+site)
                let qt = 'NA'
                let links = `[ATC](https://api.bestbuy.com/click/tachyon/${sku}/cart#Tachyon)`
                console.log(`[time: ${new Date().toISOString()}, product: ${sku}, title: ${title}]`)
                for (let group of sites) {
                    await helper.postRetail(url, title, sku, price, image, stock, group, version, qt, links)
                }
                PRODUCTS[sku].sizes = 'In-Stock'
                await database.query(`update ${table} set sizes='In-Stock' where sku='${sku}'`)
            }
        } else {
            if (status !== "Out-of-Stock") {
                PRODUCTS[sku].sizes = 'Out-of-Stock'
                await database.query(`update ${table} set sizes='Out-of-Stock' where sku='${sku}'`)
            }
        }
        await helper.sleep(product.waittime);
        await monitor(sku)
        return
    } catch (e) {
        //console.log(e)
        monitor(sku)
        return
    }
}
helper.discordbot(CHANNEL, PRODUCTS, table, monitor, site)
