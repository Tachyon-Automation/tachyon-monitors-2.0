const helper = require('../x-help/helper');
const sites = require('../x-help/sites.json');
const groups = require('../x-help/groups.json');
const database = require('../x-help/database');
const discordBot = require('../x-help/discord')
const Discord = require('discord.js');
const { v4 } = require('uuid');
const CHANNEL = '836678488744132708' //channel id
const site = 'DSG'; //site name
const version = `DSG v1.0` //Site version
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
            'User-Agent': "Mozilla/5.0 (iPhone; CPU iPhone OS 12_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148"
        }
        let method = 'GET'; //request method
        let req = `https://www.dickssportinggoods.com/p/spring/msvc/product/v5/store/15108/products/${sku}?abcz=${v4()}`//request url
        let set = await helper.requestJson(req, method, proxy, headers) //request function
        //console.log(set.response.status)
        let body = await set.json
        if (set.response.status != 200) {
            monitor(sku)
            return
        }
        //Define body variables
        if (body.data.title) {
            let inStock = false;
            let url = 'https://www.dickssportinggoods.com' + body.data.pdpSeoUrl
            let title = body.data.title
            let price = "$" + body.data.price.maxOffer
            let image = `https://dks.scene7.com/is/image/GolfGalaxy/${body.data.id}_${body.data.skus[0].defAttributes[0].swatchImage.replace('_swatch', '')}`
            let stock = 0
            let sizes = []
            let query = await database.query(`SELECT * from ${table} where sku='${sku}'`);
            let oldSizeList = await query.rows[0].sizes
            let sizeList = []
            let variants = body.data.skus
            let set = 0
            //pars sizes for loop
            for (let size of variants) {
                if (size.defAttributes.length > 1)
                    set = 1
                else {
                    set = 0
                }
                if (size.atsInventory > 0 && size.defAttributes[0].value.trim().length > 0) {
                    sizes += `${size.defAttributes[set].value.trim()} (${size.atsInventory}) - ${size.id} \n`;
                    stock += size.atsInventory
                    sizeList.push(size.id);
                    if (!oldSizeList.includes(size.id))
                        inStock = true;
                }
            }
            if (inStock) {
                let qt = 'Na'
                let links = 'Na'
                console.log(`[time: ${new Date().toISOString()}, product: ${sku}, title: ${title}]`)
                inStock = false;
                let sizeright = sizes.split('\n')
                let sizeleft = sizeright.splice(0, Math.floor(sizeright.length / 2))
                for (let group of sites[site]) {
                    await helper.postAIO(url, title, sku, price, image, sizeright, sizeleft, stock, groups[group], site, version, qt, links)
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