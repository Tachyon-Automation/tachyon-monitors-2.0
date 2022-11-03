const helper = require('../x-help/helper');
const sites = require('../x-help/sites.json');
const groups = require('../x-help/groups.json');
const database = require('../x-help/database');
const discordBot = require('../x-help/discord')
const Discord = require('discord.js');
const { v4 } = require('uuid');
const CHANNEL = '810949419322441798' //channel id
const site = 'FINISHLINE2'; //site name
const version = `Finishline v2.0` //Site version
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
        let proxy = await helper.getRandomProxy(); //proxy per site
        //these headers change per site
        let headers = {
            'user-agent': 'Mozilla/5.0 (compatible; MJ12bot/v1.4.1; http://www.majestic12.co.uk/bot.php?+)',
        }
        let method = 'GET'; //request method
        let req = `https://www.finishline.com/store/browse/json/productSizesJson.jsp?productId=${sku}&productId=${v4()}`//request url
        let set = await helper.requestJson(req, method, proxy, headers) //request function
        let body = await set.json
        //Define body variables
        if (set.response.status != 200) {
            monitor(sku)
            return
        }
        if (body.productSizes.length < 0) {
            await helper.sleep(product.waittime);
            monitor(sku)
            return
        }
        let sizelist = ''
        let sizesparse = body.productSizes
        for (let size of sizesparse) {
            sizelist += size.productId + '\n'
        }
        console.log(sizelist)
        let sizes = ''
        let query = await database.query(`SELECT * from ${table} where sku='${sku}'`);
        let oldSizeList = query.rows[0].sizes
        let inStock = false
        let sizeList = []
        let stock = 0
        await helper.sleep(100000)
        for (let size of sizesparse) {
            if (size.sizeValue) {
                if (size.productId === styleID + '_' + colorID) {
                    if (size.sizeClass !== 'unavailable') {
                        stock += Number(Buffer.from(size.stockLevel, 'base64'))
                        sizes += `${size.sizeValue} (${Buffer.from(size.stockLevel, 'base64').toString()})\n`
                        sizeList.push(size.sizeValue);
                        if (!oldSizeList.includes(size.sizeValue))
                            inStock = true;
                    }
                }
            }
        }
        if (inStock) {
            let qt = 'Na'
            let links = 'Na'
            let req = `https://www.finishline.com/store/browse/gadgets/productLookupJSON.jsp?productId=${productID}&styleId=${styleID}&colorId=${colorID}`//request url
            let set = await helper.requestJson(req, method, proxy, headers) //request function
            let body2 = await set.json
            let title = body2.product.name + ' ' + body2.product.colors.color[0].content
            let price = body2.product.Prices.price[0].fullPrice
            let image = body2.product.colors.color[0].thumbnail
            let url = `https://www.finishline.com/store/product/tachyon/${productID}?styleId=${styleID}&colorId=${colorID}#Tachyon`
            console.log(`[time: ${new Date().toISOString()}, product: ${sku}, title: ${title}]`)
            inStock = false;
            let sizeright = sizes.split('\n')
            let sizeleft = sizeright.splice(0, Math.floor(sizeright.length / 2))
            for (let group of sites[site]) {
                await helper.postAIO(url, title, sku, price, image, sizeright, sizeleft, stock, groups[group], site, version, qt, links)
            }
            await database.query(`update ${table} set sizes='${JSON.stringify(sizeList)}' where sku='${sku}'`);

        }
        await helper.sleep(product.waittime);
        monitor(sku);
        return
    } catch (e) {
        console.log(e)
        monitor(sku)
        return
    }
}
helper.discordbot(CHANNEL, PRODUCTS, table, monitor, site)