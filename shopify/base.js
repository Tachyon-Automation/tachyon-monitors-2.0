const helper = require('../x-help/helper');
const HTTPSProxyAgent = require('https-proxy-agent')
const Discord = require('discord.js');
const { v4 } = require('uuid');
const version = `Shopify v1.0`
let DBSITE
class ShopifyMonitor {

    products;
    lastHash;
    password;
    checkpoint;

    constructor(website, dbsite) {
        this.DBSITE = "SHOPIFY" + dbsite
        this.WEBSITE = website;
        this.products = [];
    }

    async monitor() {
        this.monitorProducts();
        this.monitorProducts();
        //this.monitorAntibot();
    }

    async monitorProducts(page = 1, limit = 100) {
        let proxy = await helper.getRandomProxy();
        let URL = this.WEBSITE + `/products.json?page=${page}&limit=${limit}&order=${v4()}`;  //Or you can use ?collection or ?a or ?q
        let headers = {
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36',
        }
        if (this.DBSITE == "SHOPIFYFUNKO" || this.DBSITE == "SHOPIFYCNCPTS") {
            URL = `${this.WEBSITE.split('.').join('-')}.translate.goog/products.json?collection=pop&page=${page}&limit=${limit}&order=${v4()}`;  //Or you can use ?collection or ?a or ?q
            headers = {
                'user-agent': 'Mozilla/5.0 (compatible; Google-Site-Verification/1.0)',
            }
        }
        try {
            let method = 'GET'; //request method

            let set = await helper.requestJson(URL, method, proxy, headers) //request function
            //console.log(set.response.status, this.WEBSITE)
            if (set.response.status != 200) {
                monitor(sku)
                return
            }
            if (!URL.includes('translate.goog')) {
                let cache = set.response.headers.raw()["x-cache"];
                if (cache != 'miss') {
                    console.log("Missing Cache header");
                    this.monitorProducts()
                    return;
                }
            }
            let body = await set.json
            let currentHash = body
            if (currentHash == this.lastHash) {
                this.monitorProducts();
                return;
            }
            if (this.lastHash) {
                this.lastHash = currentHash;
                this.products = body.products;
                this.monitorProducts();
                return;
            }
            for (let product of body.products) {
                let webhookType = null;
                let variants = []
                let sizes = ""
                let price = ""
                let stock = 0
                for (let variant of product.variants) {
                    if (variant.available && !variants.includes(variant.id)) {
                        if (variant.inventory_quantity) {
                            variants.push(variant.id);
                            sizes += `[${variant.title}](${this.WEBSITE}/cart/${variant.id}:1) | [QT](http://tachyonrobotics.com) (${variant.inventory_quantity})\n`
                            price = variant.price;
                            stock += variant.inventory_quantity
                        } else {
                            variants.push(variant.id);
                            sizes += `[${variant.title}](${this.WEBSITE}/cart/${variant.id}:1) | [QT](http://tachyonrobotics.com) (1+)\n`
                            price = variant.price;
                            stock++
                        }
                    }
                }
                let inStock = variants.length > 0;
                if (!inStock) {
                    continue;
                }
                let oldProduct = this.findProduct(product.id, this.products);
                let oldSizes = "";
                if (oldProduct) {
                    let oldVariants = [];
                    for (let variant of oldProduct.variants) {
                        if (variant.available) {
                            oldVariants.push(variant.id);
                        }
                    }
                    for (let variant of variants) {
                        if (!oldVariants.includes(variant)) {
                            // console.log(product.title + "  -  " + variant)
                            webhookType = "Restock";
                            break;
                        }
                    }
                } else {
                    webhookType = "New Product";
                }
                if (webhookType) {
                    console.log(`[SHOPIFY] (${this.WEBSITE}) ${webhookType} - ${product.title}`)
                    let sites = await helper.dbconnect(this.DBSITE)
                    let unfilteredus = await helper.dbconnect("SHOPIFYUNFILTEREDUS")
                    let qt = `Na`
                    let links = 'Na'
                    let sizeright = sizes.split('\n')
                    let sizeleft = sizeright.splice(0, Math.floor(sizeright.length / 2))
                    for (let group of sites) {
                        helper.postShopify(this.WEBSITE + "/products/" + product.handle, product.title, price, webhookType, product.images[0] ? product.images[0].src : "https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829", sizeright, sizeleft, stock, group, version, qt, links)
                    }
                    for (let group of unfilteredus) {
                        helper.postShopify(this.WEBSITE + "/products/" + product.handle, product.title, price, webhookType, product.images[0] ? product.images[0].src : "https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829", sizeright, sizeleft, stock, group, version, qt, links)
                    }
                    // -shirt, -short, -pant, -sock
                    //if(product.title.toLowerCase().includes('jordan') || product.title.toLowerCase().includes('foam') || product.title.toLowerCase().includes('air force') || product.title.toLowerCase().includes('newbalance') || product.title.toLowerCase().includes('yeezy')  || product.title.toLowerCase().includes('slide') || product.title.toLowerCase().includes('dunk') && !product.title.toLowerCase().includes('shirt')&& !product.title.toLowerCase().includes('shorts') && !product.title.toLowerCase().includes('socks')) {
                }
            }
            this.lastHash = currentHash;
            this.products = body.products;
            this.monitorProducts()
        } catch (err) {
            //console.log(err)
            //console.log(this.WEBSITE)
            this.monitorProducts()
        }
    }
    findProduct(id, products) {
        for (let product of products) {
            if (product.id === id)
                return product;
        }
    }
}
module.exports = ShopifyMonitor;