const fs = require('fs');
const crypto = require('crypto')
const fetch = require('node-fetch');
const AbortController = require('abort-controller')
const HTTPSProxyAgent = require('https-proxy-agent')
const request = require('request-promise');
const discordBot = require('./discord')
const webhook = require("webhook-discord");
const database = require('../x-help/database');
const hexToDecimal = hex => parseInt(hex, 16)
const helper = {

    sleep: function (ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    getRandomProxy: async function () {
        let WEBSHARE = await require('./webshare.json');
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
            const timeoutId = setTimeout(() => controller.abort(), 2000)
            let response = await fetch(site, { method: method, headers: headers, signal: controller.signal }, await new HTTPSProxyAgent(proxy) || null)
            clearTimeout(timeoutId)
            let json = await response.json()
            return { json, response }
        } catch (e) {
            //console.log(e)
        }
        return
    },
    requestHtml: async function (site, method, proxy, headers) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000)
            let response = await fetch(site, { method: method, headers: headers, signal: controller.signal }, await new HTTPSProxyAgent(proxy) || null)
            clearTimeout(timeoutId)
            let text = await getBodyAsText(await response)
            return { text, response }
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
    postAIO: async function (url, title, sku, price, image, sizeright, sizeleft, stock, group, site, version) {
        let color = hexToDecimal(group.color)
        let uri = url.split('/')[2]
        sizeleft = sizeleft.join('\n')
        sizeright = sizeright.join('\n')
        if (sizeright.length == 0) {
            sizeright = "-"
        }
        if (sizeleft.length == 0) {
            sizeleft = "-"
        }
        let proxy = await getRandomProxy();
        let body =
        {
            "username": group.name,
            "avatar_url": group.image,
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
                        }
                    ],
                    "thumbnail": {
                        "url": image
                    },
                    "footer": {
                        "text": `${version} | by Tachyon`,
                        "icon_url": group.image
                    },
                    "timestamp": new Date().toISOString()
                }
            ]
        }
        try {
            let response = fetch(group[site], { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }, await new HTTPSProxyAgent(proxy))
            if (await response.status !== 204)
                throw "Failed to send webhook"
        } catch (e) {
            //console.log(e)
        }
        return
    },
    discordbot: async function (CHANNEL, PRODUCTS, TABLE, monitor) {
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
                            console.log("*********NORDSTROM-SKU-ERROR*********");
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
                        embed.setTitle(`NORDSTROM Monitor`);
                        embed.setColor('#6cb3e3')
                        if (query.rows.length > 0) {
                            let SKUList = [];
                            for (let row of query.rows) {
                                SKUList.push(`${row.sku} - ${row.waittime}ms`);
                            }
                            embed.addField(`**Monitored SKUs** (${SKUList.length})`, SKUList)
                        }
                        else {
                            embed.setDescription("Not Monitoring any SKU!")
                        }
                        await msg.reply(embed);
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
async function getRandomProxy() {
    let WEBSHARE = await require('./webshare.json');
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
module.exports = helper