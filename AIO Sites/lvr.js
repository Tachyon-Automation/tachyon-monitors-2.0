const helper = require('../x-help/helper');
const groups = require('../x-help/groups.json');
const database = require('../x-help/database');
const discordBot = require('../x-help/discord')
const crypto = require("crypto");
const Discord = require('discord.js');
const { v4 } = require('uuid');
const { Console } = require('console');
const CHANNEL = '849674744496128050' //channel id
const site = 'LVR'; //site name
const catagory = 'AIO'
const version = `LVR v1.0` //Site version
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
        var key = new Uint8Array([-114, -89, -101, -50, -61, -43, 69, -105, -17, -31, -122, 120, 10, -125, 92, 7, 84, 0, 98, 58, 17, 72, 29, 61, 23, -35, -110, -23, 5, -37, -74, 21]);
        var startTime = Math.floor((Date.now() - 300000) / 1000);
        var endTime = Math.floor((Date.now() + 1800000) / 1000);
        var data = `st=${startTime}~exp=${endTime}~acl=*`;
        var hmac = hmacsha256(key, data);
        function hmacsha256(key, data) {
            return crypto.createHmac("SHA256", key).update(data).digest("hex");
        }
        let product = PRODUCTS[sku]
        let seasonid = sku.split('-')[0]
        let collectionid = sku.split('-')[1].substring(0, 3)
        let itemid1 = sku.split('-')[1].slice(-3)
        let itemid = ''
        if (itemid1.substring(0, 1) > 0) {
            itemid = itemid1
        } else {
            itemid = sku.split('-')[1].slice(-3).replace('0', '')
        }
        if (!product)
            return;
        let proxy = 'http://usa.rotating.proxyrack.net:9000'; //proxy per site
        //these headers change per site
        let headers = {
            'User-Agent': 'yacybot (/global; amd64 Linux 5.1.0-gentoo; java 1.8.0_201; Europe/de) http://yacy.net/bot.html',
            '__lvr_mobile_api_token__': `${data}~hmac=${hmac}`,
        }
        let method = 'GET'; //request method
        let method2 = 'PUT'; //request method
        let req = `https://api.luisaviaroma.com/lvrapprk/public/v1/itemminimal?format=json&Language=EN&Country=US&CurrencyView=USD&CurrencyFatt=USD&App=true&ItemCode=${sku}&SeasonId=${seasonid}&CollectionId=${collectionid}&ItemId=${itemid}`//request url
        let set2 = await helper.requestBody(req, method2, proxy, headers)
        if (set2.response.status != 501) {
            monitor(sku)
            return
        }
        let set = await helper.requestJson(req, method, proxy, headers) //request function
        console.log(set.response.status)
        let body = await set.json
        if (set.response.status === 404) {
            await helper.sleep(product.waittime);
            monitor(sku)
            return
        }

        if (set.response.status != 200) {
            monitor(sku)
            return
        }
        //Define body variables
        if (body.DesignerText) {
            let inStock = false;
            let url = `https://www.luisaviaroma.com/${sku}#Tachyon`//product url
            let title = body.DesignerText + ' ' + body.DescriptionText + ' ' + body.AvailabilityByColor[0].Description.toUpperCase()
            let price = body.AvailabilityByColor[0].SizeAvailability[0].Pricing.Prices[0].ListPrice.toString()
            let image = 'https://i.imgur.com/UYW8kfZ.png'
            let stock = 0
            let sizes = []
            let query = await database.query(`SELECT * from ${table} where sku='${sku}'`);
            let oldSizeList = await query.rows[0].sizes
            let sizeList = []
            let variants = body.AvailabilityByColor[0].SizeAvailability
            //pars sizes for loop
            for (let variant of variants) {
                stock += Number(variant.QuantitiesTotal.Available)
                sizes += `${variant.SizeValue} (${variant.QuantitiesTotal.Available})\n`
                sizeList.push(variant.SizeValue);
                if (!oldSizeList.includes(variant.SizeValue))
                    inStock = true;
            }
            if (inStock) {
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