const helper = require('../x-help/helper');
const groups = require('../x-help/groups.json');
const database = require('../x-help/database');
const discordBot = require('../x-help/discord')
const randomUseragent = require('random-useragent');
const Discord = require('discord.js');
const { v4 } = require('uuid');
const CHANNEL = '810930267102773248' //channel id
const site = 'SOLEBOX'; //site name
const catagory = 'AIO'
const version = `Solebox v2.0` //Site version
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
        let proxy = await helper.getRandomProxy2(); //proxy per site
        //these headers change per site
        let data = {
            'auid': '',
            'scid': 'c6b45dde5e2193ea815d6525e3',
            'pid0': sku
        }
        let headers = {
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36',
            'content-type': 'application/x-www-form-urlencoded',
        }
        var formBody = [];
        for (var property in data) {
          var encodedKey = encodeURIComponent(property);
          var encodedValue = encodeURIComponent(data[property]);
          formBody.push(encodedKey + "=" + encodedValue);
        }
        formBody = formBody.join("&");
        let method = 'POST'; //request method
        let req = `https://www.solebox.com/on/demandware.store/Sites-solebox-Site/en_DE/CQRecomm-Start?${v4()}`//request url
        let set = await helper.requestJson4(req, method, proxy, headers, formBody) //request function
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
        if (root.querySelector('.b-product-tile-title.b-product-tile-text')) {
            let inStock = false
            let url = `https://www.solebox.com/${sku}.html#Tachyon`
            let title = root.querySelector('.b-product-tile-title.b-product-tile-text').textContent
            let price = root.querySelector('.b-product-tile-price-item').textContent
            let image = root.querySelector('img').attributes['data-src']
            console.log(image)
            let stock = 0
            let sizes = []
            let query = await database.query(`SELECT * from ${table} where sku='${sku}'`);
            let oldSizeList = await query.rows[0].sizes
            let sizeList = []
            let variants = root.querySelectorAll('.b-cart-select-size.js-variant')
            //pars sizes for l
            for (let size of variants) {
                if (size.attributes['data-code'] == 'instock') {
                    sizeList.push(size.attributes.value);
                    if (!oldSizeList.includes(size.attributes.value)) {
                        sizes += `[${size.textContent.split(':')[0].trim()}](https://www.solebox.com/${size.attributes.value}.html#Tachyon)\n`;
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
        console.log(e)
        monitor(sku)
        return
    }
}
helper.discordbot(CHANNEL, PRODUCTS, table, monitor, site)