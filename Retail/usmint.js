const helper = require('../x-help/helper');
const groups = require('../x-help/groups.json');
const database = require('../x-help/database');
const discordBot = require('../x-help/discord')
const randomUseragent = require('random-useragent');
const fs = require('fs');
const HTMLParser = require('node-html-parser');
const Discord = require('discord.js');
const { v4 } = require('uuid');
const CHANNEL = '810952829392257046' //channel id
const site = 'USMINT'; //site name
const catagory = 'RETAIL'
const version = `US Mint v1.0` //Site version
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
            'user-agent': 'Mozilla/5.0 (compatible; Google-Site-Verification/1.0)',
        }
        let method = 'GET'; //request method
        let req = `https://catalog-usmint-gov.translate.goog/on/demandware.store/Sites-USM-Site/default/Product-Variation?pid=${sku}&format=ajax&_x_tr_sl=auto&_x_tr_tl=en&_x_tr_hl=en&_x_tr_pto=wapp`//request url
        let set = await helper.requestHtml(req, method, proxy, headers)
        //console.log(set.response.status)
        if (set.response.status != 200) {
            monitor(sku);
            return
        } //request function
        let root = set.html
        let status = PRODUCTS[sku].sizes
        if (root.querySelector('#hidden-product-name')) {
            if (root.querySelector('.in-stock-msg') && !root.querySelector('img#sold-out-image')) {
                let url = `https://catalog.usmint.gov/tachyon-${sku}.html#Tachyon`
                let title = root.querySelector('#hidden-product-name').textContent;
                let price = root.querySelector('.price-regular').textContent.trim()
                let image = 'https://cdn.discordapp.com/attachments/810952829392257046/973721563776053329/unknown.png'
                let stock = root.querySelector('.input-text').attributes["data-available"].split('.')[0]
                if (status !== "In-Stock") {
                    let sites = await helper.dbconnect(catagory+site)
                    let qt = 'NA'
                    let links = `[ATC](https://catalog.usmint.gov/on/demandware.store/Sites-USM-Site/default/Cart-MiniAddProduct?pid=${sku})`
                    console.log(`[time: ${new Date().toISOString()}, product: ${sku}, title: ${title}]`)
                    for (let group of sites) {
                        await helper.postRetail(url, title, sku, price, image, stock, group, version, qt, links)
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
        await monitor(sku);
        return
    } catch (e) {
        //console.log(e)
        monitor(sku)
        return
    }
}
helper.discordbot(CHANNEL, PRODUCTS, table, monitor, site)
