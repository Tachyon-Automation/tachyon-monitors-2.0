const helper = require('../x-help/helper');
const groups = require('../x-help/groups.json');
const database = require('../x-help/database');
const discordBot = require('../x-help/discord')
const randomUseragent = require('random-useragent');
const HTMLParser = require('node-html-parser');
const Discord = require('discord.js');
const { v4 } = require('uuid');
const CHANNEL = '1006740636457762826' //channel id
const site = 'HIBBETT2'; //site name
const catagory = 'AIO'
const version = `Hibbett v2.0` //Site version
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
        let proxy = await helper.getRandomProxy2(); //proxy per site
        //let agent = randomUseragent.getRandom(); //random agent per site
        //these headers change per site
        let headers = {
            'cookie': v4(),
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36',
        }
        let method = 'GET'; //request method
        let req = `https://hibbett.com/on/demandware.store/Sites-Hibbett-US-Site/default/Stylitics-ShowProductDetails;.js?pid=${sku}&pid=${v4()}`//request url
        let set = await helper.requestHtml(req, method, proxy, headers) //request function
        console.log(set.response.status)
        let root = set.html
        if (set.response.status == 410) {
            console.log('Removed - ' + sku)
            return
        }
        if (set.response.status != 200) {
            monitor(sku);
            return
        }
        if (set.text.includes('no-sizes-available')) {
            await helper.sleep(product.waittime);
            monitor(sku);
            return
        }
        if (root.querySelector('.price-sales')) {
            let title = root.querySelector('h2').textContent.trim().split('&#39;').join("'").split('&quot;').join('"')
            let price = root.querySelector('.price-sales').textContent.trim()
            let image = 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829'
            try { image = 'https:' + root.querySelector('.selectable.color img').attributes.src.split(' ').join('').replace('thumb', 'medium') } catch (e) { }
            try { image = 'https:' + root.querySelector('.color.unselectable.selected img').attributes.src.split(' ').join('').replace('thumb', 'medium') } catch (e) { }
            try { image = 'https:' + root.querySelector('.color.selectable.selected img').attributes.src.split(' ').join('').replace('thumb', 'medium') } catch (e) { }

            let color = ''
            try {color = root.querySelector('.selectable.color img').attributes.src.split(' ').join('').replace('?$thumb$', '').split('_')[1]} catch (e) { }
            try {color = root.querySelector('.color.unselectable.selected img').attributes.src.split(' ').join('').replace('?$thumb$', '').split('_')[1]} catch (e) { }
            try {color = root.querySelector('.color.selectable.selected img').attributes.src.split(' ').join('').replace('?$thumb$', '').split('_')[1]} catch (e) { }
            let url = `https://www.hibbett.com/product?pid=${sku}&dwvar_${sku}_color=${color}#Tachyon`
            let sizes = []
            let query = await database.query(`SELECT * from ${table} where sku='${sku}'`);
            let oldSizeList = query.rows[0].sizes
            let inStock = false
            let sizeList = []
            let variants = root.querySelectorAll('.selectable.size')
            let stock = 0
            for (let variant of variants) {
                sizeList.push(variant.querySelector('.swatchanchor').textContent.split('size').join('').split('Size').join('').trim());
                if (!oldSizeList.includes(variant.querySelector('.swatchanchor').textContent.split('size').join('').split('Size').join('').trim())) {
                    sizes += `${variant.querySelector('.swatchanchor').textContent.split('size').join('').split('Size').join('').trim()}\n`
                    stock++
                    inStock = true;
                }
            }
            if (inStock) {
                let AIO = await helper.dbconnect("AIOFILTEREDUS")
                let sites = await helper.dbconnect(catagory+'HIBBETT')
                let qt = 'Na'
                let links = 'Na'
                helper.posElephentHibbett(sku, title, image)
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
        //console.log(e, sku)
        monitor(sku)
        return
    }
}
helper.discordbot(CHANNEL, PRODUCTS, table, monitor, site)
