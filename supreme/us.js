const helper = require('../x-help/helper');
const { v4 } = require('uuid');
const version = `Supreme v1.0`
let oldSizeList = []
let justStarted = true
monitor()
async function monitor() {
    monitorProducts()
    monitorProducts()
    monitorProducts()
    monitorProducts()
    monitorProducts()
}
async function monitorProducts() {
    let proxy = await helper.getRandomProxy2();
    let URL = `https://www.supremenewyork.com/mobile_stock.json?order=${v4()}`;  //Or you can use ?collection or ?a or ?q
    let headers = {
        'user-agent': 'Mozilla/5.0 (compatible; Google-Site-Verification/1.0)',
    }
    try {
        let method = 'GET';
        let set = await helper.requestShopify(URL, method, proxy, headers)
        //console.log(set.response.status )
        if (set.response.status != 200) {
            monitorProducts()
            return
        }
        let body = set.json
        let categories = Object.keys(body.products_and_categories);
        for (let category of categories) {
            let sitecatagory = category
            let products = body.products_and_categories[category];
            for (let product of products) {
                let price = '$' + product.price / 100
                let title = product.name
                let sku = product.id;
                let pdp = `https://www.supremenewyork.com/shop/${sku}.json`
                let set = await helper.requestShopify(pdp, method, proxy, headers)
                let body = set.json
                for (let style of body.styles) {
                    let sizes = ''
                    let inStock = false
                    let color = style.name
                    let image = `https:${style.image_url_hi}`
                    let url = `https://www.supremenewyork.com/mobile/#products/${sku}`
                    for (let size of style.sizes) {
                        if (!size.stock_level > 0)
                            continue
                        if (!oldSizeList.includes(size.id)) {
                            oldSizeList.push(size.id)
                            sizes += `${size.name}\n`
                            inStock = true
                        }
                    }
                    if (inStock && !justStarted) {
                        console.log(`[time: ${new Date().toISOString()}, product: ${sku}, title: ${title}]`)
                        let sites = await helper.dbconnect('SUPREMEUS')
                        let qt = `Na`
                        let links = 'Na'
                        let sizeright = sizes.split('\n')
                        let sizeleft = sizeright.splice(0, Math.floor(sizeright.length / 2))
                        for (let group of sites) {
                            helper.postSupreme(url, title, sku, price, image, sitecatagory, color, sizeright, sizeleft, group, version, qt, links)
                        }
                        // -shirt, -short, -pant, -sock
                        //if(product.title.toLowerCase().includes('jordan') || product.title.toLowerCase().includes('foam') || product.title.toLowerCase().includes('air force') || product.title.toLowerCase().includes('newbalance') || product.title.toLowerCase().includes('yeezy')  || product.title.toLowerCase().includes('slide') || product.title.toLowerCase().includes('dunk') && !product.title.toLowerCase().includes('shirt')&& !product.title.toLowerCase().includes('shorts') && !product.title.toLowerCase().includes('socks')) {
                    }
                }
            }
        }
        console.log('yes')
        justStarted = false
        monitorProducts()
    } catch (err) {
        console.log(err)
        //console.log(this.WEBSITE
        monitorProducts()
    }
}
