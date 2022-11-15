const helper = require('../x-help/helper');
const { v4 } = require('uuid');
const version = `Shopify v3.0`
let DBSITE
let products = [];
let lastHash
class ShopifyMonitor {

    products;
    lastHash;
    password;
    checkpoint;

    constructor(website, dbsite) {
        this.DBSITE = "SHOPIFY" + dbsite
        this.WEBSITE = website;
    }

    async monitor() {
        //this.monitorAntibot();
        this.monitorProducts("1", "250", lastHash, products);
        this.monitorProducts("2", "250", lastHash, products);
        this.monitorProducts("1", "25", lastHash, products);

    }

    async monitorProducts(page, limit, lastHash, products) {
        let start = Date.now()
        let proxy = await helper.getRandomProxy2();
        let URL = `${this.WEBSITE}/products.json?page=${page}&limit=${limit}&order=${v4()}`;  //Or you can use ?collection or ?a or ?q
        let headers = {
            'user-agent': 'Mozilla/5.0 (compatible; Google-Site-Verification/1.0)',
        }
        if (this.DBSITE == "SHOPIFYFUNKO" || this.DBSITE == "SHOPIFYCNCPTS") {
            URL = `${this.WEBSITE.split('-').join('--').split('.').join('-')}.translate.goog/products.json?collection=pop&page=${page}&limit=${limit}&order=${v4()}`;  //Or you can use ?collection or ?a or ?q
            headers = {
                'user-agent': 'Mozilla/5.0 (compatible; Google-Site-Verification/1.0)',
            }
        }
        try {
            let method = 'GET'; //request method
            let set = await helper.requestShopify(URL, method, proxy, headers) //request function
            //console.log(set.response.status )
            if (set.response.status != 200) {
                this.monitorProducts(page, limit, lastHash, products)
                return
            }
            if (!URL.includes('translate.goog')) {
                let cache = set.response.headers.raw()["x-cache"];
                if (cache == 'miss, MISS')
                    cache = 'miss'
                if (cache != 'miss' || cache == 'hit, server, MISS') {
                    console.log("Missing Cache header", this.WEBSITE, cache);
                    this.monitorProducts(page, limit, lastHash, products)
                    return;
                }
            }
            let requestTimeTaken = Date.now() - start
            //console.log(requestTimeTaken, limit)
            let body = set.json
            let currentHash = body
            if (currentHash == lastHash) {
                this.monitorProducts(page, limit, lastHash, products);
                return;
            }
            if (!lastHash) {
                lastHash = currentHash;
                products = body.products;
                this.monitorProducts(page, limit, lastHash, products);
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
                        variants.push(variant.id);
                        sizes += `[${variant.title}](${this.WEBSITE}/cart/${variant.id}:1) | [QT](http://tachyonrobotics.com) (1+)\n`
                        price = variant.price;
                        stock++
                    }
                }
                let inStock = variants.length > 0;
                if (!inStock) {
                    continue;
                }
                let oldProduct = this.findProduct(product.id, products);
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
                    let set2 = await helper.requestShopify(`${this.WEBSITE + "/products/" + product.handle}.json?order=${v4()}`, method, proxy, headers) //request function
                    if (set2.response.status != 200) {
                        this.monitorProducts(page, limit, lastHash, products)
                        return
                    }
                    let variantse = await set2.json.product.variants
                    if (variantse[0].inventory_quantity) {
                        sizes = ''
                        stock = 0
                        for (let variant of variantse) {
                            if (variant.available) {
                                sizes += `[${variant.title}](${this.WEBSITE}/cart/${variant.id}:1) | [QT](http://tachyonrobotics.com) [${variant.inventory_quantity}]\n`
                                stock += variant.inventory_quantity
                            }
                        }
                    }
                    let date = new Date()
                    console.log(`[SHOPIFY] (${this.WEBSITE}) ${date} - ${product.title}`)
                    let sites = await helper.dbconnect(this.DBSITE)
                    let qt = `Na`
                    let links = 'Na'
                    let sizeright = sizes.split('\n')
                    let sizeleft = sizeright.splice(0, Math.floor(sizeright.length / 2))
                    for (let group of sites) {
                        helper.postShopify(this.WEBSITE + "/products/" + product.handle, product.title, price, webhookType, product.images[0] ? product.images[0].src : "https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829", sizeright, sizeleft, stock, group, version, qt, links, date)
                    }
                    if (this.WEBSITE.includes('.com') && !this.WEBSITE.includes('.au') && !this.WEBSITE.includes('.jp') && !this.WEBSITE.includes('.nl') && !this.WEBSITE.includes('.ca') && !this.WEBSITE.includes('.uk') && !this.WEBSITE.includes('.mx') && !this.WEBSITE.includes('.nz') && !this.WEBSITE.includes('.id') && !this.WEBSITE.includes('.fr') && !this.WEBSITE.includes('.cc') && !this.WEBSITE.includes('.sg')) {
                        let unfilteredus = await helper.dbconnect("SHOPIFYUNFILTEREDUS")
                        for (let group of unfilteredus) {
                            helper.postShopify(this.WEBSITE + "/products/" + product.handle, product.title, price, webhookType, product.images[0] ? product.images[0].src : "https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829", sizeright, sizeleft, stock, group, version, qt, links, date)
                        }
                    } else if
                        (this.WEBSITE.includes('.ca')) {
                        let unfilteredca = await helper.dbconnect("SHOPIFYUNFILTEREDCA")
                        for (let group of unfilteredca) {
                            helper.postShopify(this.WEBSITE + "/products/" + product.handle, product.title, price, webhookType, product.images[0] ? product.images[0].src : "https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829", sizeright, sizeleft, stock, group, version, qt, links, date)
                        }
                    } else {
                        let unfilteredeu = await helper.dbconnect("SHOPIFYUNFILTEREDEU")
                        for (let group of unfilteredeu) {
                            helper.postShopify(this.WEBSITE + "/products/" + product.handle, product.title, price, webhookType, product.images[0] ? product.images[0].src : "https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829", sizeright, sizeleft, stock, group, version, qt, links, date)
                        }
                    }
                    if (product.title.toLowerCase().includes('jordan') || product.title.toLowerCase().includes('foam') || product.title.toLowerCase().includes('air force') || product.title.toLowerCase().includes('newbalance') || product.title.toLowerCase().includes('yeezy') || product.title.toLowerCase().includes('slide') || product.title.toLowerCase().includes('dunk') && !product.title.toLowerCase().includes('shirt') && !product.title.toLowerCase().includes('shorts') && !product.title.toLowerCase().includes('socks') && this.WEBSITE.includes('.com') && !this.WEBSITE.includes('.au') && !this.WEBSITE.includes('.jp') && !this.WEBSITE.includes('.nl') && !this.WEBSITE.includes('.ca') && !this.WEBSITE.includes('.uk') && !this.WEBSITE.includes('.mx') && !this.WEBSITE.includes('.nz') && !this.WEBSITE.includes('.id') && !this.WEBSITE.includes('.fr') && !this.WEBSITE.includes('.cc') && !this.WEBSITE.includes('.co')) {
                        let filterdus = await helper.dbconnect("SHOPIFYFILTEREDUS")
                        for (let group of filterdus) {
                            helper.postShopify(this.WEBSITE + "/products/" + product.handle, product.title, price, webhookType, product.images[0] ? product.images[0].src : "https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829", sizeright, sizeleft, stock, group, version, qt, links, date)
                        }
                    } else if (product.title.toLowerCase().includes('jordan') || product.title.toLowerCase().includes('foam') || product.title.toLowerCase().includes('air force') || product.title.toLowerCase().includes('newbalance') || product.title.toLowerCase().includes('yeezy') || product.title.toLowerCase().includes('slide') || product.title.toLowerCase().includes('dunk') && !product.title.toLowerCase().includes('shirt') && !product.title.toLowerCase().includes('shorts') && !product.title.toLowerCase().includes('socks') && this.WEBSITE.includes('.ca')) {
                        let filterdca = await helper.dbconnect("SHOPIFYFILTEREDCA")
                        for (let group of filterdca) {
                            helper.postShopify(this.WEBSITE + "/products/" + product.handle, product.title, price, webhookType, product.images[0] ? product.images[0].src : "https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829", sizeright, sizeleft, stock, group, version, qt, links, date)
                        }
                    } else if (product.title.toLowerCase().includes('jordan') || product.title.toLowerCase().includes('foam') || product.title.toLowerCase().includes('air force') || product.title.toLowerCase().includes('newbalance') || product.title.toLowerCase().includes('yeezy') || product.title.toLowerCase().includes('slide') || product.title.toLowerCase().includes('dunk') && !product.title.toLowerCase().includes('shirt') && !product.title.toLowerCase().includes('shorts') && !product.title.toLowerCase().includes('socks')) {
                        let filterdeu = await helper.dbconnect("SHOPIFYFILTEREDEU")
                        for (let group of filterdeu) {
                            helper.postShopify(this.WEBSITE + "/products/" + product.handle, product.title, price, webhookType, product.images[0] ? product.images[0].src : "https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829", sizeright, sizeleft, stock, group, version, qt, links, date)
                        }
                    }
                    // -shirt, -short, -pant, -sock
                    //if(product.title.toLowerCase().includes('jordan') || product.title.toLowerCase().includes('foam') || product.title.toLowerCase().includes('air force') || product.title.toLowerCase().includes('newbalance') || product.title.toLowerCase().includes('yeezy')  || product.title.toLowerCase().includes('slide') || product.title.toLowerCase().includes('dunk') && !product.title.toLowerCase().includes('shirt')&& !product.title.toLowerCase().includes('shorts') && !product.title.toLowerCase().includes('socks')) {
                }
            }
            lastHash = currentHash;
            products = body.products
            this.monitorProducts(page, limit, lastHash, products)
        } catch (err) {
            //console.log(err)
            //console.log(this.WEBSITE
            this.monitorProducts(page, limit, lastHash, products)
        }
    }
    async monitorAntibot() {
        let errored = false;
        let URL = this.WEBSITE + "/checkout";
        let proxy = await helper.getRandomProxy();
        let method = 'GET'; //request method
        let headers = {
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36',
        }
        if (this.DBSITE == "SHOPIFYFUNKO" || this.DBSITE == "SHOPIFYCNCPTS") {
            URL = `${this.WEBSITE.split('.').join('-')}.translate.goog/checkout?_x_tr_sl=auto&_x_tr_tl=en&_x_tr_hl=en&_x_tr_pto=wapp`;  //Or you can use ?collection or ?a or ?q
            headers = {
                'user-agent': 'Mozilla/5.0 (compatible; Google-Site-Verification/1.0)',
            }
        }
        try {
            let set = await helper.requestBody(URL, method, proxy, headers) //request function
            //console.log(set.response.status, this.WEBSITE)
            if (set.response.status != 302) {
                errored = true;
            }
            if (errored) {
                this.monitorAntibot()
                return;
            }
            let location = set.response.headers.raw()["location"];
            if (location)
                location = location[0];
            if (location && location.includes('password')) {
                if (this.password !== "Up") {
                    if (this.password) {
                        let sites = await helper.dbconnect(this.DBSITE)
                        for (let group of sites) {
                            helper.postPassword(this.WEBSITE, group, 'Password Page Up!', version)
                        }
                        let password = await helper.dbconnect("SHOPIFYPINGSPASSWORD")
                        for (let group of password) {
                            helper.postPassword(this.WEBSITE, group, 'Password Page Up!', version)
                        }
                    }
                    this.password = "Up";
                    console.log(`[SHOPIFY] (${this.WEBSITE}) Password Page Up!`);
                }
            }
            else if (this.password === "Up") {
                if (this.password) {
                    let sites = await helper.dbconnect(this.DBSITE)
                    for (let group of sites) {
                        helper.postPassword(this.WEBSITE, group, 'Password Page Down!', version)
                    }
                    let password = await helper.dbconnect("SHOPIFYPINGSPASSWORD")
                    for (let group of password) {
                        helper.postPassword(this.WEBSITE, group, 'Password Page Down!', version)
                    }
                }
            }
            await helper.sleep(1000)
            this.monitorAntibot();
            return;
        } catch (err) {
            this.monitorAntibot()
            return;
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