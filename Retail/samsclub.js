const helper = require('../x-help/helper');
const groups = require('../x-help/groups.json');
const database = require('../x-help/database');
const discordBot = require('../x-help/discord')
const randomUseragent = require('random-useragent');
const fs = require('fs');
const HTMLParser = require('node-html-parser');
const Discord = require('discord.js');
const { v4 } = require('uuid');
const CHANNEL = '839838794253074442' //channel id
const site = 'SAMSCLUB'; //site name
const catagory = 'RETAIL'
const version = `Samsclub v1.0` //Site version
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
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36',
        }
        let method = 'GET'; //request method
        let req = `https://api.samsclub.com/v2/az/products/${sku}?type=PRODUCT_CARD`//request url
        let set = await helper.requestJson(req, method, proxy, headers)
        //console.log(set.response.status)
        if (set.response.status != 200) {
            monitor(sku);
            return
        }
        let body = await set.json //request function
        let status = PRODUCTS[sku].sizes
        if (body.payload.skus[0].onlineOffer && body.payload.skus[0].onlineOffer.inventory.availableToSellQuantity > 0) {
            let url = `https://www.samsclub.com/p/tachyon/${sku}#Tachyon`
            let price = '$' + body.payload.skus[0].onlineOffer.price.finalPrice.amount;
            let title = body.payload.descriptors.name;
            let imagePath = body.payload.skus[0].assets.image
            let image = `https://scene7.samsclub.com/is/image/samsclub/${imagePath}`
            let stock = body.payload.skus[0].onlineOffer.inventory.availableToSellQuantity
            if (status !== "In-Stock") {
                let sites = await helper.dbconnect(catagory+site)
                let qt = 'NA'
                let links = `[ATC](https://www.samsclub.com/p/tachyon/${sku}#Tachyon)`
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
        monitor(sku);
        return
    } catch (e) {
        //console.log(e)
        monitor(sku)
        return
    }
}
helper.discordbot(CHANNEL, PRODUCTS, table, monitor, site)
