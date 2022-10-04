const helper = require('../x-help/helper');
const sites = require('../x-help/sites.json');
const groups = require('../x-help/groups.json');
const database = require('../x-help/database');
const { v4 } = require('uuid');
const site = 'NORDSTROM2';
const table = site.toLowerCase();
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
        monitor(row.sku);
    }
    console.log(`[${site}] Monitoring all SKUs!`)
}

async function monitor(sku) {
    try {
    let product = PRODUCTS[sku]
    if (!product)
        return;
    let proxy = helper.getRandomProxy();
    let headers = {
        'user-agent': 'Mozilla/5.0 (compatible; DotBot/1.1; http://www.opensiteexplorer.org/dotbot, help@moz.com)',
        'Accept': 'application/vnd.nord.pdp.v1+json',
    }
    let method = 'GET';
    let req = `https://www.nordstrom.com/api/style/${sku}?cache=${v4()}`
    let set = await helper.requestJson(req, method, proxy, headers)
    let body = await set.json
    if (body.errorcode == 'ERROR_STYLE_NOT_FOUND') {
        console.log('[NORDSTROM] ' + sku + ' not found!')
        return
    }
    let ids = body.skus.allIds
    if (ids.length < 0) {
        await helper.sleep(1000)
        monitor(sku)
        return
    }
    let inStock = false;
    let title = body.productTitle
    let parse = body.defaultGalleryMedia.styleMediaId
    let image = 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829'
    try { image = body.styleMedia.byId[parse].imageMediaUri.smallDesktop }
    catch (e) { }
    let stock = 0
    let price = ''
    let url = `https://www.nordstrom.com/s/tachyon/${sku}`
    let sizes = []
    let query = await database.query(`SELECT * from ${table} where sku='${sku}'`);
    let oldSizeList = query.rows[0].sizes
    let sizeList = []
    let oosid = body.soldOutSkus.byId
    let oossku = body.soldOutSkus.allIds
    let inid = body.skus.byId
    let insku = body.skus.allIds
    let vars = Object.assign(oosid, inid)
    let skus = Object.assign(oossku, insku)
    for (let id of skus) {
        if (vars[id].isAvailable === true || vars[id].totalQuantityAvailable > 0) {
            sizes += `${vars[id].sizeId} (${vars[id].totalQuantityAvailable}) - ${vars[id].rmsSkuId}\n`
            stock += Number(vars[id].totalQuantityAvailable)
            sizeList.push(vars[id].rmsSkuId);
            price = vars[id].displayPrice
            if (!oldSizeList.includes(vars[id].rmsSkuId))
                inStock = true;
        }
    }
    if (inStock) {
        inStock = false;
        let sizeright = sizes.split('\n')
        let sizeleft = sizeright.splice(0, Math.floor(sizeright.length / 2))
        await database.query(`update ${table} set sizes='${JSON.stringify(sizeList)}' where sku='${sku}'`);
        for( let group of sites[site]) {
            await helper.postAIO(url, title, sku, price, image, sizeright, sizeleft, stock, groups[group], site)
        }
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