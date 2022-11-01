const helper = require('../x-help/helper');
const sites = require('../x-help/sites.json');
const groups = require('../x-help/groups.json');
const database = require('../x-help/database');
const discordBot = require('../x-help/discord')
const Discord = require('discord.js');
const { v4 } = require('uuid');
const CHANNEL = '810721157870387242' //channel id
const site = 'OFFSPRING'; //site name
const version = `Offspring v1.0` //Site version
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
            'user-agent': 'Mozilla/5.0 (compatible; Google-Site-Verification/1.0)',
        }
        let method = 'GET';
        let req = `https://www-offspring-co-uk.translate.goog/view/product/offspring_catalog/2,20/${sku}?_x_tr_sl=el&_x_tr_tl=en&_x_tr_hl=en&_x_tr_pto=wapp`//request url
        let set = await helper.requestHtml(req, method, proxy, headers) //request function
        //Define body variables
        //console.log(set.response.status)
        if (set.response.status != 200) {
            monitor(sku)
            return
        }
        let root = set.html
        if(root.querySelector('.product-launch.js-productLaunchBlock.hidden')) {
            await helper.sleep(product.waittime);
            monitor(sku)
            return 
        }
        let url = `https://www.offspring.co.uk/view/product/offspring_catalog/2,20/${sku}#Tachyon`//product url
        let title = root.querySelector('.product__name').textContent.trim().split('&#39;').join("'").split('&quot;').join('"') + ' ' + root.querySelector('.product__variant').textContent.trim().split('&#39;').join("'").split('&quot;').join('"')
        let price = root.querySelector('.price__price.js-price').textContent.trim().replace('&euro; ', '€')
        let id = root.querySelector('#productCodeId').attributes.value
        let image = `https://i1.adis.ws/i/office/${id}_sd1.jpg`
        let sizes = ''
        let inStock = false
        let sizeList = []
        let stock = 0
        let query = await database.query(`SELECT * from ${table} where sku='${sku}'`);
        let oldSizeList = query.rows[0].sizes
        let sizesparse = root.querySelectorAll('.tabs__panel.tabs__panel--active .product__sizes-option:not(.product__sizes-option.product__sizes-option--disabled)')
        for (let size of sizesparse) {
            stock++
          sizes += `[${size.querySelector('.product__sizes-size-1').textContent}](https://www.offspring.co.uk/view/product/offspring_catalog/5,22/${sku}?size=${size.attributes['data-value']})\n`;
          sizeList.push(size.querySelector('.product__sizes-size-1').textContent);
          if (!oldSizeList.includes(size.querySelector('.product__sizes-size-1').textContent))
            inStock = true;
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
        await helper.sleep(product.waittime);
        await monitor(sku);
        return
    } catch (e) {
        //console.log(e)
        monitor(sku)
        return
    }
}
helper.discordbot(CHANNEL, PRODUCTS, table, monitor, site)