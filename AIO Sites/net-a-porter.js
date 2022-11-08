const helper = require('../x-help/helper');
const groups = require('../x-help/groups.json');
const database = require('../x-help/database');
const discordBot = require('../x-help/discord')
const Discord = require('discord.js');
const { v4 } = require('uuid');
const CHANNEL = '836291322347388958' //channel id
const site = 'NETAPORTER'; //site name
const catagory = 'AIO'
const version = `Net A Porter v1.0` //Site version
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
        let pluses = ''
        let random = Math.floor(Math.random() * 500) + 1
        for (let i = 0; i < random; i++) {
          pluses += '+'
        }
        let headers = {
            'User-Agent': "Mozilla/5.0 (iPhone; CPU iPhone OS 12_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148",
            'X-IBM-Client-Id': 'c598df52-882c-4bab-8dc9-53f2cc61e00e'
        }
        let method = 'GET'; //request method
        let req = `https://www.net-a-porter.com/api/mobile/inseason/search/resources/store/mrp_US/productview/${sku + pluses}`//request url
        let set = await helper.requestJson(req, method, proxy, headers) //request function
        console.log(set.response.status)
        let body = await set.json
        if (set.response.status != 200) {
            monitor(sku)
            return
        }
        if (body.recordSetCount == 0) {
            await helper.sleep(product.waittime)
            monitor(sku)
            return
        }
        //Define body variables
        if (body.products[0].buyable === true) {
            let inStock = false;
            let url = `https://www.net-a-porter.com/en-us/mens/product/tachyon/${sku}#Tachyon`//product url
            let title = body.products[0].designerName + ' ' + body.products[0].name
            let price = '$' + body.products[0].price.sellingPrice.amount / 100
            let image = `https://i.imgur.com/VcqS616.png`
            let stock = 0
            let sizes = []
            let query = await database.query(`SELECT * from ${table} where sku='${sku}'`);
            let oldSizeList = await query.rows[0].sizes
            let sizeList = []
            let variants = body.products[0].productColours[0].sKUs
            //pars sizes for loop
            for (let variant of variants) {
                if (variant.buyable === true) {
                  sizes += `${variant.size.labelSize} \n`
                  stock++
                  sizeList.push(variant.size.labelSize);
                  if (!oldSizeList.includes(variant.size.labelSize))
                    inStock = true;
                }
              }
            if (inStock) {
                let sites = await helper.dbconnect(catagory+'NET-A-PORTER')
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