const helper = require('../x-help/helper');
const groups = require('../x-help/groups.json');
const database = require('../x-help/database');
const discordBot = require('../x-help/discord')
const randomUseragent = require('random-useragent');
const fs = require('fs');
const HTMLParser = require('node-html-parser');
const Discord = require('discord.js');
const { v4 } = require('uuid');
const CHANNEL = '810945673474080818' //channel id
const site = 'AMAZONUS'; //site name
const catagory = 'RETAIL'
const version = `Amazon US v1.0` //Site version
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
            //'user-agent': 'Mozilla/5.0 (compatible; Google-Site-Verification/1.0)',
        }
        let method = 'GET'; //request method
        let req = `https://www-amazon-com.translate.goog/gp/product/ajax/ref=dp_aod_ALL_mbc?experienceId=aodAjaxMain&asin=${sku}&_x_tr_sl=auto&_x_tr_tl=en&_x_tr_hl=en&_x_tr_pto=wapp`//request url
        let set = await helper.requestHtml(req, method, proxy, headers)
        //console.log(set.response.status)
        if (set.response.status != 200) {
            monitor(sku);
            return
        } //request function
        let root = set.html
        let status = PRODUCTS[sku].sizes
        if (root.querySelector('.a-price .a-offscreen')) {
            if (root.querySelector('.a-button-inner input[class="a-button-input"]').attributes['aria-label'].includes('Amazon.com')) {
                let url = `https://www.amazon.com/dp/${sku}#Tachyon`
                let title = root.querySelector('#aod-asin-block-asin').textContent.trim().split('\n')[0]
                let price = root.querySelector('.a-price .a-offscreen').textContent
                let image = root.querySelector('#aod-asin-image-id').attributes.src
                let parse = root.querySelector('.a-fixed-right-grid-col.aod-atc-column.a-col-right .a-declarative').attributes['data-aod-atc-action']
                let stock = '1'
                parse = JSON.parse(parse)
                let offerid = parse.oid
                if (status !== "In-Stock") {
                    let sites = await helper.dbconnect(catagory+site)
                    let retail = await helper.dbconnect("RETAILFILTEREDUS")
                    let qt = 'NA'
                    let links = `[ATC](https://www.amazon.com/gp/product/handle-buy-box/ref=dp_start-bbf_1_glance?offerListingID=${offerid}&ASIN=${sku}&isMerchantExclusive=0&merchantID=A3DWYIK6Y9EEQB&isAddon=0&nodeID=&sellingCustomerID=&qid=&sr=&storeID=&tagActionCode=&viewID=glance&rebateId=&ctaDeviceType=desktop&ctaPageType=detail&usePrimeHandler=0&sourceCustomerOrgListID=&sourceCustomerOrgListItemID=&wlPopCommand=&itemCount=20&quantity.1=1&asin.1=${sku}&submit.buy-now=Submit&dropdown-selection=&dropdown-selection-ubb=)`
                    console.log(`[time: ${new Date().toISOString()}, product: ${sku}, title: ${title}]`)
                    for (let group of sites) {
                        helper.postAmazon(url, title, sku, price, image, stock, offerid, group, version, qt, links)
                    }
                    for (let group of retail) {
                        helper.postAmazon(url, title, sku, price, image, stock, offerid, group, version, qt, links)
                    }
                    PRODUCTS[sku].sizes = 'In-Stock'
                    database.query(`update ${table} set sizes='In-Stock' where sku='${sku}'`)
                    await helper.sleep(150000)
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
