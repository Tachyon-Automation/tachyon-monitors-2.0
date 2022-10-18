let fetch = require('node-fetch');
let fs = require('fs');
const HTTPSProxyAgent = require('https-proxy-agent');
const { v4 } = require('uuid')
const webhook = require("webhook-discord");
const discordBot = require('../../discord-bot');
const hash = require('xxh3-ts/xxh3').XXH3_128;
const helper = require('../../helper');
const AbortController = require('abort-controller')
class ShopifyMonitor {

    products;
    lastHash;
    totalData;
    password;
    checkpoint;

    constructor(website, proxies = [], discordWebhook, responseLimit = 250) {
        this.WEBSITE = website;
        this.PROXIES = proxies;
        this.WEBHOOK = new webhook.Webhook(discordWebhook);
        this.products = [];
        this.lastLength = 0;
        this.totalData = 0;
    }

    async monitor() {
        this.monitorProducts();
        this.monitorProducts();
        this.monitorProducts();
        //this.monitorAntibot();
    }

    async monitorProducts(page = 1, limit = 250) {
        let start = Date.now()
        let proxy = helper.getRandomDDProxy();
        let URL = this.WEBSITE + `/products.json?page=${page}&limit=${limit}&order=${v4()}`;  //Or you can use ?collection or ?a or ?q
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000)
        // console.log(`[SHOPIFY] (${getTime()}) (${this.WEBSITE}) Monitoring...`)
        let errored = false;
        // console.log("Done");
        try {
            let response = await fetch(URL, {
                agent: new HTTPSProxyAgent(proxy),
                // headers: {
                //'User-Agent': 'PostmanRuntime/7.28.4',
                'X-Forwarded-For': '%20',
                //     'X-Forwarded-For': ''
                // },
                headers: URL.includes('undefeated') ? {
                    // 'User-Agent': 'Gigabot/3.0 (http://www.gigablast.com/spider.html)',
                    // 'X-Forwarded-For': '',
                    // 'X-Forwarded-For': ''
                } : null,
                redirect: 'manual',
                signal: controller.signal
            }).catch(err => {
                if (err.type === 'request-timeout' || err.type === 'body-timeout' || err.type === 'aborted') {
                    errored = true;
                    console.log("[SHOPIFY] Timed out: " + this.WEBSITE + " - " + proxy);
                    this.monitorProducts();
                    return;
                }
                if (err.code === 'ECONNRESET') {
                    errored = true;
                    console.log("[SHOPIFY] ECONNRESET: " + this.WEBSITE + " - " + proxy);
                    this.monitorProducts();
                    return;
                }
                console.log("*********SHOPIFY-ERROR*********");
                console.log("URL: " + URL);
                console.log("Proxy: " + proxy);
                console.log(err)
                errored = true
                this.monitorProducts()
            });
            clearTimeout(timeoutId)
            if (errored)
                return;
                if (errored.type === 'aborted') {
                    //console.log("[HIBBETT] Timeout - " + sku, proxy)
                    this.monitorProducts();
                    return;
                }
            if (response.status === 401) {
                // console.log(`[SHOPIFY] (${this.WEBSITE}) Password`);
                this.monitorProducts();
                return;
            }
            if(response.status === 429) {
                console.log(`[SHOPIFY] 429 - ${this.WEBSITE}`);
                this.monitorProducts();
                return;

            }
            if(response.status === 400) {
                //console.log(`[SHOPIFY] 429 - ${this.WEBSITE}`);
                this.monitorProducts();
                return;

            }
            if(response.status === 404) {
                //console.log(`[SHOPIFY] 429 - ${this.WEBSITE}`);
                this.monitorProducts();
                return;

            }
            if(response.status === 403) {
                console.log(`[SHOPIFY] 403 - ${this.WEBSITE}`);
                this.monitorProducts();
                return;
            }
            let requestTimeTaken = Date.now() - start;
            // if (requestTimeTaken > 900) {
                // console.log(`[SHOPIFY] (${this.WEBSITE}) ${requestTimeTaken}ms - ${proxy} - ${this.WEBSITE}`)
            // }
            let cache = response.headers.raw()["x-cache"];
            if (!cache) {
                console.log("Missing Cache header " + URL, response.status);
                // console.log("URL: " + URL);
                // console.log("Proxy: " + proxy);
                // console.log("Cache: " + JSON.stringify(response.headers.raw()["x-cache"]));
                this.monitorProducts()
                return;
            } 
            if (cache[0] !== "miss") {
                console.log("NOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO");
                console.log("URL: " + URL);
                console.log("Proxy: " + proxy);
                console.log("Cache: " + JSON.stringify(response.headers.raw()["x-cache"]));
                this.monitorProducts();
                return;
            }
            // console.log(`[SHOPIFY] (${getTime()}) (${this.WEBSITE}) Fetched!`)
            let body = await helper.getBodyAsText(response)
            let length = body.length;
            this.totalData += length;
            // console.log(`[SHOPIFY] (${getTime()}) (${this.WEBSITE}) Hashing..`)        
            let currentHash = body//hash(Buffer.from(body))
            // console.log(`[SHOPIFY] (${getTime()}) (${this.WEBSITE}) Hash: ${currentHash}`)
            if (currentHash === this.lastHash) {
                let delay = 0 - requestTimeTaken / 2;
                // console.log(`[SHOPIFY] (${getTime()}) (${this.WEBSITE}) Sleeping ${delay <= 0 ? 0 : delay}ms!`)
                this.monitorProducts();
                return;
            }
            try {
                body = JSON.parse(body);
            } catch (err) {
                if (body === '') {
                    this.monitorProducts();
                    return;
                }
                console.log("Error website: " + this.WEBSITE);
                console.log("Proxy: " + proxy);
                console.log(err);
                console.log(body)
                return;
            }
            if (!this.lastHash) {
                this.lastHash = currentHash;
                this.products = body.products;
                this.monitorProducts();
                return;
            }
            let count = 0;

            //READ AND PROCESS
            // console.log(`[SHOPIFY] (${this.WEBSITE}) Change Found!`)
            for (let product of body.products) {
                let webhookType = null;
                // console.log(product.title);
                let variants = []
                let sizes = ""
                let price = ""
                for (let variant of product.variants) {
                    if (variant.available && !variants.includes(variant.id)) {
                        variants.push(variant.id);
                        sizes += `[${variant.title}](${this.WEBSITE}/cart/${variant.id}:1) | [QT](http://localhost:6776/?url=${this.WEBSITE}/cart/${variant.id}:1) (1+)\n`
                        price = variant.price;
                    }
                }
                let inStock = variants.length > 0;
                if (!inStock) {
                    // console.log(product.title);
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
                    console.log(`[SHOPIFY] (${this.WEBSITE}) ${webhookType} - ${Date.now() - start}, ${requestTimeTaken}: ${product.title}`)
                    // -shirt, -short, -pant, -sock
                    if(product.title.toLowerCase().includes('jordan') || product.title.toLowerCase().includes('foam') || product.title.toLowerCase().includes('air force') || product.title.toLowerCase().includes('newbalance') || product.title.toLowerCase().includes('yeezy')  || product.title.toLowerCase().includes('slide') || product.title.toLowerCase().includes('dunk') && !product.title.toLowerCase().includes('shirt')&& !product.title.toLowerCase().includes('shorts') && !product.title.toLowerCase().includes('socks')) {
                    postRestockWebhook(SHOPIFY_FILTERED_HOOK, this.WEBSITE, this.WEBSITE + "/products/" + product.handle, product.title, webhookType, sizes, oldSizes, price, product.images[0] ? product.images[0].src : "https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829", getTime(true))
                    }
                    postRestockWebhook(SHOPIFY_UNFILTERED_HOOK, this.WEBSITE, this.WEBSITE + "/products/" + product.handle, product.title, webhookType, sizes, oldSizes, price, product.images[0] ? product.images[0].src : "https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829", getTime(true))
                    postRestockWebhook(SHOPIFY_UNFILTERED_HOOK2, this.WEBSITE, this.WEBSITE + "/products/" + product.handle, product.title, webhookType, sizes, oldSizes, price, product.images[0] ? product.images[0].src : "https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829", getTime(true))

                }
            }
            let totalTimeTaken = Date.now() - start;
            // console.log(`[SHOPIFY] (${getTime()}) (${this.WEBSITE}) Loaded: ${body.products.length} in ${requestTimeTaken}ms (Request) and ${totalTimeTaken}ms (Total)`)
            let delay = 0 - requestTimeTaken / 2;
            this.lastHash = currentHash;
            this.products = body.products;
            await helper.sleep(delay <= 0 ? 0 : delay)
            this.monitorProducts()
        } catch (err) {
            if (err.type === 'request-timeout' || err.type === 'body-timeout' || err.type === 'aborted') {
               // console.log("[SHOPIFY] Timed out: " + URL);
                this.monitorProducts();
                return;
            }
            console.log("*********SHOPIFY-ERROR*********");
            console.log("URL: " + URL);
            console.log("Proxy: " + proxy);
            console.log(err)
            this.monitorProducts()
        }
    }

    async monitorAntibot() {
        let errored = false;
        let URL = this.WEBSITE + "/checkout";
        let proxy = helper.getRandomDDProxy();
        try {
            let response = await fetch(URL, {
                "headers": {
                    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
                    "accept-language": "en-US,en;q=0.9",
                    "cache-control": "max-age=0",
                    "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"90\", \"Google Chrome\";v=\"90\"",
                    "sec-ch-ua-mobile": "?0",
                    "sec-fetch-dest": "document",
                    "sec-fetch-mode": "navigate",
                    "sec-fetch-site": "none",
                    "sec-fetch-user": "?1",
                    "service-worker-navigation-preload": "true",
                    "upgrade-insecure-requests": "1",
                },
                
                headers: URL.includes('undefeated') ? {
                    //'User-Agent': 'cMcrfcrferrtvwwcrcrfrfrvrrvrfrfrfcwrfrrfvrvgvrvrvrfcrfcrfocfzi fffntel Mefvrvrfrfcrfac rfvrgvrvOwcS X;cwvrgvrgvfrrfcrffvrgvrvfrc',
                    //'X-Host': 'fgbdhfxgbg',
                    //'X-Forwarded-Server': 'rbtbrbsfbt',
                    //'X-HTTP-Host-Override': 'weerbrbedsb',

                } : null,
                method: "HEAD",
                redirect: 'manual',
                'agent': new HTTPSProxyAgent(proxy),
                'timeout': 5000
            }).catch(async err => {
                if (err.type === 'request-timeout' || err.type === 'body-timeout') {
                    errored = true;
                    console.log("[SHOPIFY-ANTIBOT] Timed out: " + this.WEBSITE + " - " + proxy);
                    await helper.sleep(2000);
                    this.monitorAntibot();
                    return;
                }
                if (err.code === 'ECONNRESET') {
                    errored = true;
                    console.log("[SHOPIFY-ANTIBOT] ECONNRESET: " + this.WEBSITE + " - " + proxy);
                    await helper.sleep(1000);
                    this.monitorAntibot();
                    return;
                }
                errored = true;
                console.log("******SHOPIFY-CHECKOUT*******");
                console.log(URL);
                console.log(err);
                await helper.sleep(1000);
                this.monitorAntibot();
                return;
            });
            if(response.status !== 302){
                errored = true;
            }
            if(errored) {
                return;
            }
            let location = response.headers.raw()["location"];
            if (location)
                location = location[0];
            // console.log(URL)
            // console.log(location)
            if (location && location.includes('password')) {
                if (this.password !== "Up") {
                    if (this.password) {
                        postWebhook(SHOPIFY_PASSWORD_HOOK, this.WEBSITE, this.WEBSITE, "Password Page Up!", getTime(true));
                        if(this.WEBHOOK !== 'https://discord.com/api/webhooks/842735905341308948/XO84o30zaE-7h1y4G0dtHyF6l7JC1H4jwmF4nVrjEl7Rvc7GY-9VqNY_tj2cpsOKACnN') {
                        postWebhook(this.WEBHOOKK, this.WEBSITE, this.WEBSITE, "Password Page Up!", getTime(true));
                        }
                    }
                    this.password = "Up";
                    console.log(`[SHOPIFY] (${this.WEBSITE}) Password Page Up!`);
                }
            }
            else if (location && location.includes('checkpoint')) {
                if (this.checkpoint && this.checkpoint !== "Up") {
                    if (this.checkpoint) {
                        postWebhook(SHOPIFY_CHECKPOINT_HOOK, this.WEBSITE, this.WEBSITE, "Checkpoint Page Up!", getTime(true));
                    }
                    this.checkpoint = "Up";
                    console.log(`[SHOPIFY] (${this.WEBSITE}) Checkpoint Page Up!`);
                }
            }
            else if (this.password === "Up") {
                if (this.password) {
                    postWebhook(SHOPIFY_PASSWORD_HOOK, this.WEBSITE, this.WEBSITE, "Password Page Down!", getTime(true));
                }
                this.password = "Down";
                console.log(`[SHOPIFY] (${this.WEBSITE}) Password Page Down!`);
            }
            else if (this.checkpoint === "Up") {
                if (this.checkpoint) {
                    postWebhook(SHOPIFY_CHECKPOINT_HOOK, this.WEBSITE, this.WEBSITE, "Checkpoint Page Down!", getTime(true));
                }
                this.checkpoint = "Down";
                console.log(`[SHOPIFY] (${this.WEBSITE}) Checkpoint Page Down!`);
            }
            await helper.sleep(1000);
            this.monitorAntibot();
            return;
        } catch (err) {
            if (err.type === 'request-timeout' || err.type === 'body-timeout') {
                console.log("[SHOPIFY-ANTIBOT] Timed out: " + URL);
                this.monitorAntibot();
                return;
            }
            console.log("*********SHOPIFY-ANTIBOT-ERROR*********");
            console.log("URL: " + URL);
            console.log("Proxy: " + proxy);
            console.log(err)
            this.monitorAntibot()
        }
    }

    findProduct(id, products) {
        for (let product of products) {
            if (product.id === id)
                return product;
        }
    }
}




function getTime(utc) {
    let date = new Date()
    if (utc)
        return date.toUTCString().split(", ")[1].split("2021")[0] + date.getUTCHours() + ":" + date.getUTCMinutes() + ":" + date.getUTCSeconds() + "." + date.getUTCMilliseconds();

    return date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + "." + date.getMilliseconds();
}

module.exports = ShopifyMonitor;