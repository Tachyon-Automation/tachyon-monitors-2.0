const helper = require('../x-help/helper');
const sites = require('../x-help/sites.json');
const groups = require('../x-help/groups.json');
const database = require('../x-help/database');
const discordBot = require('../x-help/discord')
const Discord = require('discord.js');
const { v4 } = require('uuid');
const CHANNEL = '1015135505769320528' //channel id
const site = 'SNIPESUSA2'; //site name
const version = `Snipes USA v2.0` //Site version
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
            'User-Agent': 'Snipes-Live/19.4.0 iOS/16.0',
            'Poq-App-Identifier': '082463f6-579a-46f1-b9c9-7e2f4e01b873',
            //'x-px-bypass-reason': 'The%20certificate%20for%20this%20server%20is%20invalid.%20You%20might%20be%20connecting%20to%20a%20server%20that%20is%20pretending%20to%20be%20%E2%80%9Cpx-conf.perimeterx.net%E2%80%9D%20which%20could%20put%20your%20confidential%20information%20at%20risk.',
            'X-PX-AUTHORIZATION': `3:${v4()}`,        
        }
        let method = 'GET'; //request method
        let req = `https://platform.poq.io/clients/snipes/products?ids=${sku}`//request url
        let set = await helper.requestJson(req, method, proxy, headers) //request function
        console.log(set.response.status)
        let body = await set.json
        if (set.response.status == 404) {
            await helper.sleep(product.waittime);
            monitor(sku);
            return
        }
        if (set.response.status != 200) {
            monitor(sku)
            return
        }
        //Define body variables
        if (body[0].details.name) {
            let inStock = false
            let url = `https://www.snipesusa.com/${sku}.html#Tachyon`//product url
            let title = body[0].details.name
            let image = 'https://i.pinimg.com/736x/b0/64/bd/b064bd42822816bff61ce59f24da4018--revolve-clothing-texts.jpg'
            let stock = 0
            let sizes = []
            let query = await database.query(`SELECT * from ${table} where sku='${sku}'`);
            let oldSizeList = await query.rows[0].sizes
            let sizeList = []
            let bodvar = body[0].variants
            let variants = Object.keys(bodvar)
            //pars sizes for l
            let price = ''
            for (let variant of variants) {
                if (body[0].variants[variant].stock.available != true)
                    continue
                image = 'https://imageresize.24i.com/?w=300&url=' + body[0].variants[variant].images.default[0]
                price = body[0].variants[variant].prices.USD.nowFormatted
                sizes += `[${body[0].variants[variant].forms.size.value}](https://www.snipesusa.com/${body[0].variants[variant].id}.html#Tachyon) (${body[0].variants[variant].stock.quantity}) - ${body[0].variants[variant].id}\n`
                stock += Number(body[0].variants[variant].stock.quantity)
                sizeList.push(body[0].variants[variant].id);
                if (!oldSizeList.includes(body[0].variants[variant].id))
                    inStock = true;
            }
            if (inStock) {
                console.log(`[time: ${new Date().toISOString()}, product: ${sku}, title: ${title}]`)
                inStock = false;
                let sizeright = sizes.split('\n')
                let sizeleft = sizeright.splice(0, Math.floor(sizeright.length / 2))
                for (let group of sites[site]) {
                    await helper.postAIO(url, title, sku, price, image, sizeright, sizeleft, stock, groups[group], site, version)
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