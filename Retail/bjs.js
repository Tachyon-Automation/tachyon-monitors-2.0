const helper = require('../x-help/helper');
const groups = require('../x-help/groups.json');
const database = require('../x-help/database');
const discordBot = require('../x-help/discord')
const randomUseragent = require('random-useragent');
const fs = require('fs');
const HTMLParser = require('node-html-parser');
const Discord = require('discord.js');
const { v4 } = require('uuid');
const CHANNEL = '881045892591939624' //channel id
const site = 'BJS'; //site name
const catagory = 'RETAIL'
const version = `BJS v1.0` //Site version
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
        let proxy = await helper.getRandomProxy() //proxy per site
        let headers = {
            'User-Agent': randomUseragent.getRandom(),
            'origin': 'https://www.bjs.com',
            'pragma': 'no - cache',
            'referer': 'https://www.bjs.com/',
            'sec-ch-ua': '" Not A;Brand"; v="99", "Chromium"; v="96", "Google Chrome"; v="96"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': "Windows",
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-site',
        }
        let method = 'GET'; //request method
        let req = `https://api.bjs.com/digital/live/api/v1.2/pdp/10201?productId=${sku}&pageName=PDP&abcz=${v4()}`//request url
        let set = await helper.requestJson(req, method, proxy, headers)
        console.log(set.response.status)
        if (set.response.status != 200) {
            monitor(sku);
            return
        }
        let body = await set.json //request function
        let status = PRODUCTS[sku].sizes
        if (body.bjsItemsInventory[0].availInventory === true) {
            let url = `https://www.bjs.com/product/tachyon/${sku}#Tachyon`
            let title = body.entitledItems[0].description.name
            let price = body.maxItemPrice
            let image = body.productImages.thumbNailImage
            let stock = body.entitledItems[0].description.available
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
