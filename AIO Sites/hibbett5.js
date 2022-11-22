const helper = require('../x-help/helper');
const groups = require('../x-help/groups.json');
const database = require('../x-help/database');
const discordBot = require('../x-help/discord')
const randomUseragent = require('random-useragent');
const Discord = require('discord.js');
const { v4 } = require('uuid');
const CHANNEL = '1015104990920060978' //channel id
const site = 'HIBBETT'; //site name
const catagory = 'AIO'
const version = `Hibbett v5.0` //Site version
const table = site.toLowerCase();
discordBot.login();
let PRODUCTS = {}
let headers
let count = 0
let header
for (let i = 0; i < 25; i++) {
    genheadersd()
}
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
    headers = [{
        'X-FORWARDED-FOR': '50.206.43.38',
        'user-agent': randomUseragent.getRandom(),
        'X-PX-AUTHORIZATION': `3:${v4()}`,
        [v4()]: v4(),
    }]
}

async function monitor(sku) {
    try {
        let product = PRODUCTS[sku]
        if (!product)
            return;
        let proxy = await helper.getRandomProxy(); //proxy per site
        //these headers change per site
        let method = 'GET'; //request method
        //console.log(headers.length)
        let req = `https://hibbett-mobileapi.prolific.io/ecommerce/products/${sku}?pid=${v4()}`//request url
        //console.log(headers[0])
        let set = await helper.requestJson(req, method, proxy, headers[0]) //request function
        let body = await set.json
        //Custom error handling
        console.log(set.response.status)
        if (set.response.status != 200) {
            count++
            if (count > 20) {
                header = headers.shift()
                count = 0
            }
            monitor(sku)
            return
        }
        console.log(set.response.status)

        if (body.launchDate) {
            let event = Date.parse(new Date(Date.now()).toISOString())
            let event1 = Date.parse(new Date(body.launchDate).toISOString())
            if (event1 > event) {
                //console.log('Not released yet', sku)
                await helper.sleep(1000);
                monitor(sku)
                return
            }
        }
        //Define body variables
        let inStock = false;
        let url = `https://www.hibbett.com/product?pid=${sku}&dwvar_${sku}#Tachyon`
        let title = body.name
        let price = body.price
        let parse = body.imageIds[0]
        let image = body.imageResources[parse][0].url
        let stock = 0
        let sizes = []
        let query = await database.query(`SELECT * from ${table} where sku='${sku}'`);
        let oldSizeList = await query.rows[0].sizes
        let sizeList = []
        let variants = body.skus
        let variantsa = []
        //pars sizes for loop
        for (let variant of variants) {
            if (variant.size.includes('.')) {
                sizevar = `00${variant.size.replace('.', '')}`
            } else {
                if (variant.size.length > 2) {
                    sizevar = `0${variant.size}0`
                } else {
                    sizevar = `00${variant.size}0`
                }
            }
            if (variant.isAvailable === true) {
                sizeList.push(variant.id);
                if (!oldSizeList.includes(variant.id)) {
                    variantsa.push(variant.id + `_https://www.hibbett.com/product?pid=${sku}&dwvar_${sku}_size=${sizevar}&dwvar_${sku}_color=${variant.color.id}`)
                    sizes += `[${variant.size}](https://www.hibbett.com/product?pid=${sku}&dwvar_${sku}_size=${sizevar}&dwvar_${sku}_color=${variant.color.id}) - ${variant.id}\n`
                    stock++
                    inStock = true;
                }
            }
        }
        if (inStock) {
            let AIO = await helper.dbconnect("AIOFILTEREDUS")
            let sites = await helper.dbconnect(catagory + 'HIBBETT')
            let qt = 'Na'
            let links = 'Na'
            console.log(`[time: ${new Date().toISOString()}, product: ${sku}, title: ${title}]`)
            helper.posElephentHibbett(sku, title, image, variantsa)
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

async function genheadersd() {
    try {
        let method = 'GET';
        let proxy = await helper.getRandomProxy2();
        var ip = (Math.floor(Math.random() * 255) + 1) + "." + (Math.floor(Math.random() * 255)) + "." + (Math.floor(Math.random() * 255)) + "." + (Math.floor(Math.random() * 255));
        let head = {
            'user-agent': 'googlebot',
            'X-FORWARDED-FOR': ip,
            'X-PX-AUTHORIZATION': `2:${v4()}`,
            [v4()]: v4(),
        }
        let req2 = `https://hibbett-mobileapi.prolific.io/ecommerce/products/D2487?pid=${v4()}`//request url
        let set2 = await helper.requestJson(req2, method, proxy, head) //request function
        if (set2.response.status != 200) {
            genheadersd()
            return
        }
        //Custom error handling
        console.log(headers.length)
        if (headers.length < 50) {
            headers.push(head)
        }
        genheadersd()
    } catch (e) {
        //console.log(e)
        genheadersd()
        return
    }
}
helper.discordbot(CHANNEL, PRODUCTS, table, monitor, site)