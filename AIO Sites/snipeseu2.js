const helper = require('../x-help/helper');
const groups = require('../x-help/groups.json');
const database = require('../x-help/database');
const discordBot = require('../x-help/discord')
const randomUseragent = require('random-useragent');
const Discord = require('discord.js');
const { v4 } = require('uuid');
const CHANNEL = '1031268085560266762' //channel id
const site = 'SNIPESEU2'; //site name
const catagory = 'AIO'
const version = `Snipes v2.0` //Site version
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
            'cookie': v4(),

        }
        let method = 'GET'; //request method
        let req = `https://www.snipes.com/s/snse-DE-AT/dw/shop/v19_5/products/(${sku})?client_id=cf212f59-94d1-4314-996f-7a11871156f4&cache=${v4()}&locale=de-DE&expand=availability,+prices,+promotions,+variations`//request url
        let set = await helper.requestJson(req, method, proxy, headers) //request function
        let body = await set.json
        console.log(set.response.status)
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
        body = body.data[0]
        if (body.inventory.ats > 0 && body.inventory.orderable == true) {
            let inStock = false
            let url = `https://www.snipes.com/${sku}.html#Tachyon`
            let title = body.name;
            let price = body.c_akeneo_wwsprice[0]
            let image = `https://www.snipes.com/dw/image/v2/BDCB_PRD/on/demandware.static/-/Sites-snse-master-eu/default/dwb94c64eb/${await JSON.parse(body.c_akeneo_images)[0]}.jpg?sw=780&sh=780&sm=fit&sfrm=png`
            let stock = body.inventory.ats
            let sizes = []
            let query = await database.query(`SELECT * from ${table} where sku='${sku}'`);
            let oldSizeList = await query.rows[0].sizes
            let sizeList = []
            let variants = body.variants
            //pars sizes for l
            for (let size of variants) {
                if (size.orderable === true) {
                    sizes += `[${size.variation_values.size}](https://www.snipes.com/${size.product_id.trim()}.html#Tachyon) - ${size.product_id.trim()}\n`;
                    sizeList.push(size.variation_values.size);
                    if (!oldSizeList.includes(size.variation_values.size)) {
                        inStock = true;
                    }
                }
            }
            if (inStock) {
                let sites = await helper.dbconnect(catagory+site)
                let burst = `[Burst](http://localhost:4000/qt?st=snipes&p=https://www.snipes.com/p/${sku}.html)\n`
                let flare = `[Flare](http://127.0.0.1:5559/quicktask?product=https://www.snipes.com/p/${sku}.html)\n`
                let ganesh = `[Ganesh](https://ganeshbot.com/api/quicktask?STORE=SNIPES&PRODUCT=${sku}&SIZE=ANY)`
                let fr = `[FR](https://www.snipes.fr/p/${sku}.html) . `
                let be = `[BE](https://www.snipes.be/p/${sku}.html) . `
                let ch = `[CH](https://www.snipes.ch/p/${sku}.html) . `
                let nl = `[NL](https://www.snipes.nl/p/${sku}.html)\n`
                let it = `[IT](https://www.snipes.it/p/${sku}.html) . `
                let es = `[ES](https://www.snipes.es/p/${sku}.html) . `
                let at = `[AT](https://www.snipes.at/p/${sku}.html)`
                let qt = burst + flare + ganesh
                let links = fr + be + ch + nl + it + es + at
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