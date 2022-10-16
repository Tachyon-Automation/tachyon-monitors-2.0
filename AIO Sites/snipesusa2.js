const helper = require('../x-help/helper');
const sites = require('../x-help/sites.json');
const groups = require('../x-help/groups.json');
const database = require('../x-help/database');
const discordBot = require('../x-help/discord')
const randomUseragent = require('random-useragent');
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
            'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
            'accept-encoding': 'gzip, deflate, br',
            'accept-language': 'en-US,en;q=0.9',
            'cache-control': 'max-age=0',
            'User-Agent': randomUseragent.getRandom(),
            'Poq-App-Identifier': '082463f6-579a-46f1-b9c9-7e2f4e01b873',
            'X-PX-AUTHORIZATION': `3:d881839f62f95801fdcd38980aa5a458d2a6a48c8330ba4f1025434644d4b6a3:s1gqDGpdeQYujzCHOQLaG8dLAQkxEMbEF7or5O/YCHHAsUloS9KSvteXbFaFH129z19R3KTcQdT1pcJig3IdAw==:1000:6GS4H3kuRCyFgDUthjtpBRNmh98O8DZnI5ps2ULhYERw3oq+NOi7fyJiUmLK5aWByS4/XXfojHCm7zWHxsdy+MYVS7WMSUofqeVPmkHfFmU9hnBY8IKI4cMhjB6qtTM6wI0d6IuTAFu/kfIvyAUOjCvZvw99Mmz+0LS0MW1ZFtJZV5nQWVXDvukvdWpAbab16WdgpIw3U64qOOT8nPWbWw==`,
            'referer': `https://platform.poq.io/clients/snipes/products?ids=${sku}`
        }
        let method = 'GET'; //request method
        let req = `https://platform.poq.io/clients/snipes/products?ids=${sku}`//request url
        let set = await helper.requestJson(req, method, proxy, headers) //request function
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
        console.log(set.response.status)
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