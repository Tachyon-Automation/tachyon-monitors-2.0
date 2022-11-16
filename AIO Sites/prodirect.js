const helper = require('../x-help/helper');
const groups = require('../x-help/groups.json');
const database = require('../x-help/database');
const discordBot = require('../x-help/discord')
const randomUseragent = require('random-useragent');
const Discord = require('discord.js');
const { v4 } = require('uuid');
const CHANNEL = '849887780632657930' //channel id
const site = 'PRODIRECT'; //site name
const catagory = 'AIO'
const version = `Pro Direct v1.0` //Site version
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
            'User-Agent': 'Mozilla/5.0 (Linux; Android 7.0; Nexus 9 Build/NRD90R) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.124 Safari/537.36',
            'x-forwarded-for': '156.50.185.242',
            'pragma': 'no-cache',
            'cache-control': 'no-cache',
            'accept': 'application/json, text/plain, */*',
            'accept-language': 'en-US,en;q=0.9',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
            'cache-control': 'no-cache',
            'referer': `https://www.prodirectsport.com/soccer/p/womens-air-jordan-1-low-sanddrift-washed-teal-sail-womens-shoes-263243/`,
            'accept': 'application/json, text/plain, */*',
            'accept-encoding': 'gzip, deflate, br',
        }
        let method = 'GET'; //request method
        let req = `http://prodirectsport.com/client/api/product/${sku}/availability`//request url
        let set = await helper.requestJson(req, method, proxy, headers) //request function
        let body = await set.json
        console.log(set.response.status)
        if (set.response.status != 200) {
            monitor(sku)
            return
        }
        //Define body variables
        if (body.products[0].id) {
            let inStock = false;
            let url = `https://www.prodirectsport.com/soccer/search/?qq=${sku}#Tachyon`//product url
            let price
            let stock = 0
            let sizes = []
            let query = await database.query(`SELECT * from ${table} where sku='${sku}'`);
            let oldSizeList = await query.rows[0].sizes
            let sizeList = []
            let sizesparse = body.products[0].sizes
            //pars sizes for loop
            for (let size of sizesparse) {
                if (size.isOutOfStock != true) {
                    sizeList.push(size.variantId);
                    if (!oldSizeList.includes(size.variantId)) {
                        sizes += `${size.variantId}\n`;
                        stock++
                        price = size.currentPriceFormatted
                        inStock = true;
                    }
                }
            }
            if (inStock) {
                let req = `https://www.prodirectsport.com/soccer/search/?qq=${sku}`//request url
                let set = await helper.requestHtml(req, method, proxy, headers) //request function
                let body = set.text
                if (set.response.status != 200) {
                    monitor(sku)
                    return
                }
                let json = await JSON.parse(body.split('type="application/ld+json">')[1].split('</script>')[0])
                let image = json.image[0]
                let title = json.name
                let AIO = await helper.dbconnect("AIOFILTEREDEU")
                let sites = await helper.dbconnect(catagory+site)
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