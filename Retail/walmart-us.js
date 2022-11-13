
const helper = require('../x-help/helper');
const groups = require('../x-help/groups.json');
const database = require('../x-help/database');
const discordBot = require('../x-help/discord')
const randomUseragent = require('random-useragent');
const HTMLParser = require('node-html-parser');
const Discord = require('discord.js');
const { v4 } = require('uuid');
const CHANNEL = '810935848899444777' //channel id
const site = 'WALMARTUS'; //site name
const catagory = 'RETAIL'
const version = `Walmart US v1.0` //Site version
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
    }
    console.log(`[${site}] Monitoring all SKUs!`)
}

async function monitor(sku) {
    try {
        let product = PRODUCTS[sku]
        if (!product)
            return;
            
        let proxy = await helper.getRandomProxy(); //proxy per site
        //let agent = randomUseragent.getRandom(); //random agent per site
        //these headers change per site
        let headers = {
            'cookie': v4(),
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36',
        }
        let method = 'GET'; //request method
        let req = `https://www.walmart.com/ip/tachyon/${sku}/.js?cache=${v4()}`//request url
        let set = await helper.requestHtml(req, method, proxy, headers) //request function
        console.log(set.response.status)
        let parse = set.text.split('">{"p')[1].split('scriptLoader":[]}')[0].trim()
        body = await JSON.parse('{"p' + parse + 'scriptLoader":[]}')
        let status = PRODUCTS[sku].sizes

        if (set.response.status == 404) {
            await helper.sleep(product.waittime);
            monitor(sku);
            return
        }
        if (set.response.status != 200) {
            monitor(sku);
            return
        }
            if (body.props.pageProps.initialData.data.product.sellerId == 'F55CDC31AB754BB68FE0B39041159D63' && body.props.pageProps.initialData.data.product.shippingOption.availabilityStatus == 'AVAILABLE') {
                let url = `https://www.walmart.com/ip/tachyon/${sku}#Tachyon`
                let title = body.props.pageProps.initialData.data.product.name
                let price = body.props.pageProps.initialData.data.product.priceInfo.currentPrice.priceDisplay
                let image = body.props.pageProps.initialData.data.product.imageInfo.thumbnailUrl
                let stock = '1'
                let offerid = body.props.pageProps.initialData.data.product.offerId
                if (status !== "In-Stock") {
                    let sites = await helper.dbconnect(catagory+site)
                    let retail = await helper.dbconnect("RETAILFILTEREDUS")
                    let qt = 'NA'
                    let links = `[ATC](http://goto.walmart.com/c/2242082/565706/9383?veh=aff&sourceid=imp_000011112222333344&prodsku=${sku}&u=http%3A%2F%2Faffil.walmart.com%2Fcart%2Fbuynow%3F%3Dveh%3Daff%26affs%3Dsdk%26affsdkversion%3D%26affsdktype%3Djs%26affsdkcomp%3Dbuynowbutton%26colorscheme%3Dorange%26sizescheme%3Dprimary%26affsdkreferer%3Dhttp%253A%252F%252Faffil.walmart.com%26items%3D${sku}%7C1%26upcs%3D)`
                    console.log(`[time: ${new Date().toISOString()}, product: ${sku}, title: ${title}]`)
                    for (let group of sites) {
                        await helper.postAmazon(url, title, sku, price, image, stock, offerid, group, version, qt, links)
                    }
                    for (let group of retail) {
                        helper.postRetail(url, title, sku, price, image, stock, group, version, qt, links)
                    }
                    PRODUCTS[sku].sizes = 'In-Stock'
                    database.query(`update ${table} set sizes='In-Stock' where sku='${sku}'`)
                    await helper.sleep(300000)
                }
            } else {
                if (status !== "Out-of-Stock") {
                    PRODUCTS[sku].sizes = 'Out-of-Stock'
                    database.query(`update ${table} set sizes='Out-of-Stock' where sku='${sku}'`)
                }
            }
        await helper.sleep(product.waittime);
        monitor(sku);
        return
    } catch (e) {
        if(e.message.includes('Cannot read')){
            monitor(sku)
            return
        }
        console.log(e)
        monitor(sku)
        return
    }
}
helper.discordbot(CHANNEL, PRODUCTS, table, monitor, site)
