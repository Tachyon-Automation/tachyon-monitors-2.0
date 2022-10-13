const helper = require('../x-help/helper');
const sites = require('../x-help/sites.json');
const groups = require('../x-help/groups.json');
const database = require('../x-help/database');
const discordBot = require('../x-help/discord')
const Discord = require('discord.js');
const { v4 } = require('uuid');
const CHANNEL = '810950059784667187' //channel id
const site = 'ENDCLOTHING'; //site name
const version = `END v1.0` //Site version
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
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.77 Safari/537.36',
        }
        let method = 'GET'; //request method
        let req = `https://www.endclothing.com/us/${sku}?abcz=${v4()}`//request url

        let set = await helper.requestBody(req, method, proxy, headers)
        let body = await JSON.parse(set.resp.split('<script id="__NEXT_DATA__" type="application/json">')[1].split('</script>')[0])
        //Custom error handling
        if (set.response.status == 404) {
            console.log('Removed - ' + sku)
            return
        }
        if (set.response.status != 200) {
            monitor(sku)
            return
        }
        //Define body variables
        if (body.props.initialProps.pageProps.product.in_stock === true) {
            let inStock = false;
            let url = `https://www.endclothing.com/us/${sku}#Tachyon`//product url
            let title = body.props.initialProps.pageProps.product.name
            let price = '$' + body.props.initialProps.pageProps.product.price
            let image = 'https://play-lh.googleusercontent.com/OuZqDwJcoCna3sbEjlV58dwBxk2bFYdgwRqe3xOphhAm5RymSSfud3qNSy4pSaRYB9M'
            try { image = body.props.initialProps.pageProps.product.media_gallery_entries[0].file } catch (e) { } //try set image
            let stock = 0
            let sizes = []
            let query = await database.query(`SELECT * from ${table} where sku='${sku}'`);
            let oldSizeList = await query.rows[0].sizes
            let sizeList = []
            let variants = body.props.initialProps.pageProps.product.options[0].values
            //pars sizes for loop
            for (let variant of variants) {
                if(variant.in_stock !== true)
                continue
                sizes += `[${variant.label}](https://www.endclothing.com/us/${sku}?size=${variant.label.replace(' ','')})\n`
                stock++
                sizeList.push(variant.label);
                if (!oldSizeList.includes(variant.label))
                  inStock = true;
              }
            if (inStock) {
                let pid = body.props.initialProps.pageProps.product.sku
                console.log(`[time: ${new Date().toISOString()}, product: ${sku}, title: ${title}]`)
                inStock = false;
                let sizeright = sizes.split('\n')
                let sizeleft = sizeright.splice(0, Math.floor(sizeright.length / 2))
                for (let group of sites[site]) {
                    await helper.postAIO(url, title, pid, price, image, sizeright, sizeleft, stock, groups[group], site, version)
                }
                await database.query(`update ${table} set sizes='${JSON.stringify(sizeList)}' where sku='${sku}'`);

            }
        }
        await helper.sleep(product.waittime);
        monitor(sku);
        return
    } catch (e) {
        //console.log(e)
        await monitor(sku)
        return
    }
}
helper.discordbot(CHANNEL, PRODUCTS, table, monitor, site)