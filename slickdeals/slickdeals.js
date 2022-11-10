const helper = require('../x-help/helper');
const randomUseragent = require('random-useragent');
const fs = require('fs');
const { v4 } = require('uuid');
const catagory = 'SLICKDEALS'
const version = `Slickdeals v1.0` //Site version
startMonitoring()
async function startMonitoring() {
    let sites = ['10-COUPONS', '4-FREEBIES', '9-HOTDEALS']
    for (let site of sites) {
        let PRODUCTS = []
        monitor(site, PRODUCTS)
    }
}

async function monitor(site, PRODUCTS) {
    try {
        let started = false
        let proxy = await helper.getRandomProxy() //proxy per site
        let headers = {
            'User-Agent': randomUseragent.getRandom(),
        }
        let method = 'GET'; //request method
        let req = `https://slickdeals.net/forums/forumdisplay.php?f=${site.split('-')[0]}`//request url
        let set = await helper.requestHtml(req, method, proxy, headers)
        //console.log(set.response.status)
        if (set.response.status != 200) {
            monitor(site, PRODUCTS);
            return
        }
        let root = set.html
        let products = root.querySelectorAll('.threadtitleline');
        for (let product of products) {
            let name = product.querySelector('.bp-p-dealLink.bp-c-link').textContent.replace('amp;', '').replace('&quot;', '"')
            let url = "https://slickdeals.net" + product.querySelector('.bp-p-dealLink.bp-c-link').attributes.href
            if (!PRODUCTS.length > 0) {
                started = true;
            }
            if (!PRODUCTS.includes(name)) {
                PRODUCTS.push(name)
                if (started)
                    continue
                console.log(`[time: ${new Date().toISOString()}, product: ${site.toLowerCase()}, title: ${name}]`)
                let parse = catagory + site.split('-')[1]
                let groups = await helper.dbconnect(parse)
                for (let group of groups) {
                    helper.postSlickdeals(url, name, site, group, version)
                }
            }
        }
        await helper.sleep(1000);
        monitor(site, PRODUCTS);
        return
    } catch (e) {
        //console.log(e)
        monitor(site, PRODUCTS)
        return
    }
}
