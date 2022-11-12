const helper = require('../x-help/helper');
const discordBot = require('../x-help/discord')
const regions = require('./snkrs.json')
const Discord = require('discord.js');
const moment = require('moment');
const { v4 } = require('uuid');
const catagory = 'SNKRS'
const version = `Snkrs v1.0` //Site version
discordBot.login();
startMonitoring()
async function startMonitoring() {
    for (let region of regions) {
        monitor(region)
    }

}
console.log(`[${catagory}] Monitoring all SKUs!`)

async function monitor(region, juststarted = true) {
    try {
        let proxy = await helper.getRandomProxy(); //proxy per site
        let headers = {
            'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="90", "Google Chrome";v="90"',
            'sec-ch-ua-mobile': '?0',
            'Upgrade-Insecure-Requests': '1',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-User': '?1',
            'Sec-Fetch-Dest': 'document',
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'en-US,en;q=0.9',
            "Connection": 'keep-alive',
        }
        let method = 'GET';
        let oldProducts = []
        let req = `https://api.nike.com/product_feed/threads/v2/?anchor=0&count=60&filter=marketplace(${region.MARKETPLACE})&filter=language(${region.LANGUAGE})&filter=channelId(${region.CHANNELID})&filter=exclusiveAccess(true,false)&fields=active,id,lastFetchTime,productInfo,${v4()}`//request url
        let set = await helper.requestJson(req, method, proxy, headers)
        if (set.response.status != 200) {
            monitor(region)
            return
        }
        let body = await set.json
        for (let product of body.objects) {
            if (!product.productInfo)
                continue;
            let productInfo = product.productInfo[0]
            if (!productInfo.launchView)
                continue;
            let sku = productInfo.productContent.globalPid
            if (oldProducts.includes(sku))
                continue;
            if (juststarted)
                continue
            let title = productInfo.productContent.fullTitle + " - " + productInfo.productContent.colorDescription;
            let price = productInfo.merchPrice.currentPrice + " (" + productInfo.merchPrice.currency + ")";
            let image = productInfo.imageUrls.productImageUrl;
            let releaseType = productInfo.launchView.method;
            let releaseDateFormatted = moment(productInfo.launchView.startEntryDate);
            releaseDateFormatted = releaseDateFormatted.utc().format('YYYY-MM-DD') + " " + releaseDateFormatted.utc().format('HH:mm:ss') + " (UTC)"
            let url = `https://nike.com/${region.MARKETPLACE === 'us' ? '' : region.MARKETPLACE.toLowerCase()}/launch/t/${productInfo.productContent.slug}`
            let sizes = '';
            if (productInfo.availableSkus) {
                for (let size of productInfo.availableSkus) {
                    for (let size2 of productInfo.skus) {
                        if (size2.id === size.id) {
                            sizes += `${size2.nikeSize} [${size.level}]\n`
                        }
                    }
                }
            }
            oldProducts.push(sku)
            console.log(`[time: ${new Date().toISOString()}, product: ${sku}, title: ${title}]`)
            let sizeright = sizes.split('\n')
            let sizeleft = sizeright.splice(0, Math.floor(sizeright.length / 2))
            let sites = await helper.dbconnect(catagory + region.MARKETPLACE)
            let uri = `https://nike.com/${region.MARKETPLACE === 'us' ? '' : region.MARKETPLACE.toLowerCase()}`
            for (let group of sites) {
                helper.postSnkrs(url, title, sku, price, image, sizeright, sizeleft, releaseType, group, version, uri)
            }
        }
        juststarted = false
        await helper.sleep(5000);
        monitor(region);
        return
    } catch (e) {
        console.log(e)
        monitor(region)
        return
    }
}