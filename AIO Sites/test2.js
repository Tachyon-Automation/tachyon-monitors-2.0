const helper = require('../x-help/helper');
const groups = require('../x-help/groups.json');
const database = require('../x-help/database');
const discordBot = require('../x-help/discord')
const randomUseragent = require('random-useragent');
const { v4 } = require('uuid');
const genCookie = require('../x-help/pxgen');
let PRODUCTS = {}
let headers
let count = 0
let header
for (let i = 0; i < 40; i++) {
    genheadersd()
}
headers = [{
    'X-FORWARDED-FOR': '50.206.43.38',
    'user-agent': randomUseragent.getRandom(),
    'X-PX-AUTHORIZATION': `3:${v4()}`,
    [v4()]: v4(),
}]
async function genheadersd() {
    try {
        let method = 'GET';
        let proxy = await helper.getRandomProxy2();
        var ip = (Math.floor(Math.random() * 255) + 1) + "." + (Math.floor(Math.random() * 255)) + "." + (Math.floor(Math.random() * 255)) + "." + (Math.floor(Math.random() * 255));
        let cookie = await genCookie()
        let head = {
            'user-agent': 'Hibbett | CG/6.0.0 (com.hibbett.hibbett-sports; build:10723; iOS 16.0.0) Alamofire/5.0.0-rc.3',
            'X-FORWARDED-FOR': ip,
            'x-px-bypass-reason': "The%20certificate%20for%20this%20server%20is%20invalid.%20You%20might%20be%20connecting%20to%20a%20server%20that%20is%20pretending%20to%20be%20%E2%80%9Cpx-conf.perimeterx.net%E2%80%9D%20which%20could%20put%20your%20confidential%20information%20at%20risk.",
            'X-PX-AUTHORIZATION': `3:${cookie}`,
            //'cookie': `_px3=${v4()};_pxhd=${v4()}` 
        }
        let rando = Math.floor(Math.random() * 25)
        for (let i = 0; i < rando; i++) {
            head[v4()] = v4()
        }
        
        //console.log(head)

        let req2 = `https://hibbett-mobileapi.prolific.io/ecommerce/products/E7496?customerId=${v4()}`//request url
        let set2 = await helper.requestJson(req2, method, proxy, head) //request function
        console.log(set2.response.status)
        if (set2.response.status != 200) {
            genheadersd()
            return
        }
        //Custom error handling
        console.log(cookie)
        if (headers.length < 200) {
            headers.push(head)
        }
        genheadersd()
        return
    } catch (e) {
        //console.log(e)
        genheadersd()
        return
    }
}
//start()
async function start() {
    try {
        let method = 'GET';
        let proxy = await helper.getRandomProxy2();
        console.log(headers)
        let req = `https://hibbett-mobileapi.prolific.io/ecommerce/cart/create`//request url
        let set = await helper.requestJson(req, method, proxy, headers[0]) //request function
        let body = await set.json
        if (set.response.status != 200) {
            count++
            if (count > 5) {
                header = headers.shift()
                count = 0
            }
            start()
            return
        }
        console.log(body)
        start()
        return
    } catch (e) {
        console.log(e)
        start()
        return
    }
}