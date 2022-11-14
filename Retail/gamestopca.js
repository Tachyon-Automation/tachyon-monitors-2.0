const helper = require('../x-help/helper');
const groups = require('../x-help/groups.json');
const database = require('../x-help/database');
const discordBot = require('../x-help/discord')
const randomUseragent = require('random-useragent');
const fs = require('fs');
const HTMLParser = require('node-html-parser');
const Discord = require('discord.js');
const { v4 } = require('uuid');
const CHANNEL = '852729195741970522' //channel id
const site = 'GAMESTOPCA'; //site name
const catagory = 'RETAIL'
const version = `Gamestop CA v1.0` //Site version
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
            'user-agent': 'Mozilla/5.0 (Linux; Android 5.0; SM-G920A) AppleWebKit (KHTML, like Gecko) Chrome Mobile Safari (compatible; AdsBot-Google-Mobile; +http://www.google.com/mobile/adsbot.html)',
        }
        let method = 'GET'; //request method
        let req = `https://www.gamestop.ca/Toys-Collectibles/Games/${sku}`//request url
        let set = await helper.requestHtml2(req, method, proxy, headers)
        //console.log(set.response.status)
        if (set.response.status != 200) {
            monitor(sku);
            return
        } //request function
        let root = set.html
        let status = product.sizes
        if (root.querySelector('.availabilityImg')) {
            if (root.querySelector('.availabilityImg').attributes.src === '/Content/Images/deliveryAvailable.png') {
                let url = `https://www.gamestop.ca/Toys-Collectibles/Games/${sku}#Tachyon`
                let title = root.querySelector('.prodTitle span').textContent.replace('&nbsp;','').trim()
                let price = root.querySelector('.prodPriceCont.valuteCont.pricetext').textContent
                let image = root.querySelector('.prodImg.max').attributes.href
                let stock = '1'
                if (status !== "In-Stock") {
                    let sites = await helper.dbconnect(catagory+site)
                    let retail = await helper.dbconnect("RETAILFILTEREDCA")
                    let qt = 'NA'
                    let links = `[ATC](https://www.gamestop.ca/Toys-Collectibles/Games/${sku}#Tachyon)`
                    console.log(`[time: ${new Date().toISOString()}, product: ${sku}, title: ${title}]`)
                    for (let group of sites) {
                        helper.postRetail(url, title, sku, price, image, stock, group, version, qt, links)
                    }
                    for (let group of retail) {
                        helper.postRetail(url, title, sku, price, image, stock, group, version, qt, links)
                    }
                    PRODUCTS[sku].sizes = 'In-Stock'
                    database.query(`update ${table} set sizes='In-Stock' where sku='${sku}'`)
                    await helper.sleep(300000)
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
