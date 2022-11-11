const helper = require('../x-help/helper');
const groups = require('../x-help/groups.json');
const database = require('../x-help/database');
const discordBot = require('../x-help/discord')
const randomUseragent = require('random-useragent');
const fs = require('fs');
const HTMLParser = require('node-html-parser');
const Discord = require('discord.js');
const { v4 } = require('uuid');
const CHANNEL = '810936556759678986' //channel id
const site = 'CANADACOMPUTERS'; //site name
const catagory = 'RETAIL'
const version = `Canda Computers v1.0` //Site version
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
        let proxy = await helper.getRandomProxy2() //proxy per site
        let headers = {
            'user-agent': 'Mozilla/5.0 (compatible; Google-Site-Verification/1.0)',
        }
        let method = 'GET'; //request method
        let req = `https://www.canadacomputers.com/product_info.php?cPath=21_273_274&item_id=${sku}&abcz=${v4()}`//request url
        let set = await helper.requestHtml(req, method, proxy, headers)
        if (set.response.status != 200) {
            monitor(sku);
            return
        } //request function
        let root = set.html
        console.log(set.response.status)
        let status = PRODUCTS[sku].sizes
        if (root.querySelector('.h3.mb-0')) {
            if (root.querySelector('#btn-addCart')) {
                let url = `https://www.canadacomputers.com/product_info.php?cPath=4_64_1969&item_id=${sku}#Tachyon`
                let title = root.querySelector('.h3.mb-0').textContent;
                let price = root.querySelector('.h2-big').textContent;
                let image = root.querySelector('.colorbox').attributes.href;
                let stock = '1'
                if (status !== "In-Stock") {
                    let sites = await helper.dbconnect(catagory+site)
                    let retail = await helper.dbconnect("RETAILFILTEREDCA")
                    let qt = 'NA'
                    let links = `[ATC](https://www.canadacomputers.com/shopping_cart.php?action=bundle_add_to_cart&item0=${sku}&qty0=1d)`
                    console.log(`[time: ${new Date().toISOString()}, product: ${sku}, title: ${title}]`)
                    for (let group of sites) {
                        helper.postRetail(url, title, sku, price, image, stock, group, version, qt, links)
                    }
                    for (let group of retail) {
                        helper.postRetail(url, title, sku, price, image, stock, group, version, qt, links)
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
