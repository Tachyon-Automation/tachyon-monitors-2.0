const helper = require('../x-help/helper');
const sites = require('../x-help/sites.json');
const groups = require('../x-help/groups.json');
const database = require('../x-help/database');
const discordBot = require('../x-help/discord')
const Discord = require('discord.js');
const { v4 } = require('uuid');
const CHANNEL = '1020915930227822592' //channel id
const site = 'SHIEKH'; //site name
const version = `Shiekh v1.0` //Site version
const table = site.toLowerCase();
discordBot.login();
let PRODUCTS = {}
helper.discordbot(CHANNEL, PRODUCTS, table, monitor)
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
        let pid = ''
        try { pid = await sku.split('-').join('%20'); }
        catch (e) { pid = sku }

        //these headers change per site
        let headers = {
            'User-Agent': 'Shiekh Shoes/10.6 (com.shiekh.shoes.ios; build:1233; iOS 16.0.0) Alamofire/5.6.1',
            'X-PX-AUTHORIZATION': "2:eyJ1IjoiNzkxZTY4ODAtNDljZS0xMWVkLWJkMzQtYjMwMTkxYzZiYTM4IiwidiI6IjdhNGIwODUyLTQ5YzgtMTFlZC05MjAyLTYxNTc1OTZhNzA3YSIsInQiOjE1NjE1MDcyMDAwMDAsImgiOiJiMWNiNGRkNTMyNjI3YzViYjU3ZDBlODNiNDg2NWEwM2ExN2U5OTVjNzBlZDAyMzk2M2UyZDc0NjhlOWQ2YjU5In0=",
            //'cookie': '_pxhd=ed9ce29b130292c1a66f33b91ae627ab52a4fed66784efe440d7071da0b8c503:S52ftuakQbyeyjvnStqNDTeKzH2xE2/JKOkq+rC8hORkrCWIrwqWtmJp5OHzDtSueMaUe4P9a+oklc0I+fzs9A==:1000:aeq0oGYQIkyAaFDp7ZUnn1Z3yso6JRPO3Onqha2zjazfBDsaP1onMcJ6esYIMIGFVma15wIuFn78TSZcM021oxw7hMvlv2UMAgJRtk9lVTUzLg0ZmeOc5703HTc9eJ8jTLczEOAD/5wZsMK2R3VLayixZxY1kQS4wBkV9hDtBHxKoUx6Bix99pzQXtfxqtIBI8TQL+1ZCFH00ZhmNyeQiA=='
        }
        let method = 'GET'; //request method
        let req = `https://api.shiekh.com/api/V1/extend/products/${pid}/.ico`//request url
        let set = await helper.requestJson(req, method, proxy, headers) //request function
        //console.log(set.response.status)
        let body = await set.json
        //Custom error handling
        if (set.response.status == 404) {
            console.log(sku)
            return
        }
        if (set.response.status != 200) {
            monitor(sku)
            return
        }
        //Define body variables
        if(body.release_date) {
        let event = Date.parse(new Date(Date.now()).toISOString())
        let event1 = Date.parse(new Date(body.release_date).toISOString())
        if (event1 > event) {
            //console.log('Not released yet')
            await helper.sleep(2000);
            monitor(sku)
            return
        }
    }
        if (body.size.length > 0) {
            let inStock = false;
            let url = `https://shiekh.com/${body.url_path}.html#Tachyon`//product url
            let title = body.name
            let price = '$' + body.price
            let image = 'https://static.shiekh.com/static/version1810601591/frontend/Shiekh2020/default/en_US/images/logo_instagram.jpg'
            try { image = body.images[0].original } catch (e) { } //try set image
            let stock = 0
            let sizes = []
            let query = await database.query(`SELECT * from ${table} where sku='${sku}'`);
            let oldSizeList = await query.rows[0].sizes
            let sizeList = []
            let sizesparse = body.size
            let option_id = body.extension_attributes.configurable_product_options[0].attribute_id
            let option_value = ''//For loop parse
            //pars sizes for loop
            for (let size of sizesparse) {
                if (size.in_stock == true) {
                    sizes += `[${size.value}](${url}?size) (${size.qty}) - ${size.size_id}` + '\n';
                    option_value += `${size.size_id},`
                    stock += Number(size.qty)
                    sizeList.push(size.value);
                    if (!oldSizeList.includes(size.value)) {
                        inStock = true;
                    }
                }
            }
            if (inStock) {
                console.log(`[time: ${new Date().toISOString()}, product: ${sku}, title: ${title}]`)
                inStock = false;
                let sizeright = sizes.split('\n')
                let sizeleft = sizeright.splice(0, Math.floor(sizeright.length / 2))
                for (let group of sites[site]) {
                    await helper.postAIO(url, title, sku, price, image, sizeright, sizeleft, stock, groups[group], site, version)
                }
                await database.query(`update ${table} set sizes='${JSON.stringify(sizeList)}' where sku='${sku}'`);

            }
        }
        monitor(product.waittime);
        return
    } catch (e) {
        //console.log(e)
        monitor(sku)
        return
    }
}