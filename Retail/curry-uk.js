const helper = require('../x-help/helper');
const groups = require('../x-help/groups.json');
const database = require('../x-help/database');
const discordBot = require('../x-help/discord')
const randomUseragent = require('random-useragent');
const fs = require('fs');
const HTMLParser = require('node-html-parser');
const Discord = require('discord.js');
const { v4 } = require('uuid');
const CHANNEL = '810945612203032588' //channel id
const site = 'CURRYUK'; //site name
const catagory = 'RETAIL'
const version = `CURRY UK v1.0` //Site version
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
            'User-Agent': 'Mozilla/5.0 (compatible; Google-Site-Verification/1.0)',
        }
        let method = 'GET'; //request method
        let req = `https://api-currys-co-uk.translate.goog/smartphone/api/productsStock/${sku}?abcz=${v4()}&_x_tr_sl=auto&_x_tr_tl=en&_x_tr_hl=en-US&_x_tr_pto=nui`//request url
        let set = await helper.requestJson(req, method, proxy, headers)
        //console.log(set.response.status)
        if (set.response.status != 200) {
            monitor(sku);
            return
        }
        let body = await set.json //request function
        let status = PRODUCTS[sku].sizes
        if (body.payload[0].quantityAvailable > 0) {
            let url = `https://www.currys.co.uk/gbuk/tachyon-${sku}-pdt.html#Tachyon`
            if (status !== "In-Stock") {
                let req2 = `https://www-currys-co-uk.translate.goog/on/demandware.store/Sites-curryspcworlduk-Site/en_GB/Product-Variation?pid=${sku}&_x_tr_sl=el&_x_tr_tl=en&_x_tr_hl=en&_x_tr_pto=wapp`
                let set2 = await helper.requestJson(req2, method, proxy, headers)
                if (set2.response.status != 200) {
                    monitor(sku);
                    return
                }
                let body2 = await set2.json
                let title = body2.productName
                let price = body2.price.sales.formatted
                let image = body2.product.images['l-large'][0].url
                let stock = body.payload[0].quantityAvailable
                let sites = await helper.dbconnect(catagory+site)
                let retail = await helper.dbconnect("RETAILFILTEREDEU")
                let qt = 'NA'
                let links = `[ATC](https://www.currys.co.uk/search?q=${sku}#Tachyon)`
                //console.log(`[time: ${new Date().toISOString()}, product: ${sku}, title: ${title}]`)
                for (let group of sites) {
                    helper.postRetail(url, title, sku, price, image, stock, group, version, qt, links)
                }
                for (let group of retail) {
                    helper.postRetail(url, title, sku, price, image, stock, group, version, qt, links)
                }
                PRODUCTS[sku].sizes = 'In-Stock'
                await database.query(`update ${table} set sizes='In-Stock' where sku='${sku}'`)
                await helper.sleep(150000)
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
