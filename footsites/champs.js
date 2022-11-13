const helper = require('../x-help/helper');
const groups = require('../x-help/groups.json');
const database = require('../x-help/database');
const discordBot = require('../x-help/discord')
const Discord = require('discord.js');
const { v4 } = require('uuid');
const CHANNEL = '810926616733286430' //channel id
const site = 'CHAMPSUS'; //site name
const catagory = 'FOOTSITES'
const version = `Champs US v1.0` //Site version
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
            'User-Agent': "Mozilla/5.0 (compatible; Google-Site-Verification/1.0)"
        }
        let method = 'GET'; //request method
        let req = `https://www-champssports-com.translate.goog/zgw/product-core/v1/pdp/sku/${sku}?_x_tr_sl=en&_x_tr_tl=el&_x_tr_hl=en&_x_tr_pto=wapp`//request url
        let set = await helper.requestJson(req, method, proxy, headers) //request function
        //console.log(set.response.status)
        let body = await set.json
        if (set.response.status != 200) {
            monitor(sku)
            return
        }
        //Define body variables
        if (body.inventory.inventoryAvailable == true) {
            let inStock = false;
            let url = `https://www.champssports.com/product/Tachyon/${sku}.html#Tachyon`//product url
            let title = body.model.name
            let price = body.style.price.formattedSalePrice
            let image = `https://images.footlocker.com/is/image/EBFL2/${sku}_a1?wid=520&hei=520&fmt=png-alpha`
            let stock = 0
            let sizes = []
            let query = await database.query(`SELECT * from ${table} where sku='${sku}'`);
            let oldSizeList = await query.rows[0].sizes
            let sizeList = []
            let variants = body.sizes
            //pars sizes for loop
            for (let variant of variants) {
                if (variant.inventory.inventoryAvailable != true)
                    continue
                sizeList.push(variant.productWebKey);
                if (!oldSizeList.includes(variant.productWebKey)) {
                    sizes += `[${variant.size}](https://www.champssports.com/product/~/${sku}.html?size=${variant.size}) - ${variant.productWebKey}\n`
                    stock++
                    inStock = true;
                }
            }
            if (inStock) {
                let AIO = await helper.dbconnect("AIOFILTEREDUS")
                let sites = await helper.dbconnect(catagory + site)
                let qt = 'Na'
                let links = 'Na'
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