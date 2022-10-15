const helper = require('../x-help/helper');
const sites = require('../x-help/sites.json');
const groups = require('../x-help/groups.json');
const database = require('../x-help/database');
const discordBot = require('../x-help/discord')
const randomUseragent = require('random-useragent');
const Discord = require('discord.js');
const { v4 } = require('uuid');
const CHANNEL = '1015104990920060978' //channel id
const site = 'HIBBETT5'; //site name
const version = `Hibbett v5.0` //Site version
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
        let proxy = 'http://aggiekouv3:0ZuLB6y30id6lQdD_country-UnitedStates@proxy.packetstream.io:31112'; //proxy per site
        //these headers change per site
        let headers = {
            'User-Agent': randomUseragent.getRandom(),
            'Poq-App-Version': `${v4()}`,
            'Poq-Platform': 'iOS',
            'Poq-Platform-Version': `${v4()}`,
            'Poq-Device-Model': 'iPhone',
            'x-px-bypass-reason': `${v4()}`,
            'x-px-bypass': `${v4()}`,
            'X-PX-AUTHORIZATION': `3:${v4()}`,     
            //'cookie': `_px3=${v4()};_pxhd=${v4()}`  
        }
        let method = 'GET'; //request method
        let req = `https://hibbett-mobileapi.prolific.io/ecommerce/products/${sku}?pid=${v4()}`//request url
        let set = await helper.requestJson(req, method, proxy, headers) //request function
        console.log(set.response.status)
        let body = await set.json
        //Custom error handling
        if (set.response.status != 200) {
            monitor(sku)
            return
        }
        if(body.launchDate) {
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
            let variantsa = ''
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
                    variantsa += `${variant.id},}`
                    sizes += `[${variant.size}](https://www.hibbett.com/product?pid=${sku}&dwvar_${sku}_size=${sizevar}&dwvar_${sku}_color=${variant.color.id}) - ${variant.id}\n`
                    stock++
                    sizeList.push(variant.id);
                    if (!oldSizeList.includes(variant.id))
                        inStock = true;
                }
            }
            if (inStock) {
                console.log(`[time: ${new Date().toISOString()}, product: ${sku}, title: ${title}]`)
                helper.posElephentHibbett(sku, title, image, variantsa)
                inStock = false;
                let sizeright = sizes.split('\n')
                let sizeleft = sizeright.splice(0, Math.floor(sizeright.length / 2))
                for (let group of sites[site]) {
                    await helper.postAIO(url, title, sku, price, image, sizeright, sizeleft, stock, groups[group], site, version)
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