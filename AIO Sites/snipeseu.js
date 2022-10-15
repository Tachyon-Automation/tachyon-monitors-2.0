const helper = require('../x-help/helper');
const sites = require('../x-help/sites.json');
const groups = require('../x-help/groups.json');
const database = require('../x-help/database');
const discordBot = require('../x-help/discord')
const randomUseragent = require('random-useragent');
const Discord = require('discord.js');
const { v4 } = require('uuid');
const CHANNEL = '834542352394879046' //channel id
const site = 'SNIPESEU'; //site name
const version = `Snipes v1.0` //Site version
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
            'User-Agent': randomUseragent.getRandom(),
            'Poq-App-Version': `${v4()}`,
            'Poq-Platform': 'iOS',
            'Poq-Platform-Version': `${v4()}`,
            'Poq-Device-Model': 'iPhone',
            'x-px-bypass-reason': `${v4()}`,
            'x-px-bypass': `${v4()}`,
            'X-PX-AUTHORIZATION': `3:${v4()}`,     
            'cookie': `_px3=${v4()};_pxhd=${v4()}`    
        }
        let method = 'GET'; //request method
        let req = `https://www.snipes.com/de_DE/p/${sku}.html?dwvar_1_size=1&format=ajax&abcz=${v4()}`//request url
        let set = await helper.requestJson(req, method, proxy, headers) //request function
        let body = await set.json
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
        if (body.product.productName) {
            let inStock = false
            let url = `https://www.snipes.com/${sku}.html#Tachyon`
            let title = body.product.brand + ' ' + body.product.productName
            let price = body.product.price.sales.formatted
            let image = body.product.images[0].pdp.srcM
            let stock = 0
            let sizes = []
            let query = await database.query(`SELECT * from ${table} where sku='${sku}'`);
            let oldSizeList = await query.rows[0].sizes
            let sizeList = []
            let variants = body.product.variationAttributes[1].values
            //pars sizes for l
            for (let size of variants) {
                if (size.isOrderable === true) {
                    sizes += `[${size.value}](https://www.snipes.com/${size.variantId}.html#Tachyon) - ${size.variantId.trim()}\n`;
                    stock++
                    sizeList.push(size.value);
                    if (!oldSizeList.includes(size.value)) {
                        inStock = true;
                    }
                }
            }
            if (inStock) {
                console.log(`[time: ${new Date().toISOString()}, product: ${sku}, title: ${title}]`)
                inStock = false;
                let sizeright = sizes.split('\n')
                let sizeleft = sizeright.splice(0, Math.floor(sizeright.length / 2))
                for (let group of sites[site]) {
                    await helper.postAIO(url, title, sku, price, image, sizeright, sizeleft, stock, groups[group], site, version)
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