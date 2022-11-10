const helper = require('../x-help/helper');
const groups = require('../x-help/groups.json');
const database = require('../x-help/database');
const discordBot = require('../x-help/discord')
const randomUseragent = require('random-useragent');
const fs = require('fs');
const HTMLParser = require('node-html-parser');
const Discord = require('discord.js');
const { v4 } = require('uuid');
const CHANNEL = '881045892591939624' //channel id
const site = 'BJS'; //site name
const catagory = 'RETAIL'
const version = `BJS v1.0` //Site version
const table = site.toLowerCase();
discordBot.login();
let PRODUCTS = {}
startMonitoring()
async function startMonitoring() {
    let sites = ['FREEBIES','DEALS','BUILDAPCSALES','GAMEDEALS','SNEAKERDEALS']
    for (let site of sites) {
        monitor(site)
    }
}

async function monitor(site) {
    try {
        let proxy = await helper.getRandomProxy() //proxy per site
        let headers = {
            'User-Agent': randomUseragent.getRandom(),
        }
        let method = 'GET'; //request method
        let req = `https://www.reddit.com/r/deals/new/.json?abcz=${v4()}`//request url
        let set = await helper.requestJson(req, method, proxy, headers)
        console.log(set.response.status)
        if (set.response.status != 200) {
            monitor(sku);
            return
        }
        let body = await set.json //request function
        let post = body.data.children[0].data
        let title = post.title
        let url = post.url
        
        await helper.sleep(1000);
        monitor(site);
        return
    } catch (e) {
        //console.log(e)
        monitor(site)
        return
    }
}
