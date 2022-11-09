const fs = require('fs');
const crypto = require('crypto')
const fetch = require('node-fetch');
const AbortController = require('abort-controller')
const HTTPSProxyAgent = require('https-proxy-agent')
const HTMLParser = require('node-html-parser');
const request = require('request-promise');
const discordBot = require('./discord')
const Discord = require('discord.js');
const webhook = require("webhook-discord");
const database = require('../x-help/database');
const hexToDecimal = hex => parseInt(hex, 16)
const Site = require('./modelsite')
const group = require('./modelgroup')
const mongoose = require('mongoose')
const { Schema } = mongoose
const MONGODB_URI = 'mongodb+srv://tach_admins:0NbLD8hOkjtcHwMy@tachyon.8ameb.mongodb.net/tachyonMain'
const helper = {
    dbconnect: async function (s) {
        await mongoose.connect(MONGODB_URI)
        let sites = await Site.find({ name: s }).populate('group')
        return sites
    },
    getHooks: async function () {
        const hooks = mongoose.model('webhooks', { name: String })
        return hooks
    },

    sleep: function (ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    getRandomProxy: async function () {
        let WEBSHARE = await require('./webshare.json');
        return WEBSHARE[Math.floor(Math.random() * (0 - WEBSHARE.length)) + WEBSHARE.length]
    },
    getRandomProxy2: async function () {
        let WEBSHARE = await require('./oculus.json');
        return WEBSHARE[Math.floor(Math.random() * (0 - WEBSHARE.length)) + WEBSHARE.length]
    },

    getUSARotatingProxy: function () {
        return 'http://global.rotating.proxyrack.net:9000';
    },

    getMixedRotatingProxy: function () {
        return 'http://global.rotating.proxyrack.net:9000'
    },

    getBodyAsText(response, ms = 1000) {
        let timeout = new Promise((resolve, reject) => {
            let id = setTimeout(() => {
                clearTimeout(id);
                reject('helper.js, Response to Text conversion timed out in ' + ms + 'ms.')
            }, ms)
        })

        return Promise.race([
            response.text(),
            timeout
        ])
    },
    requestJson: async function (site, method, proxy, headers) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000)
            let response = await fetch(site, { method: method, headers: headers, signal: controller.signal, agent: await new HTTPSProxyAgent(proxy) })
            let json = await response.json()
            clearTimeout(timeoutId)
            return { json, response }
        } catch (e) {
            //console.log(e)
        }
        return
    },
    requestJson3: async function (site, method, proxy, headers, body) {
        try {
            //console.log(body)
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000)
            let response = await fetch(site, { method: method, headers: headers, signal: controller.signal, agent: await new HTTPSProxyAgent(proxy), body: JSON.stringify(body) })
            let json = await response.json()
            clearTimeout(timeoutId)
            return { json, response }
        } catch (e) {
            //console.log(e)
        }
        return
    },
    requestBody: async function (site, method, proxy, headers) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000)
            let response = await fetch(site, { method: method, headers: headers, signal: controller.signal, agent: await new HTTPSProxyAgent(proxy) })
            resp = await getBodyAsText(response)
            clearTimeout(timeoutId)
            return { resp, response }
        } catch (e) {
            //console.log(e)
            return
        }
    },
    requestJson2: async function (site, method, headers) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000)
            let response = await fetch(site, { method: method, headers: headers, signal: controller.signal })
            console.log(response)
            let json = await response.json()
            clearTimeout(timeoutId)
            return { json, response }
        } catch (e) {
            //console.log(e)
        }
        return
    },
    requestHtml: async function (site, method, proxy, headers) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000)
            let response = await fetch(site, { method: method, headers: headers, signal: controller.signal, agent: await new HTTPSProxyAgent(proxy) })
            let text = await getBodyAsText(await response)
            let html = HTMLParser.parse(await text)
            clearTimeout(timeoutId)
            return { html, response, text }
        } catch (e) {
            //console.log(e)
        }
        return
    },
    posElephentNord: async function (sizes, sku, title, price, image) {
        const options = {
            method: 'POST',
            url: 'https://cloudapii.herokuapp.com/bdgfhbdfghbtb',
            headers: { 'Content-Type': 'application/json' },
            body: {
                offerid: sizes,
                sitesku: sku,
                title: title,
                price: price,
                image: image
            },
            json: true
        };
        try {
            request(options)
            //console.log("success")
        } catch (e) {
            //console.log(e)
        }
    },
    posElephentOrca: async function (sizes, sku, title, price, image) {
        await sleep(300)
        const options = {
            method: 'POST',
            url: 'http://51.81.82.199:5000/sendRestock',
            headers: { 'Content-Type': 'application/json' },
            body: {
                offerid: sizes,
                sitesku: sku,
                title: title,
                price: price,
                image: image
            },
            json: true
        };
        try {
            request(options)
            console.log("success")
        } catch (e) {
            console.log(e)
        }
    },
    posElephentHibbett: async function (sku, title, image) {
        const options = {
            method: 'POST',
            url: 'https://cloudapii.herokuapp.com/bdgfhbdfghbtb',
            headers: { 'Content-Type': 'application/json' },
            body: {
                mode: '1',
                sku: sku,
                title: title,
                picture: image,
            },
            json: true
        };
        try {
            request(options)
            //console.log("success")
        } catch (e) {
            //console.log(e)
        }
        request(options, function (error) {
            if (error) throw new Error(error);
        });
    },
    postAIO: async function (url, title, sku, price, image, sizeright, sizeleft, stock, site, version, qt, links) {
        let color = hexToDecimal(site.group.embed.color.replace('#', ''))
        let uri = url.split('/')[2]
        sizeleft = sizeleft.join('\n')
        sizeright = sizeright.join('\n')
        if (sizeright.length == 0) {
            sizeright = "-"
        }
        if (sizeleft.length == 0) {
            sizeleft = "-"
        }
        let proxy = await getRandomProxy2();
        let body =
        {
            "username": site.group.name,
            "avatar_url": site.group.embed.image,
            "content": null,
            "embeds": [
                {
                    "author": {
                        "name": `https://${uri}`,
                        "url": `https://${uri}`,
                    },
                    "title": title,
                    "url": url,
                    "color": color,
                    "fields": [
                        {
                            "name": "**Stock**",
                            "value": stock + "+",
                            "inline": true
                        },
                        {
                            "name": "**Price**",
                            "value": price,
                            "inline": true
                        },
                        {
                            "name": "**PID**",
                            "value": sku,
                            "inline": true
                        },
                        {
                            "name": "**Sizes**",
                            "value": sizeleft,
                            "inline": true
                        },
                        {
                            "name": "**Sizes**",
                            "value": sizeright,
                            "inline": true
                        },
                        {
                            "name": "**QT**",
                            "value": qt,
                            "inline": true
                        },
                        {
                            "name": "**Links**",
                            "value": links,
                            "inline": true
                        },
                    ],
                    "thumbnail": {
                        "url": image
                    },
                    "footer": {
                        "text": `${version} | ${site.group.embed.footer} by Tachyon `,
                        "icon_url": site.group.embed.image
                    },
                    "timestamp": new Date().toISOString()
                }
            ]
        }
        try {
            let response = await fetch(site.webhook, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), agent: await new HTTPSProxyAgent(proxy) })
            if (await response.status !== 204)
                throw "Failed to send webhook"
        } catch (e) {
            //onsole.log(e)
        }
        return
    },
    postPassword: async function (site, site, status, version) {
        let color = hexToDecimal(site.group.embed.color.replace('#', ''))
        let proxy = await getRandomProxy2();
        let body =
        {
            "username": site.group.name,
            "avatar_url": site.group.embed.image,
            "content": null,
            "embeds": [
                {
                    "author": {
                        "name": site,
                        "url": site,
                    },
                    "title": status,
                    "url": site,
                    "color": color,
                    "footer": {
                        "text": `${version} | ${site.group.embed.footer} by Tachyon `,
                        "icon_url": site.group.embed.image
                    },
                    "timestamp": new Date().toISOString()
                }
            ]
        }
        try {
            let response = await fetch(site.webhook, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), agent: await new HTTPSProxyAgent(proxy) })
            if (await response.status !== 204)
                throw "Failed to send webhook"
        } catch (e) {
            //onsole.log(e)
        }
        return
    },
    postShopify: async function (url, title, price, type, image, sizeright, sizeleft, stock, site, version, qt, links) {
        let color = hexToDecimal(site.group.embed.color.replace('#', ''))
        let uri = url.split('/')[2]
        sizeleft = sizeleft.join('\n')
        sizeright = sizeright.join('\n')
        if (sizeright.length == 0) {
            sizeright = "-"
        }
        if (sizeleft.length == 0) {
            sizeleft = "-"
        }
        let proxy = await getRandomProxy2();
        let body =
        {
            "username": site.group.name,
            "avatar_url": site.group.embed.image,
            "content": null,
            "embeds": [
                {
                    "author": {
                        "name": `https://${uri}`,
                        "url": `https://${uri}`,
                    },
                    "title": title,
                    "url": url,
                    "color": color,
                    "fields": [
                        {
                            "name": "**Type**",
                            "value": type,
                            "inline": true
                        },
                        {
                            "name": "**Price**",
                            "value": price,
                            "inline": true
                        },
                        {
                            "name": "**Stock**",
                            "value": stock + "+",
                            "inline": true
                        },
                        {
                            "name": "**Sizes**",
                            "value": sizeleft,
                            "inline": true
                        },
                        {
                            "name": "**Sizes**",
                            "value": sizeright,
                            "inline": true
                        },
                        {
                            "name": "**QT**",
                            "value": qt,
                            "inline": true
                        },
                        {
                            "name": "**Links**",
                            "value": links,
                            "inline": true
                        },
                    ],
                    "thumbnail": {
                        "url": image
                    },
                    "footer": {
                        "text": `${version} | ${site.group.embed.footer} by Tachyon `,
                        "icon_url": site.group.embed.image
                    },
                    "timestamp": new Date().toISOString()
                }
            ]
        }
        try {
            let response = await fetch(site.webhook, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), agent: await new HTTPSProxyAgent(proxy) })
            if (await response.status !== 204)
                throw "Failed to send webhook"
        } catch (e) {
            //console.log(e)
        }
        return
    },
    postAmazon: async function (url, title, sku, price, image, stock, offerid, site, version, qt, links) {
        let color = hexToDecimal(site.group.embed.color.replace('#', ''))
        let uri = url.split('/')[2]
        let proxy = await getRandomProxy2();
        let body =
        {
            "username": site.group.name,
            "avatar_url": site.group.embed.image,
            "content": null,
            "embeds": [
                {
                    "author": {
                        "name": `https://${uri}`,
                        "url": `https://${uri}`,
                    },
                    "title": title,
                    "url": url,
                    "color": color,
                    "fields": [
                        {
                            "name": "**Stock**",
                            "value": stock + "+",
                            "inline": true
                        },
                        {
                            "name": "**Price**",
                            "value": price,
                            "inline": true
                        },
                        {
                            "name": "**PID**",
                            "value": sku,
                            "inline": true
                        },
                        {
                            "name": "**Offer ID**",
                            "value": '```' + offerid + '```',
                            "inline": false
                        },
                        {
                            "name": "**Links**",
                            "value": links,
                            "inline": true
                        },
                        {
                            "name": "**QT**",
                            "value": qt,
                            "inline": true
                        },
                    ],
                    "thumbnail": {
                        "url": image
                    },
                    "footer": {
                        "text": `${version} | ${site.group.embed.footer} by Tachyon `,
                        "icon_url": site.group.embed.image
                    },
                    "timestamp": new Date().toISOString()
                }
            ]
        }
        try {
            let response = await fetch(site.webhook, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), agent: await new HTTPSProxyAgent(proxy) })
            if (await response.status !== 204)
                throw "Failed to send webhook"
        } catch (e) {
            console.log(e)
        }
        return
    },
    postRetail: async function (url, title, sku, price, image, stock, site, version, qt, links) {
        let color = hexToDecimal(site.group.embed.color.replace('#', ''))
        let uri = url.split('/')[2]
        let proxy = await getRandomProxy2();
        let body =
        {
            "username": site.group.name,
            "avatar_url": site.group.embed.image,
            "content": null,
            "embeds": [
                {
                    "author": {
                        "name": `https://${uri}`,
                        "url": `https://${uri}`,
                    },
                    "title": title,
                    "url": url,
                    "color": color,
                    "fields": [
                        {
                            "name": "**Stock**",
                            "value": stock + "+",
                            "inline": true
                        },
                        {
                            "name": "**Price**",
                            "value": price,
                            "inline": true
                        },
                        {
                            "name": "**PID**",
                            "value": sku,
                            "inline": true
                        },
                        {
                            "name": "**Links**",
                            "value": links,
                            "inline": true
                        },
                        {
                            "name": "**QT**",
                            "value": qt,
                            "inline": true
                        },
                    ],
                    "thumbnail": {
                        "url": image
                    },
                    "footer": {
                        "text": `${version} | ${site.group.embed.footer} by Tachyon `,
                        "icon_url": site.group.embed.image
                    },
                    "timestamp": new Date().toISOString()
                }
            ]
        }
        try {
            let response = await fetch(site.webhook, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), agent: await new HTTPSProxyAgent(proxy) })
            if (await response.status !== 204)
                throw "Failed to send webhook"
        } catch (e) {
            //console.log(e)
        }
        return
    },
    discordbot: async function (CHANNEL, PRODUCTS, TABLE, monitor, SITE) {
        try {
            discordBot.getClient.on('message', async function (msg) {
                if (msg.channel.id !== CHANNEL)
                    return;

                if (msg.content.startsWith(discordBot.commandPrefix + 'monitorSKU')) {
                    let args = msg.content.split(" ");
                    if (args.length !== 3) {
                        discordBot.sendChannelMessage(msg.channel.id, "Command: !monitorSKU <SKU> <waitTime>");
                        return;
                    }
                    let sku = args[1];
                    let waitTime = args[2];
                    let query = await database.query(`SELECT * from ${TABLE} where sku='${sku}'`);
                    if (query.rows.length > 0) {
                        PRODUCTS[sku] = null
                        await database.query(`delete from ${TABLE} where sku='${sku}'`);
                        discordBot.sendChannelMessage(msg.channel.id, `No longer monitoring SKU '${sku}'!`);
                        return;
                    }
                    PRODUCTS[sku] = {
                        sku: sku,
                        waittime: waitTime,
                        sizes: ''
                    }
                    database.query(`insert into ${TABLE}(sku, sizes, waittime) values('${sku}', '', ${waitTime})`);
                    monitor(sku);
                    // console.log("added " + sku)
                    discordBot.sendChannelMessage(msg.channel.id, `Started monitoring SKU '${sku}'!  (waitTime ${waitTime})`);
                }
                if (msg.content.startsWith(discordBot.commandPrefix + 'monitorMultipleSKUs')) {
                    let splits = msg.content.split(" ")
                    if (splits.length < 2) {
                        discordBot.sendChannelMessage(msg.channel.id, `Wrong format douchebag`);
                        return;
                    }
                    let args = splits[1].split('\n');
                    if (!args || args.length < 2) {
                        discordBot.sendChannelMessage(msg.channel.id, `Wrong format douchebag`);
                        return;
                    }
                    // console.log(args)
                    let waitTime = parseInt(args[0].trim());
                    let skus = args.splice(1);
                    let monitoringSKUs = [];
                    let notMonitoringSKUs = [];
                    let errorSKUs = [];
                    let tempSKUs = [];
                    for (let sku of skus) {
                        if (!tempSKUs.includes(sku))
                            tempSKUs.push(sku);
                    }
                    skus = tempSKUs;
                    // console.log(skus);
                    for (let sku of skus) {
                        sku = sku.trim();
                        // console.log(sku);
                        try {
                            if (sku === '')
                                continue;
                            let query = await database.query(`SELECT * from ${TABLE} where sku='${sku}'`);
                            if (query.rows.length > 0) {
                                PRODUCTS[sku] = null
                                await database.query(`delete from ${TABLE} where sku='${sku}'`);
                                notMonitoringSKUs.push(sku);
                                continue;
                            }
                            PRODUCTS[sku] = {
                                sku: sku,
                                waittime: waitTime,
                                sizes: ''
                            }
                            await database.query(`insert into ${TABLE}(sku, sizes, waittime) values('${sku}', '', ${waitTime})`);
                            monitor(sku);
                            // console.log("added " + sku)
                            monitoringSKUs.push(sku);
                        }
                        catch (err) {
                            errorSKUs.push(sku);
                            console.log(`*********${SITE}-SKU-ERROR*********`);
                            console.log("SKU: " + sku);
                            console.log(err);
                        }
                    }
                    // console.log(notMonitoringSKUs.length)
                    const monitoringMessage = new Discord.MessageEmbed()
                        .setColor('#6cb3e3')
                        .setTitle('Now monitoring')
                        .setDescription(monitoringSKUs.join('\n'))
                    if (monitoringSKUs.length > 0) msg.reply(monitoringMessage);
                    const notMonitoringMessage = new Discord.MessageEmbed()
                        .setColor('#6cb3e3')
                        .setTitle('NOW NOT monitoring')
                        .setDescription(notMonitoringSKUs.join('\n'))
                    if (notMonitoringSKUs.length > 0) msg.reply(notMonitoringMessage);
                    const monitoringErrorMessage = new Discord.MessageEmbed()
                        .setColor('#6cb3e3')
                        .setTitle('ERROR monitoring')
                        .setDescription(errorSKUs.join('\n'))
                    if (errorSKUs.length > 0) msg.reply(monitoringErrorMessage);
                }
                if (msg.content.startsWith(discordBot.commandPrefix + 'monitorList')) {
                    if (msg.channel.id === CHANNEL) {
                        let query = await database.query(`SELECT * from ${TABLE}`);
                        const embed = new Discord.MessageEmbed();
                        embed.setTitle(`${SITE} Monitor`);
                        embed.setColor('#6cb3e3')
                        if (query.rows.length > 0) {
                            let SKUList = [];
                            for (let row of query.rows) {
                                SKUList.push(`${row.sku}`);
                            }
                            embed.addField(`**Monitored SKUs** (${SKUList.length})`, SKUList)
                        }
                        else {
                            embed.setDescription("Not Monitoring any SKU!")
                        }
                        msg.reply(embed);
                    }
                }

                if (msg.content.startsWith(discordBot.commandPrefix + 'stats')) {
                    discordBot.sendChannelMessage(msg.channel.id, `Successful Requests - ${totalSuccess}/${totalRequests}  [${Math.round(totalSuccess / totalRequests * 10000) / 100}%]`);
                }
            });
        } catch (e) {
            console.log(e)
        }
    }
}
async function getRandomProxy2() {
    let WEBSHARE = await require('./oculus.json');
    return WEBSHARE[Math.floor(Math.random() * (0 - WEBSHARE.length)) + WEBSHARE.length]
}
async function getBodyAsText(response, ms = 1000) {
    let timeout = new Promise((resolve, reject) => {
        let id = setTimeout(() => {
            clearTimeout(id);
            reject('helper.js, Response to Text conversion timed out in ' + ms + 'ms.')
        }, ms)
    })

    return Promise.race([
        response.text(),
        timeout
    ])
}
async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
module.exports = helper