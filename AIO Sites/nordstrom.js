const helper = require('../x-help/helper');
const groups = require('../x-help/groups.json');
const database = require('../x-help/database');
const discordBot = require('../x-help/discord')
const randomUseragent = require('random-useragent');

const Discord = require('discord.js');
const { v4 } = require('uuid');
const CHANNEL = '810745640837185547' //channel id
const site = 'NORDSTROM'; //site name
const catagory = 'AIO'
const version = `Nordstrom v1.0` //Site version
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
        let agent  = randomUseragent.getRandom();
        let headers = {
            'user-agent': agent,
            'Accept': 'application/vnd.nord.pdp.v1+json',
            'consumer-id': 'recs-PDP_1',
        }
        let method = 'GET'; //request method
        let req = `https://www.nordstrom.com/api/style/${sku}?cache=${v4()}`//request url
        let set = await helper.requestJson(req, method, proxy, headers) //request function
        let body = await set.json
        //Custom error handling
        if (set.response.status != 200) {
            monitor(sku)
            return
        }
        console.log(agent)
        if (body.errorcode == 'ERROR_STYLE_NOT_FOUND') {
            console.log('[NORDSTROM] ' + sku + ' not found!')
            return
        }
        
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
                sizeList.push(vars[id].rmsSkuId);
                price = vars[id].displayPrice //price set for vars
                if (!oldSizeList.includes(vars[id].rmsSkuId)) {// oldSizeList.includes this size
                    sizes += `${vars[id].sizeId} (${vars[id].totalQuantityAvailable}) - ${vars[id].rmsSkuId}\n`//size parse
                    stock += Number(vars[id].totalQuantityAvailable) //total count or quantity
                    price = vars[id].displayPrice //price set for vars
                    title = title + vars[id].colorDisplayValue + ","
                    inStock = true;
                }
            }
        }
        if (inStock) {
            let AIO = await helper.dbconnect("AIOFILTEREDUS")
            let sites = await helper.dbconnect(catagory+site)
            let qt = 'Na'
            let links = 'Na'
            title = title.split(',')[0]
            helper.posElephentNord(sizes, sku, title, price, image)
            helper.posElephentOrca(sizes, sku, title, price, image)
            console.log(`[time: ${new Date().toISOString()}, product: ${sku}, title: ${title}]`)
            inStock = false;
            let sizeright = sizes.split('\n')
            let sizeleft = sizeright.splice(0, Math.floor(sizeright.length / 2))
            for (let group of sites) {
                helper.postAIO(url, title, sku, price, image, sizeright, sizeleft, stock, group, version, qt, links)
            }
            for (let group of AIO) {
                helper.postAIO(url, title, sku, price, image, sizeright, sizeleft, stock, group, version, qt, links)
            }
            await database.query(`update ${table} set sizes='${JSON.stringify(sizeList)}' where sku='${sku}'`);

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