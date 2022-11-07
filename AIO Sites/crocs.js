async function monitor(sku) {
    try {
        let product = PRODUCTS[sku]
        if (!product)
            return;
        let proxy = await helper.getRandomProxy() //proxy per site
        let headers = {
            'User-Agent': randomUseragent.getRandom(),
        }
        let method = 'GET'; //request method
        let req = `https://www.crocs.com/on/demandware.store/Sites-crocs_us-Site/default/Product-API?pid=${sku}&abcz=${v4()}`//request url
        let set = await helper.requestJson(req, method, proxy, headers)
        console.log(set.response.status)
        if (set.response.status != 200) {
            monitor(sku);
            return
        }
        let body = await set.json //request function
        let status = PRODUCTS[sku].sizes
        if (!body.data.availability.variations.isOOS) {
            let url = `https://www.crocs.com/${sku}.html#Tachyon`
            let title = body.data.name
            let price = body.data.name.tagMinPrice
            let image = body.data.name.urls.image
            let stock = 0
            if (status !== "In-Stock") {
                let qt = 'NA'
                let links = `[ATC](https://www.crocs.com/${sku}.html#Tachyon)`
                console.log(`[time: ${new Date().toISOString()}, product: ${sku}, title: ${title}]`)
                for (let group of sites) {
                    await helper.postRetail(url, title, sku, price, image, stock, group, version, qt, links)
                }
                PRODUCTS[sku].sizes = 'In-Stock'
                await database.query(`update ${table} set sizes='In-Stock' where sku='${sku}'`)
            }
        } else {
            if (status !== "Out-of-Stock") {
                PRODUCTS[sku].sizes = 'Out-of-Stock'
                await database.query(`update ${table} set sizes='Out-of-Stock' where sku='${sku}'`)
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
const helper = require('../x-help/helper');
const groups = require('../x-help/groups.json');
const database = require('../x-help/database');
const discordBot = require('../x-help/discord')
const Discord = require('discord.js');
const randomUseragent = require('random-useragent');
const { v4 } = require('uuid');
const CHANNEL = '836646999297359932' //channel id
const site = 'CROCS'; //site name
const catagory = 'AIO'
const version = `Crocs v1.0` //Site version
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
            'User-Agent': randomUseragent.getRandom(),
        }
        let method = 'GET'; //request method
        let req = `https://www.crocs.com/on/demandware.store/Sites-crocs_us-Site/default/Product-API?pid=${sku}&abcz=${v4()}`//request url
        let set = await helper.requestJson(req, method, proxy, headers) //request function
        //console.log(set.response.status)
        let body = await set.json
        if (set.response.status != 200) {
            monitor(sku)
            return
        }
        if (!body.data.name) {
            monitor(sku)
            return
        }
        //Define body variables
        if (!body.availability.variations.isOOS) {
            let inStock = false;
            let url = `https://www.crocs.com/${sku}.html#Tachyon`
            let title = body.data.name
            let price = body.data.tagMinPrice.toString()
            let image = body.data.urls.image
            let stock = 0
            let sizes = []
            let query = await database.query(`SELECT * from ${table} where sku='${sku}'`);
            let oldSizeList = await query.rows[0].sizes
            let sizeList = []
            let variants = Object.values(body.availability.variations)
            //pars sizes for loop
            for (let size of variants) {
                if (size.inStock && size.ATS > 0) {
                    sizes += `${size.size} (${size.ATS}) - ${size.UPC}\n`;
                    stock += size.ATS
                    sizeList.push(size.UPC);
                    if (!oldSizeList.includes(size.UPC)) {
                        inStock = true;
                    }
                }
            }
            if (inStock) {
                let sites = await helper.dbconnect(catagory+site)
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