const helper = require('../x-help/helper');
const groups = require('../x-help/groups.json');
const database = require('../x-help/database');
const discordBot = require('../x-help/discord')
const randomUseragent = require('random-useragent');
const fs = require('fs');
const HTMLParser = require('node-html-parser');
const Discord = require('discord.js');
const { v4 } = require('uuid');
const CHANNEL = '810935871712788501' //channel id
const site = 'TARGET'; //site name
const catagory = 'RETAIL'
const version = `Target v1.0` //Site version
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
        let req = `http://redsky.target.com/redsky_aggregations/v1/web_platform/product_fulfillment_v1?key=9f36aeafbe60771e321a7cc95a78140772ab3e96&tcin=${sku}&store_id=3259&scheduled_delivery_store_id=1154&required_store_id=3259&has_required_store_id=true`//request url
        let set = await helper.requestJson(req, method, proxy, headers)
        console.log(set.response.status)
        if (set.response.status != 200) {
            monitor(sku);
            return
        }
        let body = await set.json //request function
        let status = PRODUCTS[sku].sizes
            if (body.data.product.fulfillment.shipping_options.availability_status === 'IN_STOCK') {
                let url = `https://www.target.com/p/tachyon/-/A-${sku}#Tachyon`
                let stock = body.data.product.fulfillment.shipping_options.available_to_promise_quantity
                if (status !== "In-Stock") {
                    let qt = 'NA'
                    let links = `[ATC](https://www.target.com/s?searchTerm=${sku}#Tachyon)`
                    let req = `http://redsky.target.com/redsky_aggregations/v1/web/pdp_client_v1?key=ff457966e64d5e877fdbad070f276d18ecec4a01&tcin=${sku}&store_id=3254&has_store_id=false&pricing_store_id=3254&has_pricing_store_id=true&scheduled_delivery_store_id=none&has_scheduled_delivery_store_id=false&has_financing_options=false&&has_size_context=true&_x_tr_sl=el&_x_tr_tl=en&_x_tr_hl=en&_x_tr_pto=wapp`//request url
                    let set = await helper.requestJson(req, method, proxy, headers) //request function
                    if (set.response.status != 200) {
                        monitor(sku);
                        return
                    }
                    let sites = await helper.dbconnect(catagory+site)
                    let body2 = await set.json
                    let title = body2.data.product.item.product_description.title.split('&#38;').join('&').split('&#8482;').join('™').split('&#8211;').join('-')
                    let image = body2.data.product.item.enrichment.images.primary_image_url || 'https://www.thermaxglobal.com/wp-content/uploads/2020/05/image-not-found.jpg';
                    let price = body2.data.product.price.formatted_current_price;
                    console.log(`[time: ${new Date().toISOString()}, product: ${sku}, title: ${title}]`)
                    for (let group of sites) {
                        await helper.postRetail(url, title, sku, price, image, stock, group, version, qt, links)
                    }
                    PRODUCTS[sku].sizes = 'In-Stock'
                    await database.query(`update ${table} set sizes='In-Stock' where sku='${sku}'`)
                    await helper.sleep(180000)
                }
            } else {
                if (status !== "Out-of-Stock") {
                    PRODUCTS[sku].sizes = 'Out-of-Stock'
                    await database.query(`update ${table} set sizes='Out-of-Stock' where sku='${sku}'`)
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
