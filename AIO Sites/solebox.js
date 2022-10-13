const helper = require('../x-help/helper');
const sites = require('../x-help/sites.json');
const groups = require('../x-help/groups.json');
const database = require('../x-help/database');
const discordBot = require('../x-help/discord')
const randomUseragent = require('random-useragent');
const Discord = require('discord.js');
const { v4 } = require('uuid');
const CHANNEL = '810930267102773248' //channel id
const site = 'SOLEBOX'; //site name
const version = `Solebox v2.0` //Site version
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
            //'x-px-bypass-reason': 'The%20certificate%20for%20this%20server%20is%20invalid.%20You%20might%20be%20connecting%20to%20a%20server%20that%20is%20pretending%20to%20be%20%E2%80%9Cpx-conf.perimeterx.net%E2%80%9D%20which%20could%20put%20your%20confidential%20information%20at%20risk.',
            'X-PX-AUTHORIZATION': `3:62a8c30961b81541bcbb29f0eb043b16bc6be2d7b1d0c64b5dcf1b850330b0d1:3P9mQ7i7jh4ZEpE4l6tGGRk5wtk7Kj+i0eeljlNbxZyi0ysxsEtupkfWuwBntjgxFCjoNpAN8OZoUaFF1DW0yg==:1000:byJ1Hrz4SIiClbdQn4Y1o/sr4qYOCT0J1oaSeGAVJN7iCOHMGhqSRXqGJVdosF1j/d/MGcRMJ9bByG9RKNo7ja7PJUy9sjxibEMjcGXnqLryGYhL/Ew7jbJgMiIE4JuNjgVy1OA04ZspU69po1PdLrXHOL6btkVhbznib9bLbsF+NgUZ7iTB1Vwk3eAKKpJtlor95CGt8FCxi5DJjRrnhw==`,        
        }
        let method = 'GET'; //request method
        let req = `https://www.solebox.com/de_DE/p/${sku}.html;.js?dwvar_1_size=1&format=ajax&abcz=${v4()}`//request url
        let set = await helper.requestJson(req, method, proxy, headers) //request function
        //console.log(set.response.status)
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
            let url = `https://www.solebox.com/${sku}.html#Tachyon`
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
                    sizes += `[${size.value}](https://www.solebox.com/${size.variantId}.html#Tachyon) - ${size.variantId.trim()}\n`;
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