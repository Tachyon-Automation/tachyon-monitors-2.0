const helper = require('../x-help/helper');
const groups = require('../x-help/groups.json');
const database = require('../x-help/database');
const discordBot = require('../x-help/discord')
const randomUseragent = require('random-useragent');
const Discord = require('discord.js');
const { v4 } = require('uuid');
const CHANNEL = '834542352394879046' //channel id
const site = 'SNIPESEU'; //site name
const catagory = 'AIO'
const version = `Snipes v1.0` //Site version
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
            'x-px-authorization': "1",
            'x-px-bypass-reason': "The%20certificate%20for%20this%20server%20is%20invalid.%20You%20might%20be%20connecting%20to%20a%20server%20that%20is%20pretending%20to%20be%20%E2%80%9Cpx-conf.perimeterx.net%E2%80%9D%20which%20could%20put%20your%20confidential%20information%20at%20risk."
        }
        let method = 'GET'; //request method
        let req = `https://www.snipes.com/p/${sku}.html;.js?abcz=${v4()}`//request url
        let set = await helper.requestHtml(req, method, proxy, headers) //request function
        let body = await JSON.parse(set.text.split('<script type="application/ld+json">')[1].split('</script>')[0])
        let root = set.html
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
        if (body.offers.availability == 'http://schema.org/InStock') {
            let inStock = false
            let url = `https://www.snipes.com/${sku}.html#Tachyon`
            let title = body.name
            let price = body.offers.price + ' ' + body.offers.priceCurrency
            let image = body.image[0]
            let stock = 0
            let sizes = []
            let query = await database.query(`SELECT * from ${table} where sku='${sku}'`);
            let oldSizeList = await query.rows[0].sizes
            let sizeList = [] 
            let variants = root.querySelectorAll('.b-swatch-value-wrapper')

            //pars sizes for l
            for (let size of variants) {
                if (size.innerHTML.includes('b-swatch-value--orderable')) {
                    sizeList.push(size.querySelector('.js-pdp-attribute-btn.b-pdp-swatch-link.js-pdp-attribute-btn--size').attributes['data-variant-id']);
                    if (!oldSizeList.includes(size.querySelector('.js-pdp-attribute-btn.b-pdp-swatch-link.js-pdp-attribute-btn--size').attributes['data-variant-id'])) {
                        sizes += `[${size.querySelector('.js-pdp-attribute-btn.b-pdp-swatch-link.js-pdp-attribute-btn--size').attributes['data-value']}](https://www.snipes.com/${size.querySelector('.js-pdp-attribute-btn.b-pdp-swatch-link.js-pdp-attribute-btn--size').attributes['data-variant-id']}.html#Tachyon) - ${size.querySelector('.js-pdp-attribute-btn.b-pdp-swatch-link.js-pdp-attribute-btn--size').attributes['data-variant-id']}\n`;
                        stock++
                        inStock = true;
                    }
                }
            }
            if (inStock) {
                let AIO = await helper.dbconnect("AIOFILTEREDEU")
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