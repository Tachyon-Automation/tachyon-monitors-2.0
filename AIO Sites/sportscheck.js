const helper = require('../x-help/helper');
const groups = require('../x-help/groups.json');
const database = require('../x-help/database');
const discordBot = require('../x-help/discord')
const Discord = require('discord.js');
const { v4 } = require('uuid');
const CHANNEL = '1039700170830532668' //channel id
const site = 'SPORTSCHEK'; //site name
const catagory = 'AIO'
const version = `Sportschek v1.0` //Site version
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
            'User-Agent': "Mozilla/5.0 (compatible; Google-Site-Verification/1.0)",
        }

        let method = 'GET'; //request method
        let req = `https://www-sportchek-ca.translate.goog/product/${v4()}-${sku}.html?_x_tr_sl=auto&_x_tr_tl=en&_x_tr_hl=en&_x_tr_pto=wapp`//request url
        let set = await helper.requestHtml(req, method, proxy, headers) //request function
        let body = await set.text
        //console.log(set.response.status)
        if (set.response.status != 200) {
            monitor(sku)
            return
        }
        let json = await JSON.parse(body.split('type="application/ld+json">')[1].split('</script>')[0])
        if (json[0].name) {
            let inStock = false;
            let url = `https://www.sportchek.ca/product/Tachyon-Monitors-${sku}.html`//product url
            let title = json[0].name
            let price
            let image = json[0].image
            let stock = 0
            let sizes = []
            let query = await database.query(`SELECT * from ${table} where sku='${sku}'`);
            let oldSizeList = await query.rows[0].sizes
            let sizeList = []
            let variants = json[0].offers
            //pars sizes for loop
            for (let size of variants) {
                if (size.availability == 'OutOfStock')
                    continue
                sizeList.push(size.additionalProperty[0].value);
                if (!oldSizeList.includes(size.additionalProperty[0].value)) {
                    sizes += `[${size.additionalProperty[0].value}](${size.url})\n`;
                    price = size.price
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
        console.log(e)
        monitor(sku)
        return
    }
}
helper.discordbot(CHANNEL, PRODUCTS, table, monitor, site)