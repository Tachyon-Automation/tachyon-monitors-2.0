const helper = require('../x-help/helper');
const sites = require('../x-help/sites.json');
const groups = require('../x-help/groups.json');
const database = require('../x-help/database');
const discordBot = require('../x-help/discord')
const randomUseragent = require('random-useragent');
const HTMLParser = require('node-html-parser');
const Discord = require('discord.js');
const { v4 } = require('uuid');
const CHANNEL = '849644891817902090' //channel id
const site = 'SNS'; //site name
const version = `SNS v1.0` //Site version
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
            'cookie': v4(),
            'user-agent': 'Mozilla/5.0 (Linux; Android 5.0; SM-G920A) AppleWebKit (KHTML, like Gecko) Chrome Mobile Safari (compatible; AdsBot-Google-Mobile; +http://www.google.com/mobile/adsbot.html)',
        }
        let method = 'GET'; //request method
        let req = `https://www-sneakersnstuff-com.translate.goog/en/product/${sku}?cache=${v4()}&_x_tr_sl=el&_x_tr_tl=en&_x_tr_hl=en&_x_tr_pto=wapp`//request url
        let set = await helper.requestHtml(req, method, proxy, headers)
        if (set.response.status != 200) {
            monitor(sku);
            return
        } //request function
        let root = HTMLParser.parse(await set.text)
        if (root.querySelector('.product-view__info.product-view__info--no-shop')) {
            //console.log('OOS!')
            await helper.sleep(1000);
            monitor(sku);
            return;
        }
        if (root.querySelector('.product-view__info.product-view__info--unavailable')) {
            //console.log('Unsported Region!')
            await helper.sleep(1000);
            monitor(sku);
            return;
        }
        if (root.querySelector('.price__current')) {
            let title = root.querySelector('.product-view__title span').textContent.trim()
            let price = root.querySelector('.price__current').textContent.trim()
            let image = 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829'
            try { image = 'https://www.sneakersnstuff.com' + root.querySelector('.embed-responsive img').attributes.src } catch (e) {}
            let url = `https://www.sneakersnstuff.com/en/product/${sku}#Tachyon`
            let sizes = []
            let query = await database.query(`SELECT * from ${table} where sku='${sku}'`);
            let newsku = sku.split('/')[0]
            let oldSizeList = await query.rows[0].sizes
            let inStock = false
            let sizeList = []
            let variants = root.querySelector('#product-size').querySelectorAll('option')
            let stock = 0
            for (let variant of variants) {
                if(variant.attributes.value.length == 0)
                continue
                sizes += `${variant.textContent.trim()} - ${variant.attributes.value}\n`
                stock++
                sizeList.push(variant.textContent.trim());
                if (!oldSizeList.includes(variant.textContent.trim()))
                    inStock = true;
            }
            if (inStock) {
                console.log(`[time: ${new Date().toISOString()}, product: ${sku}, title: ${title}]`)
                inStock = false;
                let sizeright = sizes.split('\n')
                let sizeleft = sizeright.splice(0, Math.floor(sizeright.length / 2))
                for (let group of sites[site]) {
                    helper.postAIO(url, title, newsku, price, image, sizeright, sizeleft, stock, groups[group], site, version)
                }
                await database.query(`update ${table} set sizes='${JSON.stringify(sizeList)}' where sku='${sku}'`);
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
helper.discordbot(CHANNEL, PRODUCTS, table, monitor)
