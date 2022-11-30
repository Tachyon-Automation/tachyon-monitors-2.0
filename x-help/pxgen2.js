const pxHelper = require('../px-helper');
const collector = require('./index.js')
const fetch = require('node-fetch');
const HTTPSProxyAgent = require('https-proxy-agent');
const moment = require('moment');
let userAgent = "";
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function ln(t, n) {
    for (var e = "", r = 0; r < t.length; r++) e += String.fromCharCode(n ^ t.charCodeAt(r));

    return e;
}

function genPX3Payload(px2, collector) {
    let payload = {}
    payload["PX10249"] = "64556c77"
    payload["PX10238"] = ""
    payload["PX10995"] = "10207b2f"
    payload["PX10567"] = "10207b2f"
    payload["PX11192"] = "90e65465"
    payload["PX10065"] = collector["PX10065"] //!!window.Worklet
    payload["PX11153"] = collector["PX11153"] //!!window.AudioWorklet
    payload["PX10509"] = collector["PX10509"] //!!window.AudioWorkletNode
    payload["PX10227"] = collector["PX10227"] //window.isSecureContext
    payload["PX11249"] = collector["PX11249"]
    payload["PX11253"] = "4YC14YCd4YCd4YCV4YCe4YCX4YGS5J256aus7r266YaI5oCR7r27" //collector["PX11253"] //THIS IS FUCKED. EDIT THIS TO MANUAL!
    payload["PX11256"] = collector["PX11256"]
    payload["PX11264"] = false//true //HARDCODED but CHECK (Depends on site)
    payload["PX11002"] = true
    payload["PX10410"] = collector["PX10410"]
    payload["PX11018"] = false //LAZY
    payload["PX11243"] = true //should be fixed - collector["PX11243"]
    payload["PX11244"] = "TypeError: Cannot read properties of undefined (reading 'width')"
    payload["PX11245"] = collector["PX11245"]
    payload["PX11246"] = collector["PX11246"] //33 should be fixed
    payload["PX11247"] = false //should be fixed
    payload["PX11274"] = false //node.js check (FIXED)
    payload["PX10929"] = 0 //window.self === window.top ? 0 : 1
    payload["PX10248"] = getRandomInt(2, 12) //History length
    payload["PX10705"] = "TypeError: Cannot read properties of null (reading '0')\n    at wt (https://hibbett-mobileapi.prolific.io/AJDckzHD/init.js:2:19855)\n    at fc (https://hibbett-mobileapi.prolific.io/AJDckzHD/init.js:2:40708)\n    at lc (https://hibbett-mobileapi.prolific.io/AJDckzHD/init.js:2:39744)\n    at https://hibbett-mobileapi.prolific.io/AJDckzHD/init.js:2:39120" //KEEP CLOSE CHECK ON THIS ERROR MSG
    payload["PX10360"] = "https://hibbett-mobileapi.prolific.io/" //what to do
    payload["PX10311"] = [] //CHECK, should be fixed
    payload["PX10744"] = "" //document.referrer
    payload["PX10046"] = collector["PX10046"] //A.hasOwnProperty("onorientationchange") || !!A.onorientationchange
    payload["PX10218"] = "e0eaf10e"// FUCK collector["PX10218"]
    payload["PX10162"] = collector["PX10162_HIBBETT"]
    payload["PX10940"] = collector["PX10940_HIBBETT"]
    payload["PX11209"] = collector["PX11209_HIBBETT"]
    payload["PX10498"] = collector["PX10498"]
    payload["PX11055"] = "144|66|66|172|80" //FUCKKK CHECK THIS collector["PX11055"]
    payload["PX10422"] = collector["PX10422"]
    payload["PX10659"] = collector["PX10659"]
    payload["PX10316"] = collector["PX10316"]
    payload["PX10742"] = "" + false //navigator.webdriver
    payload["PX11148"] = "" + false // same as above
    payload["PX10846"] = 1 //up
    payload["PX10323"] = 1 //same as above
    payload["PX11015"] = "" // window.chrome && window.chrome.runtime && window.chrome.runtime.id || "
    payload["PX10599"] = collector["PX10599"] //Object.keys(window.chrome)
    payload["PX10790"] = collector["PX10790"] //plugins array
    payload["PX11010"] = collector["PX11010"] //plugins length
    payload["PX10289"] = collector["PX10289"] //some plugin bs
    payload["PX11043"] = collector["PX10289"] //same as above
    payload["PX10093"] = collector["PX10093"]
    payload["PX10604"] = collector["PX10604"]
    payload["PX10296"] = collector["PX10296"]
    payload["PX11186"] = collector["PX11186"]
    payload["PX10397"] = collector["PX10397"]
    payload["PX10472"] = collector["PX10472"] //navigator.userAgent
    payload["PX10758"] = collector["PX10758"]
    payload["PX10099"] = collector["PX10099"]
    payload["PX10336"] = collector["PX10336"]
    payload["PX10373"] = collector["PX10373"]
    payload["PX10802"] = collector["PX10802"]
    payload["PX10628"] = collector["PX10628"]
    payload["PX11039"] = collector["PX11039"]
    payload["PX10547"] = collector["PX10174"]
    payload["PX10174"] = collector["PX10174"]
    payload["PX10775"] = collector["PX10775"]
    payload["PX10539"] = collector["PX10539"]
    payload["PX10189"] = collector["PX10189"]
    payload["PX10390"] = collector["PX10390"]
    payload["PX10963"] = collector["PX10963"]
    payload["PX10081"] = collector["PX10081"]
    payload["PX10399"] = collector["PX10399"]
    payload["PX10273"] = collector["PX10273"]
    payload["PX10595"] = collector["PX10595"]
    payload["PX10822"] = collector["PX10822"]
    payload["PX11235"] = collector["PX11235"]
    payload["PX11236"] = collector["PX11236"]
    payload["PX11237"] = collector["PX11237"]
    payload["PX11238"] = collector["PX11238"]
    payload["PX11239"] = collector["PX11239"]
    payload["PX11240"] = collector["PX11240"]
    payload["PX11241"] = collector["PX11241"]
    payload["PX11242"] = collector["PX11242"]
    payload["PX11277"] = collector["PX11277"]
    payload["PX11278"] = collector["PX11278"]
    payload["PX10561"] = collector["PX10561"]
    payload["PX10499"] = collector["PX10499"]
    payload["PX10843"] = collector["PX10843"]
    payload["PX10850"] = collector["PX10850"]
    payload["PX11113"] = payload.PX10561 + "X" + payload.PX10499
    payload["PX10724"] = collector["PX10724"]
    payload["PX10089"] = collector["PX10089"]
    payload["PX10204"] = collector["PX10204"]
    payload["PX11138"] = collector["PX11138"]
    payload["PX11170"] = collector["PX11170"]
    payload["PX11174"] = collector["PX11174"]
    payload["PX10243"] = collector["PX10243"]
    payload["PX10522"] = pxHelper.$(px2.uuid, collector["PX10472"])
    payload["PX10840"] = px2.wcs
    payload["PX10464"] = pxHelper.$(px2.vid, collector["PX10472"])
    payload["PX10080"] = pxHelper.$(px2.sid, collector["PX10472"])
    payload["PX11230"] = pxHelper.$(px2.vid)
    payload["PX10141"] = parseInt(px2.sts)
    payload["PX10418"] = "" + px2.cls.split("|")[0]
    payload[ln(payload.PX10418, payload.PX10141 % 10 + 2) + ""] = ln(payload.PX10418, payload.PX10141 % 10 + 1) + ""
    payload["PX11147"] = px2.cls.split("|")[1]
    payload["PX11181"] = parseInt(px2.drc)
    payload["PX10239"] = getRandomInt(5000000, 9000000) //usedJSHeapSize
    payload["PX10267"] = getRandomInt(20000000, 23000000) //jsHeapSizeLimit
    payload["PX10551"] = getRandomInt(20000000, 25000000), //totalJSHeapSize
        payload["PX10558"] = moment().format('ddd MMM DD YYYY HH:mm:ss') + " GMT+0530 (India Standard Time)"
    payload["PX10236"] = false //window.Buffer
    payload["PX10400"] = false //window.orientation
    payload["PX10530"] = false //window.ActiveXObject
    payload["PX11060"] = true //navigator.sendBeacon
    payload["PX10801"] = 0 //navigator.maxTouchPoints
    payload["PX10394"] = false //check above
    payload["PX10058"] = "visible" //some webkit check, in COLLECTOR as well
    payload["PX11123"] = false //window.showModalDialog
    payload["PX10096"] = 0 //check
    payload["PX10872"] = collector["PX10872"]
    payload["PX11028"] = true //kt(window.openDatabase)
    payload["PX10366"] = collector["PX10366"]
    payload["PX10585"] = "missing"
    payload["PX10976"] = true //kt(window.setTimeout)
    payload["PX10250"] = true
    payload["PX10259"] = false
    payload["PX10156"] = collector["PX10156"]
    payload["PX10712"] = 3//6 //c.cssFromResourceApi
    payload["PX10555"] = 0//1
    payload["PX10347"] = 0
    payload["PX10119"] = 3//4
    payload["PX10010"] = false
    payload["PX10225"] = false
    payload["PX10855"] = false
    payload["PX11065"] = false
    payload["PX10456"] = false
    payload["PX10441"] = false
    payload["PX10098"] = false
    payload["PX10557"] = false
    payload["PX10170"] = false
    payload["PX10824"] = false
    payload["PX10087"] = false
    payload["PX11042"] = false
    payload["PX10891"] = 2//getRandomInt(1, 2)
    payload["PX10622"] = 3//1
    payload["PX10272"] = px2.d["PX10272"] + getRandomInt(400, 1700)
    payload["PX10041"] = px2.d["PX10094"] + getRandomInt(450, 1625)
    payload["PX10970"] = px2.d["PX10970"]
    payload["PX10094"] = px2.d["PX10094"]
    payload["PX11004"] = px2.d["PX11004"] + getRandomInt(450, 1800)
    payload["PX10206"] = px2.d["PX10206"]
    payload["PX10088"] = px2.d["PX10088"]
    userAgent = payload.PX10472
    return [{ "t": "PX10303", d: payload }];
}

async function postPX3(payloadEncrypted, px2, appID, tag, fTag, uuid, seq, en, cs, pc, sid, vid, cts, rsc, agent) {
    let t = `payload=${payloadEncrypted}&appId=${appID}&tag=${tag}&uuid=${uuid}&ft=${fTag}&seq=${seq}&en=${en}&cs=${cs}&pc=${pc}`
    if (sid)
        t += `&sid=${sid}` + pxHelper.Do(px2.sts);
    if (vid)
        t += `&vid=${vid}`
    if (cts)
        t += `&cts=${cts}`

    t += `&rsc=${rsc}`
    // console.log(t)
    try {
        let response = await fetch('https://collector-pxur63h57z.px-cloud.net/api/v2/collector', {
            headers: {
                'User-Agent': userAgent,
                "accept": "*/*",
                "accept-language": "en-US,en;q=0.9",
                "content-type": "application/x-www-form-urlencoded",
                "sec-ch-ua": "\"Google Chrome\";v=\"107\", \"Chromium\";v=\"107\", \"Not=A?Brand\";v=\"24\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Windows\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "cross-site",
                "Referer": "https://www.hibbett.com/",
                "Referrer-Policy": "strict-origin-when-cross-origin"
            },
            agent: agent,
            "body": t,
            "method": "POST",
        });
        let body = await response.json();
        return body;
    } catch (e) {
        //console.log(e)
        return
    }
}

function genPX2Payload(uuid) {
    let payload = [
        {
            "t": "PX10816",
            "d": {
                "PX10360": "https://solebox.com",
                "PX10929": 0,
                "PX11186": "Win32",
                "PX10622": 0,
                "PX10272": getRandomInt(1700, 3000),
                "PX10970": 3600,
                "PX10094": Date.now(),
                "PX11004": Date.now() + getRandomInt(3, 7),
                "PX10206": uuid,
                "PX10088": true
            }
        }
    ];
    return payload;
}

async function postPX2(payloadEncrypted, appID, tag, fTag, uuid, seq, en, pc, sid, vid, cts, rsc, agent) {
    let t = `payload=${payloadEncrypted}&appId=${appID}&tag=${tag}&uuid=${uuid}&ft=${fTag}&seq=${seq}&en=${en}&pc=${pc}`
    if (sid)
        t += `&sid=${sid}`;
    if (vid)
        t += `&vid=${vid}`
    if (cts)
        t += `&cts=${cts}`
    t += `&rsc=${rsc}`
    // console.log(t)
    try {
        let response = await fetch('https://collector-pxur63h57z.px-cloud.net/api/v2/collector', {
            headers: {
                'User-Agent': userAgent,
                "accept": "*/*",
                "accept-language": "en-US,en;q=0.9",
                "content-type": "application/x-www-form-urlencoded",
                "sec-ch-ua": "\"Google Chrome\";v=\"107\", \"Chromium\";v=\"107\", \"Not=A?Brand\";v=\"24\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Windows\"",
                "Referer": "https://www.solebox.com/",
                "Referrer-Policy": "strict-origin-when-cross-origin"
            },
            agent: agent,
            "body": t,
            "method": "POST",
        });
        let body = await response.json();
        return body;
    } catch (e) {
        //console.log(e)
        return
    }
}

function getPX2(px2Response, px2Payload, sid, vid, cts, uuid) {

    let px2 = {
        sid: sid,
        vid: vid,
        cts: cts,
        uuid: uuid
    };
    for (let str of px2Response) {
        let args = str.split("|");
        if (args[0] === 'sid') {
            px2['sid'] = args[1];
        }
        if (args[0] === 'cls') {
            px2['cls'] = args[1] + "|" + args[2];
        }
        if (args[0] === 'sts') {
            px2['sts'] = args[1];
        }
        if (args[0] === 'wcs') {
            px2['wcs'] = args[1];
        }
        if (args[0] === 'drc') {
            px2['drc'] = args[1];
        }
        if (args[0] === 'cs') {
            px2['cs'] = args[1];
        }
        if (args[0] === 'vid') {
            px2['vid'] = args[1];
        }
        if (args[0] === 'cts') {
            px2['cts'] = args[1];
        }
    }
    px2.d = px2Payload[0].d;
    return px2;
}

async function genCookie(proxy) {
    try {
        let agent = proxy || proxy === '' ? new HTTPSProxyAgent(proxy) : null
        let uuid = pxHelper.Kr();
        let px2Payload = genPX2Payload(uuid);
        let px2PayloadEncrypted = pxHelper.encodePayload(JSON.stringify(px2Payload), uuid)
        let pc = pxHelper.genPC(px2Payload, uuid, 'v8.0.2', '278');
        let sid = null;
        let vid = null;
        let cts = null;
        let px2Result = await postPX2(px2PayloadEncrypted, 'PXAJDckzHD', 'v8.0.2', '278', uuid, '0', 'NTA', pc, sid, vid, vid, '1', agent);
        let collectorData = collector.getRandomFiltered();
        let px2 = getPX2(px2Result.do, px2Payload, sid, vid, cts, uuid);
        let px3Payload = genPX3Payload(px2, collectorData, sid, vid);
        let px3PayloadEncrypted = pxHelper.encodePayload(JSON.stringify(px3Payload), uuid, px2.sts)
        let pcPX3 = pxHelper.genPC(px3Payload, uuid, 'v8.0.2', '278');
        let px3Result = await postPX3(px3PayloadEncrypted, px2, 'PXAJDckzHD', 'v8.0.2', '278', uuid, '1', 'NTA', px2.cs, pcPX3, sid ? sid : px2.sid, vid ? vid : px2.vid, cts ? cts : px2.cts, '2', agent);
        let px3Cookie = px3Result.do[0].split("|")[3]
        //console.log(px3Cookie)
        return px3Cookie;
    } catch (e) {
        //console.log(e)
        return
    }
}
module.exports = genCookie