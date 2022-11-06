const helper = require('../x-help/helper');
const groups = require('../x-help/groups.json');
const database = require('../x-help/database');
const discordBot = require('../x-help/discord')
const Discord = require('discord.js');
const { v4 } = require('uuid');
const CHANNEL = '1031118814861070357' //channel id
const site = 'FINISHLINE2'; //site name
const catagory = 'AIO'
const version = `Finishline v3.0` //Site version
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
            'User-Agent': `Finish Line/2.7.3  (Android 2.7.3; Build/2.7.3)`,
            'welove': 'maltliquor',
        }
        let method = 'GET'; //request method
        let method2 = 'POST'; //request method
        let req = `https://prodmobloy2.finishline.com/api/products/${sku}`//request url
        let set2 = await helper.requestJson(req, method2, proxy, headers)
        if (set2.response.status != 405) {
            monitor(sku)
            return
        }
        let set = await helper.requestJson(req, method, proxy, headers) //request function
        console.log(set.response.status)
        let body = await set.json
        //Custom error handling
        if (body.statusCode == 499) {
            await helper.sleep(product.waittime);
            monitor(sku);
            return
        }
        if (set.response.status != 200) {
            monitor(sku)
            return
        }
        //Define body variables
        if (body.displayName) {
            let inStock = false
            let title = body.displayName
            let stock = 0
            let sizes = []
            let query = await database.query(`SELECT * from ${table} where sku='${sku}'`);
            let oldSizeList = await query.rows[0].sizes
            let sizeList = []
            let styleID = ''
            let colorID = ''
            let url = ''
            let colorDescription = ''
            let image = ''
            var price
            //pars sizes for loop
            for(product of body.colorWays) {
                styleID = product.styleId
                colorID = product.colorId
                colorDescription = product.colorDescription
                title = body.displayName + ' ' + product.colorDescription
                stock = 0
                sizes = []
                price = product.salePriceCents/100
                image = product.images[0].thumbnailUrl.replace('?$Thumbnail$', '')
                url = `https://www.finishline.com/store/product/tachyon/${sku}?styleId=${styleID}&colorId=${colorID}#Tachyon`//product url
            for (variant of product.skus) {
                if (variant.quantityAvailable > 0) {
                sizes += `${variant.size} (${variant.quantityAvailable}) - ${variant.skuId}\n`
                stock += variant.quantityAvailable
                sizeList.push(variant.skuId);
                if (!oldSizeList.includes(variant.skuId))
                    inStock = true;
                }
            }
            if (inStock) {
                let sites = await helper.dbconnect(catagory+"FINISHLINE/JD")
                let qt = 'Na'
                let links = 'Na'
                console.log(`[time: ${new Date().toISOString()}, product: ${sku}, title: ${title}]`)
                inStock = false;
                let sizeright = sizes.split('\n')
                let sizeleft = sizeright.splice(0, Math.floor(sizeright.length / 2))
                for (let group of sites) {
                    await helper.postAIO(url, title, sku, price, image, sizeright, sizeleft, stock, group, version, qt, links)
                }
                await database.query(`update ${table} set sizes='${JSON.stringify(sizeList)}' where sku='${sku}'`);
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