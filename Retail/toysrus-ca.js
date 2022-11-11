const helper = require('../x-help/helper');
const groups = require('../x-help/groups.json');
const database = require('../x-help/database');
const discordBot = require('../x-help/discord')
const randomUseragent = require('random-useragent');
const fs = require('fs');
const HTMLParser = require('node-html-parser');
const Discord = require('discord.js');
const { v4 } = require('uuid');
const CHANNEL = '810945522176753664' //channel id
const site = 'TOYSRUSCA'; //site name
const catagory = 'RETAIL'
const version = `Toysrus CA v1.0` //Site version
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
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36',
        }
        let method = 'GET'; //request method
        let req = `https://www.toysrus.ca/en/product-variation?pid=${sku}&quantity=1&mobile=true&abcz=${v4()}`//request url
        let set = await helper.requestJson(req, method, proxy, headers)
        //console.log(set.response.status)
        if (set.response.status != 200) {
            monitor(sku);
            return
        }
        let body = await set.json //request function
        let status = PRODUCTS[sku].sizes
        if (body.product.availability.ats > 0) {
            let url = `https://www.toysrus.ca/en/tachyon/${sku}.html#Tachyon`
            let title = body.product.productName
            let price = body.product.price.sales.formatted
            let image = body.product.images.large[0].url
            let stock = body.product.availability.ats
            if (status !== "In-Stock") {
                let sites = await helper.dbconnect(catagory+site)
                let retail = await helper.dbconnect("RETAILFILTEREDCA")
                let qt = 'NA'
                let links = `[ATC](https://www.samsclub.com/p/tachyon/${sku}#Tachyon)`
                console.log(`[time: ${new Date().toISOString()}, product: ${sku}, title: ${title}]`)
                for (let group of sites) {
                    helper.postRetail(url, title, sku, price, image, stock, group, version, qt, links)
                }
                for (let group of retail) {
                    helper.postRetail(url, title, sku, price, image, stock, group, version, qt, links)
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
