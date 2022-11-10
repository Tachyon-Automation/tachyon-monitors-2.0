const helper = require('../x-help/helper');
const groups = require('../x-help/groups.json');
const database = require('../x-help/database');
const discordBot = require('../x-help/discord')
const Discord = require('discord.js');
const { v4 } = require('uuid');
const CHANNEL = '836660344121327636' //channel id
const site = 'NEWBALANCE'; //site name
const catagory = 'AIO'
const version = `New Balance v1.0` //Site version
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
            'User-Agent': "Mozilla/5.0 (iPhone; CPU iPhone OS 12_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148"
        }
        let method = 'GET'; //request method
        let req = `https://www.newbalance.com/on/demandware.store/Sites-NBUS-Site/en_US/Product-Variation?pid=${sku}`//request url
        let set = await helper.requestJson(req, method, proxy, headers) //request function
        console.log(set.response.status)
        let body = await set.json
        if (set.response.status != 200) {
            monitor(sku)
            return
        }
        //Define body variables
        if (body.product.available == true) {
            let inStock = false;
            let url = `https://www.newbalance.com/pd/${sku}.html#Tachyon`
            let title = body.product.productName
            let price = body.product.price.sales.formatted
            let image = body.product.images.productDetail[0].url
            let stock = 0
            let sizes = []
            let query = await database.query(`SELECT * from ${table} where sku='${sku}'`);
            let oldSizeList = await query.rows[0].sizes
            let sizeList = []
            let variants = body.product.variationAttributes[1].values
            //pars sizes for loop
            for (let variant of variants) {
                if (variant.selectable !== true)
                    continue
                sizes += `[${variant.id}](https://www.newbalance.com/${sku}.html#dwvar_${sku}_size=${variant.id}&pid=${sku}&quantity=1) - ${variant.variantID}\n`
                stock++
                sizeList.push(variant.id);
                if (!oldSizeList.includes(variant.id))
                    inStock = true;
            }
            if (inStock) {
                let AIO = await helper.dbconnect("AIOFILTEREDUS")
                let sites = await helper.dbconnect(catagory+site)
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