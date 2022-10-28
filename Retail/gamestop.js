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
const CHANNEL = '810936162410692659' //channel id
const site = 'GAMESTOPUS'; //site name
const version = `Gamestop US v1.0` //Site version
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
            'User-Agent': 'GameStop_iOS/500.2.0 (iOS 15.4.1)',
        }
        let method = 'GET'; //request method
        let req = `https://api.gamestop.com/api/v2/products?productIds=${sku}&abcz=${v4()}`//request url
        let set = await helper.requestJson(req, method, proxy, headers)
        //console.log(set.response.status)
        if (set.response.status != 200) {
            monitor(sku);
            return
        }
        let body = await set.json //request function
        if(!body.productResponses.length > 0) {
            console.log(sku)
            await helper.sleep(product.waittime);
            return
        }
        let status = PRODUCTS[sku].sizes
        let variants = body.productResponses[0].variants
        let stockStatus
        for (let variant of variants) {
            if (variant.productId == sku)
            stockStatus = variant.available
        }
        if (stockStatus) {
            let url = `https://www.gamestop.com/${sku}.html#Tachyon`
            let stock = '1'
            let title = body.productResponses[0].title
            let price = body.productResponses[0].productPrice.basePriceValue.price.toString()
            let image = body.productResponses[0].productImages[0].url
            if (status !== "In-Stock") {
                let qt = 'NA'
                let links = `[ATC](https://www.gamestop.com/search/?sort=BestMatch_Desc&q=${sku}&p=1#Tachyon)`
                console.log(`[time: ${new Date().toISOString()}, product: ${sku}, title: ${title}]`)
                for (let group of sites[site]) {
                    await helper.postRetail(url, title, sku, price, image, stock, groups[group], site, version, qt, links)
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
