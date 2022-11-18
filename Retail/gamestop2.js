const helper = require('../x-help/helper');
const groups = require('../x-help/groups.json');
const database = require('../x-help/database');
const discordBot = require('../x-help/discord')
const randomUseragent = require('random-useragent');
const fs = require('fs');
const HTMLParser = require('node-html-parser');
const Discord = require('discord.js');
const { v4 } = require('uuid');
const CHANNEL = '810936162410692659' //channel id
const site = 'GAMESTOPUS'; //site name
const catagory = 'RETAIL'
const version = `Gamestop US v1.0` //Site version
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
        monitor(row.sku)
    }
    console.log(`[${site}] Monitoring all SKUs!`)
}

async function monitor(sku) {
    try {
        let product = PRODUCTS[sku]
        if (!product)
            return;
        var ip = (Math.floor(Math.random() * 255) + 1) + "." + (Math.floor(Math.random() * 255)) + "." + (Math.floor(Math.random() * 255)) + "." + (Math.floor(Math.random() * 255));
        let proxy = await helper.getRandomProxy() //proxy per site
        let headers = {
            'User-Agent': 'GameStop_iOS/500.2.0 (iOS 15.4.1)',
            'X-FORWARDED-FOR': ip,
            'Authorization': 'Bearer eyJraWQiOiJaT3dmc3IzQXFWT2NIbkVfUVRrbHJyZ3U3WWw1ZVNiUEdqdDFWV3R6SllzIiwiYWxnIjoiUlMyNTYifQ.eyJzdWIiOiJhY2tiYzF4cmFId3VvUm11Y1pscVlZbDB3MyIsImNsaWVudC1pZCI6Im9tbmktd2ViIiwicm9sZXMiOlsiR1RfVVNSIl0sInNmY2Mtand0IjoiZXlKMlpYSWlPaUl4TGpBaUxDSnFhM1VpT2lKemJHRnpMM0J5YjJRdlltTndhMTl3Y21RaUxDSnJhV1FpT2lKa1pUazRaR05tT1MxbE1HVm1MVFEwWTJJdE9XRmlZUzAxWWpVeVpHTXhZelk1TmpFaUxDSjBlWEFpT2lKcWQzUWlMQ0pqYkhZaU9pSktNaTR6TGpRaUxDSmhiR2NpT2lKRlV6STFOaUo5LmV5SmhkWFFpT2lKSFZVbEVJaXdpYzJOd0lqb2liblZzYkNCelptTmpMbk5vYjNCd1pYSXRZMkYwWldkdmNtbGxjeUJ6Wm1OakxuTm9iM0J3WlhJdFkzVnpkRzl0WlhKekxuSmxaMmx6ZEdWeUlITm1ZMk11YzJodmNIQmxjaTFqZFhOMGIyMWxjbk11Ykc5bmFXNGdjMlpqWXk1emFHOXdjR1Z5TFcxNVlXTmpiM1Z1ZENCelptTmpMbk5vYjNCd1pYSXRiWGxoWTJOdmRXNTBMbkozSUhObVkyTXVjMmh2Y0hCbGNpMXRlV0ZqWTI5MWJuUXVZV1JrY21WemMyVnpMbkozSUhObVkyTXVjMmh2Y0hCbGNpMXRlV0ZqWTI5MWJuUXVZV1JrY21WemMyVnpJSE5tWTJNdWMyaHZjSEJsY2kxdGVXRmpZMjkxYm5RdVltRnphMlYwY3lCelptTmpMbk5vYjNCd1pYSXRiWGxoWTJOdmRXNTBMbTl5WkdWeWN5QnpabU5qTG5Ob2IzQndaWEl0YlhsaFkyTnZkVzUwTG5CaGVXMWxiblJwYm5OMGNuVnRaVzUwY3k1eWR5QnpabU5qTG5Ob2IzQndaWEl0YlhsaFkyTnZkVzUwTG5CaGVXMWxiblJwYm5OMGNuVnRaVzUwY3lCelptTmpMbk5vYjNCd1pYSXRiWGxoWTJOdmRXNTBMbkJ5YjJSMVkzUnNhWE4wY3lCelptTmpMbk5vYjNCd1pYSXRiWGxoWTJOdmRXNTBMbkJ5YjJSMVkzUnNhWE4wY3k1eWR5QnpabU5qTG5Ob2IzQndaWEl0Y0hKdlpIVmpkR3hwYzNSeklITm1ZMk11YzJodmNIQmxjaTF3Y205dGIzUnBiMjV6SUhObVkyTXVjMmh2Y0hCbGNpMW5hV1owTFdObGNuUnBabWxqWVhSbGN5QnpabU5qTG5Ob2IzQndaWEl0Y0hKdlpIVmpkQzF6WldGeVkyZ2djMlpqWXk1emFHOXdjR1Z5TFdKaGMydGxkSE10YjNKa1pYSnpMbkozSUhObVkyTXVjMmh2Y0hCbGNpMWlZWE5yWlhSekxXOXlaR1Z5Y3lCelptTmpMbk5vYjNCd1pYSXRjSEp2WkhWamRITWlMQ0p6ZFdJaU9pSmpZeTF6YkdGek9qcGlZM0JyWDNCeVpEbzZjMk5wWkRveE5tSmhORFl5TlMwMlkySmhMVFEyTkdVdFltUmhaaTFtWldGak1qY3pNMlExTlRZNk9uVnphV1E2TURFM1pUQmpZV1F0T1dFMU5TMDBOMlk1TFdGaE1EUXRabUV5TTJRd1ptTXhaV0l5SWl3aVkzUjRJam9pYzJ4aGN5SXNJbWx6Y3lJNkluTnNZWE12Y0hKdlpDOWlZM0JyWDNCeVpDSXNJbWx6ZENJNk1Td2lZWFZrSWpvaVkyOXRiV1Z5WTJWamJHOTFaQzl3Y205a0wySmpjR3RmY0hKa0lpd2libUptSWpveE5qWTROelEyTnpRM0xDSnpkSGtpT2lKVmMyVnlJaXdpYVhOaUlqb2lkV2xrYnpwemJHRnpPanAxY0c0NlIzVmxjM1E2T25WcFpHNDZSM1ZsYzNRZ1ZYTmxjam82WjJOcFpEcGhZMnRpWXpGNGNtRklkM1Z2VW0xMVkxcHNjVmxaYkRCM016bzZZMmhwWkRwdWRXeHNJaXdpWlhod0lqb3hOalk0TnpRNE5UYzNMQ0pwWVhRaU9qRTJOamczTkRZM056Y3NJbXAwYVNJNklrTXlReTB4TmpjM05EUTNORFk1TURJME1USXlNRGN6T0RFMU16Z3pOVEl6TlRVNE9USTNORFE0SW4wLnpoT0N0RlNnbWV5aUFvdl83V2xwcklwdDRvVWFuc1RVWjd6azV3bmFOSTJKRHNBWkhyenRVejJnQ0d2V0dzMkVlNDZOVGpJVXVjaGJhZGRSc3NFQUtRIiwibWVtYmVyc2hpcC10aWVyIjoidW5rbm93biIsImF1ZCI6ImdhbWVzdG9wLmNvbSIsImlzcyI6Imh0dHBzOi8vYXBpLmdhbWVzdG9wLmNvbSIsImlhdCI6MTY2ODc0Njc3NywiZXhwIjoxNjY4NzQ4NTc3fQ.fnReRYTwCcxQHcPJHMK9Kc2yjvHXzyOkwx9THBnVG6pNCAT-iNwVs4O5ha1SpEbrn80Iq5MCVKPfpUXrD9JCn7Frfx_RpJU181zgIqpXT4PN41Aq7TZih_QilCXlhR4rcKyBly92L1TD5tFry7w0AiJpNcKjWtLda3ZpiMcK4fxxccE5bCB_QvTnkDvSoC93kGmE8IUM2E4WPx7zinB2YTd3VoXtVjhWgSz_FMWmFzoE4YxcxMbu1gbdcGCLUAc3TMXktpuyYf9X7vNfKqdgwXYv5vTXqzFOO9sH8ZypZUTP7ftyRWti5g-ferda0lfSlDVKZE7vGSviKuT8ce3Fqg'
        }
        let method = 'GET'; //request method
        let req = `https://api.gamestop.com/api/v1/items/${sku}/inventory?stores=&includeOnline=true&abcz=${v4()}`//request url
        let set = await helper.requestJson(req, method, proxy, headers)
        console.log(set.response.status)
        if (set.response.status != 200) {
            monitor(sku);
            return
        }
        let body = await set.json //request function
        if (!body.items.length > 0) {
            //console.log(sku)
            await helper.sleep(product.waittime);
            return
        }
        let status = PRODUCTS[sku].sizes
        if (body.items[0].online.stock.availableStock > 0) {
            if (status !== "In-Stock") {
                let req2 = `https://www-gamestop-com.translate.goog/api/omni/v2/products?productIds=${sku}&_x_tr_sl=auto&_x_tr_tl=en&_x_tr_hl=en&_x_tr_pto=wapp`//request url
                let set2 = await helper.requestJson(req2, method, proxy, headers)
                let body2 = await set2.json
                if (set2.response.status != 200) {
                    monitor(sku);
                    return
                }
                let url = `https://www.gamestop.com/${sku}.html#Tachyon`
                let stock = body.items[0].online.stock.availableStock
                let title = body2.productResponses[0].title
                let price = body2.productResponses[0].productPrice.basePriceValue.price.toString()
                let image = body2.productResponses[0].productImages[0].url
                let sites = await helper.dbconnect(catagory + site)
                let retail = await helper.dbconnect("RETAILFILTEREDUS")
                let qt = 'NA'
                let links = `[ATC](https://www.gamestop.com/search/?sort=BestMatch_Desc&q=${sku}&p=1#Tachyon)`
                console.log(`[time: ${new Date().toISOString()}, product: ${sku}, title: ${title}]`)
                for (let group of sites) {
                    helper.postRetail(url, title, sku, price, image, stock, group, version, qt, links)
                }
                for (let group of retail) {
                    helper.postRetail(url, title, sku, price, image, stock, group, version, qt, links)
                }
                PRODUCTS[sku].sizes = 'In-Stock'
                await database.query(`update ${table} set sizes='In-Stock' where sku='${sku}'`)
            }
        } else {
            if (status !== "Out-of-Stock") {
                PRODUCTS[sku].sizes = 'Out-of-Stock'
                await database.query(`update ${table} set sizes='Out-of-Stock' where sku='${sku}'`)
            }
        }
        await helper.sleep(product.waittime);
        monitor(sku);
        return
    } catch (e) {
        //console.log(e)
        monitor(sku)
        return
    }
}
helper.discordbot(CHANNEL, PRODUCTS, table, monitor, site)
