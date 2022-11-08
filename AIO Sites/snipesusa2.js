const helper = require('../x-help/helper');
const groups = require('../x-help/groups.json');
const database = require('../x-help/database');
const discordBot = require('../x-help/discord')
const randomUseragent = require('random-useragent');
const Discord = require('discord.js');
const { v4 } = require('uuid');
const CHANNEL = '1015135505769320528' //channel id
const site = 'SNIPESUSA2'; //site name
const catagory = 'AIO'
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
            'User-Agent': "Snipes-Live/19.4.0 iOS/16.0",
            'Poq-App-Identifier': '082463f6-579a-46f1-b9c9-7e2f4e01b873',
            'x-px-authorization': "3:37a9c8c7862ddf01d7069ecfb77d5eeee8527833366d117fefa6b52e257e9aee:iT/daV6YHx8MHTLflcU4DVO9xXUp//k5gJY2tLcZQ+L6onHVv2ykk3038aIw/Nschinvpgb2y7+TJ0lpm/bVEw==:1000:CK5NT8PNSAf37CcqOzIXoZUaO9EDg0bxaH7lG+qqBNT7UTGF2nTThpRMxlabA43kyJ7q4cTqRIwuQ/tGc0oFg5TNmq15NiQQNwCoCv0rOiRpRnCfuzIoLPtkf+p1JgOVpC2ri3JRA/Sp1W8S0n+Vg2XaCaEthkJOTCKDtArTLQcjQJmKpQFZ1mO44xO4L1aoCt+UEGniaUi51yh1bTsipQ==",
            //'x-px-bypass-reason': "The%20certificate%20for%20this%20server%20is%20invalid.%20You%20might%20be%20connecting%20to%20a%20server%20that%20is%20pretending%20to%20be%20%E2%80%9Cpx-conf.perimeterx.net%E2%80%9D%20which%20could%20put%20your%20confidential%20information%20at%20risk."
        }
        let method = 'GET'; //request method
        let req = `https://platform.poq.io/clients/snipes/products?ids=${sku}`//request url
        let set = await helper.requestJson(req, method, proxy, headers) //request function
        let body = await set.json
        //console.log(set.response.status)
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

                price = body[0].variants[variant].prices.USD.nowFormatted
                sizes += `[${body[0].variants[variant].forms.size.value}](https://www.snipesusa.com/${body[0].variants[variant].id}.html#Tachyon) (${body[0].variants[variant].stock.quantity}) - ${body[0].variants[variant].id}\n`
                stock += Number(body[0].variants[variant].stock.quantity)
                sizeList.push(body[0].variants[variant].id);
                if (!oldSizeList.includes(body[0].variants[variant].id)) {
                    inStock = true;
                    image = 'https://imageresize.24i.com/?w=300&url=' + body[0].variants[variant].images.default[0]
                }
            }
            if (inStock) {
                let sites = await helper.dbconnect(catagory+"SNIPESUS")
                let qt = 'Na'
                let links = 'Na'
                console.log(`[time: ${new Date().toISOString()}, product: ${sku}, title: ${title}]`)
                inStock = false;
                let sizeright = sizes.split('\n')
                let sizeleft = sizeright.splice(0, Math.floor(sizeright.length / 2))
                for (let group of sites) {
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