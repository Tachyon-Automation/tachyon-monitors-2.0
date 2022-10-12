const helper = require('../x-help/helper');
const sites = require('../x-help/sites.json');
const groups = require('../x-help/groups.json');
const database = require('../x-help/database');
const discordBot = require('../x-help/discord')
const Discord = require('discord.js');
const { v4 } = require('uuid');
const CHANNEL = '1020915930227822592' //channel id
const site = 'SHIEKH'; //site name
const version = `Shiekh v1.0` //Site version
const table = site.toLowerCase();
discordBot.login();
let PRODUCTS = {}
helper.discordbot(CHANNEL, PRODUCTS, table, monitor)
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
            'User-Agent': 'Shiekh Shoes/10.6 (com.shiekh.shoes.ios; build:1233; iOS 16.0.0) Alamofire/5.6.1',
            'X-PX-AUTHORIZATION': `2`,
            "X-PX-BYPASS-REASON": "The%20certificate%20for%20this%20server%20is%20invalid.%20You%20might%20be%20connecting%20to%20a%20server%20that%20is%20pretending%20to%20be%20%E2%80%9Cpx-conf.perimeterx.net%E2%80%9D%20which%20could%20put%20your%20confidential%20information%20at%20risk."
        }
        let method = 'GET'; //request method
        let req = `https://api.shiekh.com/api/V1/extend/products/${pid}/.js`//request url
        let set = await helper.requestJson(req, method, proxy, headers) //request function
        let body = await set.json
        //Custom error handling
        //Define body variables
        let ids = body.skus.allIds
        if (ids.length < 0) {
            await helper.sleep(1000)
            monitor(sku)
            return
        }
        let inStock = false;
        let url = `https://www.nordstrom.com/s/${sku}#Tachyon`//product url
        let title = body.productTitle + " "
        let price = '' //price set
        let parse = body.defaultGalleryMedia.styleMediaId
        let image = 'https://pbs.twimg.com/profile_images/1159538934977662976/4gmIcgkZ_400x400.png'
        try { image = body.styleMedia.byId[parse].imageMediaUri.smallDesktop } catch (e) {} //try set image
        let stock = 0
        let sizes = []
        let query = await database.query(`SELECT * from ${table} where sku='${sku}'`);
        let oldSizeList = await query.rows[0].sizes
        let sizeList = []
        let oosid = body.soldOutSkus.byId
        let oossku = body.soldOutSkus.allIds
        let inid = body.skus.byId
        let insku = body.skus.allIds
        let vars = Object.assign(oosid, inid)
        let skus = Object.assign(oossku, insku) //For loop parse
        //pars sizes for loop
        for (let id of skus) { //loops through all sizes
            if (vars[id].isAvailable === true || vars[id].totalQuantityAvailable > 0) { //if oss or in stock
                sizes += `${vars[id].sizeId} (${vars[id].totalQuantityAvailable}) - ${vars[id].rmsSkuId}\n`//size parse
                stock += Number(vars[id].totalQuantityAvailable) //total count or quantity
                sizeList.push(vars[id].rmsSkuId);
                price = vars[id].displayPrice //price set for vars
                if (!oldSizeList.includes(vars[id].rmsSkuId))// oldSizeList.includes this size
                    inStock = true;
                    title = title + vars[id].colorDisplayValue + ","
            }
        }
        if (inStock) {
            title = title.split(',')[0]
            helper.posElephentNord(sizes, sku, title, price, image)
            console.log(`[time: ${new Date().toISOString()}, product: ${sku}, title: ${title}]`)
            inStock = false;
            let sizeright = sizes.split('\n')
            let sizeleft = sizeright.splice(0, Math.floor(sizeright.length / 2))
            helper.posElephentNord(sizes, sku, title, price, image)
            for (let group of sites[site]) {
                await helper.postAIO(url, title, sku, price, image, sizeright, sizeleft, stock, groups[group], site, version)
            }
            await database.query(`update ${table} set sizes='${JSON.stringify(sizeList)}' where sku='${sku}'`);

        }
        monitor(sku);
        return
    } catch (e) {
        //console.log(e)
        monitor(sku)
        return
    }
}