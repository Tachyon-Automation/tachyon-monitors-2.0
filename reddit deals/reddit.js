const helper = require('../x-help/helper');
const randomUseragent = require('random-useragent');
const fs = require('fs');
const { v4 } = require('uuid');
const catagory = 'REDDITDEALS'
const version = `Reddit v1.0` //Site version
startMonitoring()
async function startMonitoring() {
    let sites = ['FREEBIES','DEALS','BUILDAPCSALES','GAMEDEALS','SNEAKERDEALS']
    for (let site of sites) {
        let lastpost
        monitor(site, lastpost)
    }
}

async function monitor(site, lastpost) {
    try {
        let proxy = await helper.getRandomProxy() //proxy per site
        let headers = {
            'User-Agent': randomUseragent.getRandom(),
        }
        let method = 'GET'; //request method
        let req = `https://www.reddit.com/r/${site}/new/.json?abcz=${v4()}`//request url
        let set = await helper.requestJson(req, method, proxy, headers)
        console.log(set.response.status)
        if (set.response.status != 200) {
            monitor(site,lastpost);
            return
        }
        let body = await set.json //request function
        let post = body.data.children[0].data
        let title = post.title
        let url = post.url
        if(title != lastpost) {
            lastpost = title
            console.log(`[time: ${new Date().toISOString()}, product: ${site.toLowerCase()}, title: ${title}]`)
            let parse = catagory+site
            if(site == 'GAMEDEALS' || site == 'SNEAKERDEALS')
                parse = catagory+site.replace('DEALS','')
            let groups = await helper.dbconnect(parse)
            for (let group of groups) {
                helper.postReddit(url, title, site, group, version) 
            }
        }

        await helper.sleep(1000);
        monitor(site, lastpost);
        return
    } catch (e) {
        //console.log(e)
        monitor(site, lastpost)
        return
    }
}
