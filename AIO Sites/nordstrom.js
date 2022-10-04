const helper = require('../x-help/helper');
const sites = require('../x-help/sites.json');
const groups = require('../x-help/groups.json');
const database = require('../x-help/database');
const discordBot = require('../x-help/discord')
const Discord = require('discord.js');
const { v4 } = require('uuid');
const CHANNEL = '810745640837185547'
const site = 'NORDSTROM';
const version = `Nordstrom v1.0`
const table = site.toLowerCase();
discordBot.login();
let PRODUCTS = {}
startMonitoring()
async function startMonitoring() {
    let SKUList = await database.query(`SELECT * from ${table}`);
    for (let row of SKUList.rows) {
        PRODUCTS[row.sku] = {
            sku: row.sku,
            waittime: row.waittime,
            sizes: row.sizes
        }
        monitor(row.sku);
    }
    console.log(`[${site}] Monitoring all SKUs!`)
}

async function monitor(sku) {
    try {
        console.log(sku)
        let product = PRODUCTS[sku]
        if (!product)
            return;
        let proxy = helper.getRandomProxy();
        let headers = {
            'user-agent': 'Mozilla/5.0 (compatible; DotBot/1.1; http://www.opensiteexplorer.org/dotbot, help@moz.com)',
            'Accept': 'application/vnd.nord.pdp.v1+json',
            'consumer-id': 'recs-PDP_1',
        }
        let method = 'GET';
        let req = `https://www.nordstrom.com/api/style/${sku}?cache=${v4()}`
        let set = await helper.requestJson(req, method, proxy, headers)
        let body = await set.json
        if (body.errorcode == 'ERROR_STYLE_NOT_FOUND') {
            console.log('[NORDSTROM] ' + sku + ' not found!')
            return
        }
        let ids = body.skus.allIds
        if (ids.length < 0) {
            await helper.sleep(1000)
            monitor(sku)
            return
        }
        let inStock = false;
        let title = body.productTitle
        let parse = body.defaultGalleryMedia.styleMediaId
        let image = 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829'
        try { image = body.styleMedia.byId[parse].imageMediaUri.smallDesktop }
        catch (e) { }
        let stock = 0
        let price = ''
        let url = `https://www.nordstrom.com/s/tachyon/${sku}`
        let sizes = []
        let query = await database.query(`SELECT * from ${table} where sku='${sku}'`);
        let oldSizeList = await query.rows[0].sizes
        let sizeList = []
        let oosid = body.soldOutSkus.byId
        let oossku = body.soldOutSkus.allIds
        let inid = body.skus.byId
        let insku = body.skus.allIds
        let vars = Object.assign(oosid, inid)
        let skus = Object.assign(oossku, insku)
        for (let id of skus) {
            if (vars[id].isAvailable === true || vars[id].totalQuantityAvailable > 0) {
                sizes += `${vars[id].sizeId} (${vars[id].totalQuantityAvailable}) - ${vars[id].rmsSkuId}\n`
                stock += Number(vars[id].totalQuantityAvailable)
                sizeList.push(vars[id].rmsSkuId);
                price = vars[id].displayPrice
                if (!oldSizeList.includes(vars[id].rmsSkuId))
                    inStock = true;
            }
        }
        if (inStock) {
            inStock = false;
            let sizeright = sizes.split('\n')
            let sizeleft = sizeright.splice(0, Math.floor(sizeright.length / 2))
            await database.query(`update ${table} set sizes='${JSON.stringify(sizeList)}' where sku='${sku}'`);
            for (let group of sites[site]) {
                await helper.postAIO(url, title, sku, price, image, sizeright, sizeleft, stock, groups[group], site, version)
            }
    }
        await helper.sleep(product.waittime);
        monitor(sku);
        return
    } catch (e) {
        console.log(e)
        monitor(sku)
        return
    }
}
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
            let query = await database.query(`SELECT * from ${DATABASE_TABLE} where sku='${sku}'`);
            if (query.rows.length > 0) {
                PRODUCTS[sku] = null
                await database.query(`delete from ${table} where sku='${sku}'`);
                discordBot.sendChannelMessage(msg.channel.id, `No longer monitoring SKU '${sku}'!`);
                return;
            }
            PRODUCTS[sku] = {
                sku: sku,
                waittime: waitTime,
                sizes: ''
            }
            await database.query(`insert into ${table}(sku, sizes, waittime) values('${sku}', '', ${waitTime})`);
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
                discordBot.sendChannelMessage(msg.channel.id, `Wrong Format`);
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
                    let query = await database.query(`SELECT * from ${table} where sku='${sku}'`);
                    if (query.rows.length > 0) {
                        PRODUCTS[sku] = null
                        database.query(`delete from ${table} where sku='${sku}'`);
                        notMonitoringSKUs.push(sku);
                        continue;
                    }
                    PRODUCTS[sku] = {
                        sku: sku,
                        waittime: waitTime,
                        sizes: ''
                    }
                    database.query(`insert into ${table}(sku, sizes, waittime) values('${sku}', '', ${waitTime})`);
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
                let query = await database.query(`SELECT * from ${table}`);
                const embed = new Discord.MessageEmbed();
                embed.setTitle(`${site} Monitor`);
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
                msg.reply(embed);
            }
        }
    });


