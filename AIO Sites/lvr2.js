const helper = require('../x-help/helper');
const { v4 } = require('uuid');
const site = 'LVR'; //site name
const catagory = 'AIO'
const version = `LVR v1.0` //Site version
let oldSizeList = []
let justStarted = true
monitor()
async function monitor() {
    monitorProducts()
}
async function monitorProducts() {
    let proxy = await helper.getRandomProxy();
    let URL = `https://www-luisaviaroma-com.translate.goog/en-us/shop/men/shoes/sneakers?lvrid=_gm_i4_c97&SortType=NewIn&ajax=true&id=${v4()}&_x_tr_sl=auto&_x_tr_tl=en&_x_tr_hl=en&_x_tr_pto=wapp`;  //Or you can use ?collection or ?a or ?q
    let headers = {
        'user-agent': 'Mozilla/5.0 (compatible; Google-Site-Verification/1.0)',
    }
    try {
        let method = 'GET';
        let set = await helper.requestShopify(URL, method, proxy, headers)
        console.log(set.response.status )
        if (set.response.status != 200) {
            monitorProducts()
            return
        }
        let body = await set.json
        let products = body.Items;
        for (let product of products) {
            let price = product.ListPriceDiscounted
            let title = product.Description
            let sku = product.ItemCode;
            let stock = 0
            let sizes = ''
            let inStock = false
            //let image = 'https://images.lvrcdn.com/Big' + product.Image
            let image = 'https://i.imgur.com/UYW8kfZ.png'
            let url = `https://www.luisaviaroma.com/${sku}#Tachyon`//product url
            if (!product.OfferMetaInfo.Availability == 'InStock')
                continue
            for (let size of product.SizeArray) {
                if (!oldSizeList.includes(size + product.ItemCode)) {
                    oldSizeList.push(size + product.ItemCode)
                    sizes += `${size}\n`
                    stock++
                    inStock = true
                }
            }
            if (inStock && !justStarted) {
                let AIO = await helper.dbconnect("AIOFILTEREDEU")
                let sites = await helper.dbconnect(catagory + site)
                let qt = 'Na'
                let links = 'Na'
                console.log(`[time: ${new Date().toISOString()}, product: ${sku}, title: ${title}]`)
                let sizeright = sizes.split('\n')
                let sizeleft = sizeright.splice(0, Math.floor(sizeright.length / 2))
                for (let group of sites) {
                    helper.postAIO(url, title, sku, price, image, sizeright, sizeleft, stock, group, version, qt, links)
                }
                for (let group of AIO) {
                    helper.postAIO(url, title, sku, price, image, sizeright, sizeleft, stock, group, version, qt, links)
                }
                // -shirt, -short, -pant, -sock
                //if(product.title.toLowerCase().includes('jordan') || product.title.toLowerCase().includes('foam') || product.title.toLowerCase().includes('air force') || product.title.toLowerCase().includes('newbalance') || product.title.toLowerCase().includes('yeezy')  || product.title.toLowerCase().includes('slide') || product.title.toLowerCase().includes('dunk') && !product.title.toLowerCase().includes('shirt')&& !product.title.toLowerCase().includes('shorts') && !product.title.toLowerCase().includes('socks')) {
            }


        }
        //console.log('yes')
        justStarted = false
        monitorProducts()
    } catch (err) {
        //console.log(err)
        //console.log(this.WEBSITE
        monitorProducts()
    }
}
