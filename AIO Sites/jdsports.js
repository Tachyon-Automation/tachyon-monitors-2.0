const helper = require('../x-help/helper');
const groups = require('../x-help/groups.json');
const database = require('../x-help/database');
const discordBot = require('../x-help/discord')
const Discord = require('discord.js');
const { v4 } = require('uuid');
const CHANNEL = '899897270680567848' //channel id
const site = 'JDSPORTS'; //site name
const catagory = 'AIO'
const version = `JD Sports v2.0` //Site version
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
        let productID = sku.split(',')[0]
        let styleID = sku.split(',')[1]
        let colorID = sku.split(',')[2]
        //these headers change per site
        let headers = {
            'user-agent': 'Mozilla/5.0 (compatible; MJ12bot/v1.4.1; http://www.majestic12.co.uk/bot.php?+)',
        }
        let method = 'GET'; //request method
        let req = `https://www.jdsports.com/store/browse/json/productSizesJson.jsp?productId=${productID}&styleId=${styleID}&colorId=${colorID}&productId=${v4()}`//request url
        let set = await helper.requestJson(req, method, proxy, headers) //request function
        let body = await set.json
        //Define body variables
        if (set.response.status != 200) {
            monitor(sku)
            return
        }
        if (body.productSizes.length < 0) {
            await helper.sleep(product.waittime);
            monitor(sku)
            return
        }
        let sizes = ''
        let query = await database.query(`SELECT * from ${table} where sku='${sku}'`);
        let oldSizeList = query.rows[0].sizes
        let inStock = false
        let sizeList = []
        let sizesparse = body.productSizes
        let stock = 0
        for (let size of sizesparse) {
            if (size.sizeValue) {
                if (size.productId === styleID + '_' + colorID) {
                    if (size.sizeClass !== 'unavailable') {
                        sizeList.push(size.sizeValue);
                        if (!oldSizeList.includes(size.sizeValue)) {
                            stock += Number(Buffer.from(size.stockLevel, 'base64'))
                            sizes += `${size.sizeValue} (${Buffer.from(size.stockLevel, 'base64').toString()})\n`
                            inStock = true;
                        }
                    }
                }
            }
        }
        if (inStock) {
            let AIO = await helper.dbconnect("AIOFILTEREDUS")
            let sites = await helper.dbconnect(catagory+site)

            let qt = 'Na'
            let links = 'Na'
            let req = `https://www.jdsports.com/store/browse/gadgets/productLookupJSON.jsp?productId=${productID}&styleId=${styleID}&colorId=${colorID}`//request url
            let set = await helper.requestJson(req, method, proxy, headers) //request function
            let body2 = await set.json
            let title = body2.product.name + ' ' + body2.product.colors.color[0].content
            let price = body2.product.Prices.price[0].fullPrice
            let image = body2.product.colors.color[0].thumbnail
            let url = `https://www.jdsports.com/store/product/tachyon/${productID}?styleId=${styleID}&colorId=${colorID}#Tachyon`
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