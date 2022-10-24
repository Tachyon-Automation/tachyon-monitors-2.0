const helper = require('../x-help/helper');
const sites = require('../x-help/sites.json');
const groups = require('../x-help/groups.json');
const database = require('../x-help/database');
const discordBot = require('../x-help/discord')
const randomUseragent = require('random-useragent');
const Discord = require('discord.js');
const { v4 } = require('uuid');
const CHANNEL = '1033945792442007644' //channel id
const site = 'SNIPESUSA'; //site name
const version = `Snipes USA v1.0` //Site version
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
        let proxy = 'http://usa.rotating.proxyrack.net:9000'; //proxy per site
        //these headers change per site
        let headers = {
            'User-Agent': "Mozilla/5.0 (compatible; Google-Site-Verification/1.0)",
            //'x-px-bypass-reason': "The%20certificate%20for%20this%20server%20is%20invalid.%20You%20might%20be%20connecting%20to%20a%20server%20that%20is%20pretending%20to%20be%20%E2%80%9Cpx-conf.perimeterx.net%E2%80%9D%20which%20could%20put%20your%20confidential%20information%20at%20risk."
        }
        let method = 'GET'; //request method
        let req = `https://www-snipesusa-com.translate.goog/on/demandware.store/Sites-snipesusa-Site/en_US/Product-Variation?dwvar_${sku}_color&pid=${sku}&quantity=1&_x_tr_sl=el&_x_tr_tl=en&_x_tr_hl=en&_x_tr_pto=wapp`//request url
        let set = await helper.requestJson(req, method, proxy, headers) //request function
        let body = await set.json
        //console.log(set.response.status)
        if (set.response.status == 404) {
            await helper.sleep(product.waittime);
            monitor(sku);
            return
        }
        if (set.response.status != 200) {
            monitor(sku)
            return
        }

        //Define body variables
        if (body[0].details.name) {
            let inStock = false
            let url = `https://www.snipesusa.com/${sku}.html#Tachyon`//product url
            let title = body.product.productName
            let price = body.product.price.sales.formatted
            let image =  body.product.images.zoom[0].url
            let stock = 0
            let sizes = []
            let query = await database.query(`SELECT * from ${table} where sku='${sku}'`);
            let oldSizeList = await query.rows[0].sizes
            let sizeList = []
            let variants = body.product.variationAttributes[1].values
            //pars sizes for l
            for (let variant of variants) {
                if(variant.selectable != true)
                continue
                sizes += `[${variant.displayValue}](https://www.snipesusa.com/tachyon-${sku}.html?size=${variant.displayValue})\n`
                count++
                sizeList.push(variant.displayValue);
                if (!oldSizeList.includes(variant.displayValue))
                    inStock = true;
            }
            if (inStock) {
                let qt = 'Na'
                let links = 'Na'
                console.log(`[time: ${new Date().toISOString()}, product: ${sku}, title: ${title}]`)
                inStock = false;
                let sizeright = sizes.split('\n')
                let sizeleft = sizeright.splice(0, Math.floor(sizeright.length / 2))
                for (let group of sites[site]) {
                    await helper.postAIO(url, title, sku, price, image, sizeright, sizeleft, stock, groups[group], site, version, qt, links)
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
helper.discordbot(CHANNEL, PRODUCTS, table, monitor, site)