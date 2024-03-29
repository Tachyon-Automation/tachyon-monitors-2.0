const helper = require('../x-help/helper');
const groups = require('../x-help/groups.json');
const database = require('../x-help/database');
const discordBot = require('../x-help/discord')
const randomUseragent = require('random-useragent');
const HTMLParser = require('node-html-parser');
const Discord = require('discord.js');
const { v4 } = require('uuid');
const CHANNEL = '810930365254467665' //channel id
const site = 'HIBBETT'; //site name
const catagory = 'AIO'
const version = `Hibbett v1.0` //Site version
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
        //let agent = randomUseragent.getRandom(); //random agent per site
        //these headers change per site
        let headers = {
            'cookie': v4(),
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36',
        }
        let method = 'GET'; //request method
        let req = `https://hibbett.com/product;.js?pid=${sku}&dwvar_${sku}&format=${v4()}`//request url
        let set = await helper.requestHtml(req, method, proxy, headers) //request function
        //console.log(set.response.status)
        let root = HTMLParser.parse(await set.text)
        if (set.response.status == 410) {
            console.log('Removed - ' + sku)
            return
        }
        if (set.response.status != 200) {
            monitor(sku);
            return
        }
        if (root.querySelector('.all-variants-out-of-stock')) {
            await helper.sleep(product.waittime);
            monitor(sku);
            return
        }
        if (root.querySelector('.product-name')) {
            let title = root.querySelector('.product-name').textContent.trim().split('&#39;').join("'").split('&quot;').join('"')
            let price = root.querySelector('.price-sales').textContent.trim()
            let image = 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829'
            try { image = root.querySelector('.product-image').attributes.src.split(' ').join('').replace('small', 'medium') } catch (e) { }
            let color = root.querySelector('.product-image').attributes.src.split(' ').join('').replace('?$small$', '').split('-')[1]
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
                    sizes += `[${variant.querySelector('.swatchanchor').textContent.split('size').join('').split('Size').join('').trim()}](https://www.hibbett.com/product?${variant.querySelector('.swatchanchor').attributes.href.split('?')[1].split('&_x_tr_sl=auto&_x_tr_tl=en&_x_tr_hl=en-US&_x_tr_pto=nui').join('')}&dwvar_${sku}_color=${color})\n`
                    stock++
                    inStock = true;
                }
            }

            if (inStock) {
                let sites = await helper.dbconnect(catagory+site)
                let AIO = await helper.dbconnect("AIOFILTEREDUS")
                let qt = 'Na'
                let links = 'Na'
                //helper.posElephentHibbett(sku, title, image)
                console.log(url, title, sku, price, image, stock)
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
        //await helper.sleep(product.waittime);
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
