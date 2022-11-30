// function getRandomValues(array) {
//     for (let i = 0, l = array.length; i < l; i++) {
//         array[i] = Math.floor(Math.random() * 256);
//     }
//     return array;
// }
const getRandomValues = require('get-random-values')
const Ev = (t, e, n) => {
    for (var r = ie(encode(n), 10), o = [], a = -1, i = 0; i < t.length; i++) {
      var l = Math.floor(i / r.length + 1),
        c = i >= r.length ? i % r.length : i,
        u = r.charCodeAt(c) * r.charCodeAt(l)
      u > a && (a = u)
    }
    for (var f = 0; t.length > f; f++) {
      var s = Math.floor(f / r.length) + 1,
        d = f % r.length,
        p = r.charCodeAt(d) * r.charCodeAt(s)
      for (p >= e && (p = wv(p, 0, a, 0, e - 1)); -1 !== o.indexOf(p); ) p += 1
      o.push(p)
    }
  
    return o.sort(function (t, e) {
      return t - e
    })
  }
  const encode = (t) => {
    return Buffer.from(t, 'binary').toString('base64');
  }
  
  const ie = (t, e) => {
    for (var n = '', r = 0; r < t.length; r++)
      n += String.fromCharCode(e ^ t.charCodeAt(r))
  
    return n
  }
  
  const wv = (t, e, n, r, o) => {
    return Math.floor(((t - e) / (n - e)) * (o - r) + r)
  }
  
  const Fa = (t, e, n) => {
    for (var r = '', o = 0, a = t.split(''), i = 0; i < t.length; i++)
      (r += e.substring(o, n[i] - i - 1) + a[i]), (o = n[i] - i - 1)
  
    return (r += e.substring(o))
  }
  

function P(t, n) {
    var e = (65535 & t) + (65535 & n);
    return (t >> 16) + (n >> 16) + (e >> 16) << 16 | 65535 & e;
}

function Y(t, n) {
    return t << n | t >>> 32 - n;
}

function R(t, n, e, r, o, i) {
    return P(Y(P(P(n, t), P(r, i)), o), e);
}

function N(t, n, e, r, o, i, a) {
    return R(n & e | ~n & r, t, n, o, i, a);
}

function z(t, n, e, r, o, i, a) {
    return R(n & r | e & ~r, t, n, o, i, a);
}

function X(t, n, e, r, o, i, a) {
    return R(n ^ e ^ r, t, n, o, i, a);
}

function F(t, n, e, r, o, i, a) {
    return R(e ^ (n | ~r), t, n, o, i, a);
}

function V(t, n) {
    t[n >> 5] |= 128 << n % 32, t[14 + (n + 64 >>> 9 << 4)] = n;
    var e = void 0,
        r = void 0,
        o = void 0,
        i = void 0,
        a = void 0,
        c = 1732584193,
        u = -271733879,
        f = -1732584194,
        g = 271733878;

    for (e = 0; e < t.length; e += 16) r = c, o = u, i = f, a = g, c = N(c, u, f, g, t[e], 7, -680876936), g = N(g, c, u, f, t[e + 1], 12, -389564586), f = N(f, g, c, u, t[e + 2], 17, 606105819), u = N(u, f, g, c, t[e + 3], 22, -1044525330), c = N(c, u, f, g, t[e + 4], 7, -176418897), g = N(g, c, u, f, t[e + 5], 12, 1200080426), f = N(f, g, c, u, t[e + 6], 17, -1473231341), u = N(u, f, g, c, t[e + 7], 22, -45705983), c = N(c, u, f, g, t[e + 8], 7, 1770035416), g = N(g, c, u, f, t[e + 9], 12, -1958414417), f = N(f, g, c, u, t[e + 10], 17, -42063), u = N(u, f, g, c, t[e + 11], 22, -1990404162), c = N(c, u, f, g, t[e + 12], 7, 1804603682), g = N(g, c, u, f, t[e + 13], 12, -40341101), f = N(f, g, c, u, t[e + 14], 17, -1502002290), u = N(u, f, g, c, t[e + 15], 22, 1236535329), c = z(c, u, f, g, t[e + 1], 5, -165796510), g = z(g, c, u, f, t[e + 6], 9, -1069501632), f = z(f, g, c, u, t[e + 11], 14, 643717713), u = z(u, f, g, c, t[e], 20, -373897302), c = z(c, u, f, g, t[e + 5], 5, -701558691), g = z(g, c, u, f, t[e + 10], 9, 38016083), f = z(f, g, c, u, t[e + 15], 14, -660478335), u = z(u, f, g, c, t[e + 4], 20, -405537848), c = z(c, u, f, g, t[e + 9], 5, 568446438), g = z(g, c, u, f, t[e + 14], 9, -1019803690), f = z(f, g, c, u, t[e + 3], 14, -187363961), u = z(u, f, g, c, t[e + 8], 20, 1163531501), c = z(c, u, f, g, t[e + 13], 5, -1444681467), g = z(g, c, u, f, t[e + 2], 9, -51403784), f = z(f, g, c, u, t[e + 7], 14, 1735328473), u = z(u, f, g, c, t[e + 12], 20, -1926607734), c = X(c, u, f, g, t[e + 5], 4, -378558), g = X(g, c, u, f, t[e + 8], 11, -2022574463), f = X(f, g, c, u, t[e + 11], 16, 1839030562), u = X(u, f, g, c, t[e + 14], 23, -35309556), c = X(c, u, f, g, t[e + 1], 4, -1530992060), g = X(g, c, u, f, t[e + 4], 11, 1272893353), f = X(f, g, c, u, t[e + 7], 16, -155497632), u = X(u, f, g, c, t[e + 10], 23, -1094730640), c = X(c, u, f, g, t[e + 13], 4, 681279174), g = X(g, c, u, f, t[e], 11, -358537222), f = X(f, g, c, u, t[e + 3], 16, -722521979), u = X(u, f, g, c, t[e + 6], 23, 76029189), c = X(c, u, f, g, t[e + 9], 4, -640364487), g = X(g, c, u, f, t[e + 12], 11, -421815835), f = X(f, g, c, u, t[e + 15], 16, 530742520), u = X(u, f, g, c, t[e + 2], 23, -995338651), c = F(c, u, f, g, t[e], 6, -198630844), g = F(g, c, u, f, t[e + 7], 10, 1126891415), f = F(f, g, c, u, t[e + 14], 15, -1416354905), u = F(u, f, g, c, t[e + 5], 21, -57434055), c = F(c, u, f, g, t[e + 12], 6, 1700485571), g = F(g, c, u, f, t[e + 3], 10, -1894986606), f = F(f, g, c, u, t[e + 10], 15, -1051523), u = F(u, f, g, c, t[e + 1], 21, -2054922799), c = F(c, u, f, g, t[e + 8], 6, 1873313359), g = F(g, c, u, f, t[e + 15], 10, -30611744), f = F(f, g, c, u, t[e + 6], 15, -1560198380), u = F(u, f, g, c, t[e + 13], 21, 1309151649), c = F(c, u, f, g, t[e + 4], 6, -145523070), g = F(g, c, u, f, t[e + 11], 10, -1120210379), f = F(f, g, c, u, t[e + 2], 15, 718787259), u = F(u, f, g, c, t[e + 9], 21, -343485551), c = P(c, r), u = P(u, o), f = P(f, i), g = P(g, a);

    return [c, u, f, g];
}

function j(t) {
    var n = void 0,
        e = "";

    for (n = 0; n < 32 * t.length; n += 8) e += String.fromCharCode(t[n >> 5] >>> n % 32 & 255);

    return e;
}

var Bs = "%uDB40%uDD";
function Do(t) {
    return (t || "").split("").reduce(function (t, n) {
        return t += unescape(Bs + ("" + n.codePointAt(0).toString(16)).padStart(2, "0"));
    }, "");
}

function W(t) {
    var n = void 0,
        e = [];

    for (e[(t.length >> 2) - 1] = void 0, n = 0; n < e.length; n += 1) e[n] = 0;

    for (n = 0; n < 8 * t.length; n += 8) e[n >> 5] |= (255 & t.charCodeAt(n / 8)) << n % 32;

    return e;
}

function Z(t) {
    return j(V(W(t), 8 * t.length));
}

function Q(n, t) {
    var e = void 0,
        r = W(n),
        o = [],
        i = [];

    for (o[15] = i[15] = void 0, r.length > 16 && (r = V(r, 8 * n.length)), e = 0; e < 16; e += 1) o[e] = 909522486 ^ r[e], i[e] = 1549556828 ^ r[e];

    var t = V(o.concat(W(t)), 512 + 8 * t.length);
    return j(V(i.concat(t), 640));
}

function B(t) {
    var n = "0123456789abcdef",
        e = "",
        r = void 0,
        o = void 0;

    for (o = 0; o < t.length; o += 1) r = t.charCodeAt(o), e += n.charAt(r >>> 4 & 15) + n.charAt(15 & r);

    return e;
}

function L(t) {
    return unescape(encodeURIComponent(t));
}

function J(n, t) {
    return Q(L(n), L(t));
}

function B(t) {
    var n = "0123456789abcdef",
        e = "",
        r = void 0,
        o = void 0;

    for (o = 0; o < t.length; o += 1) r = t.charCodeAt(o), e += n.charAt(r >>> 4 & 15) + n.charAt(15 & r);

    return e;
}

function q(n, t) {
    return B(J(n, t));
}
function Gg(t) {
    return Z(L(t));
}
function H(t) {
    return B(Gg(t));
}

function K(t, n, e) {
    return (n ? (e ? J(n, t) : q(n, t)) : (e ? G(t) : H(t)));
}

function $(t, n, r) {
    // var o = e;
    // Af++, I("PX503");
    var i = K(t, n, r);
    // return T("PX503"), i;
    return i;
}



function fg() {
    var t = new Uint8Array(16);
    return getRandomValues(t), t;
}

var dg = fg(),
    Cg = [1 | dg[0], dg[1], dg[2], dg[3], dg[4], dg[5]],
    vg = 16383 & (dg[6] << 8 | dg[7]),
    pg = 0,
    mg = 0;


function E() {
    return +new Date();
}

for (var gg = [], lg = {}, sg = 0; sg < 256; sg++) gg[sg] = (sg + 256).toString(16).substr(1), lg[gg[sg]] = sg;

function Cn(t, n) {
    var e = n || 0,
        r = gg;
    return r[t[e++]] + r[t[e++]] + r[t[e++]] + r[t[e++]] + "-" + r[t[e++]] + r[t[e++]] + "-" + r[t[e++]] + r[t[e++]] + "-" + r[t[e++]] + r[t[e++]] + "-" + r[t[e++]] + r[t[e++]] + r[t[e++]] + r[t[e++]] + r[t[e++]] + r[t[e++]];
}

function vn(t, n, r, o) {
    // var i = e;
    // I("PX505");
    var a = "";
    if (o) try {
        for (var c = (new Date().getTime() * Math.random() + "").replace(".", ".".charCodeAt()).split("").slice(-16), u = 0; u < c.length; u++) c[u] = parseInt(10 * Math.random()) * +c[u] || parseInt(Math.random() * ug.len);

        a = Cn(c, 0, ug.cipher);
    } catch (t) { }
    var f = n && r || 0,
        g = n || [];
    t = t || {};
    var l = void 0 !== t.clockseq ? t.clockseq : vg,
        s = void 0 !== t.msecs ? t.msecs : E(),
        d = void 0 !== t.nsecs ? t.nsecs : mg + 1,
        C = s - pg + (d - mg) / 1e4;
    if (C < 0 && void 0 === t.clockseq && (l = l + 1 & 16383), (C < 0 || s > pg) && void 0 === t.nsecs && (d = 0), d >= 1e4) throw new Error("uuid.v1(): Can't create more than 10M uuids/sec");
    pg = s, mg = d, vg = l, s += 122192928e5;
    var v = (1e4 * (268435455 & s) + d) % 4294967296;
    g[f++] = v >>> 24 & 255, g[f++] = v >>> 16 & 255, g[f++] = v >>> 8 & 255, g[f++] = 255 & v;
    var p = s / 4294967296 * 1e4 & 268435455;
    g[f++] = p >>> 8 & 255, g[f++] = 255 & p, g[f++] = p >>> 24 & 15 | 16, g[f++] = p >>> 16 & 255, g[f++] = l >>> 8 | 128, g[f++] = 255 & l;

    for (var m = t.node || Cg, h = 0; h < 6; h++) g[f + h] = m[h];

    var y = n || Cn(g);
    // return a === y ? a : (T("PX505"), y);
    return a === y ? a : (null, y);
}

function qr() {
    return window["_pxAction"];
}

function Kr() {
    // var Bg = "pxc",
    // Lg = "pxhc",
    // Gg = "c";
    // var t = qr(); //this is undefined anyway
    // return t === Gg || t === Bg || t === Lg ? window._pxUuid || gn("uuid") || vn() : vn();
    return vn();
}

function Pi(t, n) {
    return [Kr(), t, n].join(":");
}

function h() {
    return ("undefined" != typeof JSON && "function" == typeof JSON.stringify && void 0 === Array.prototype.toJSON ? JSON.stringify : a).apply(null, Array.prototype.slice.call(arguments));
}

function Bt(t) {
    for (var n = "", e = "", r = 0; r < t.length; r++) {
        var o = t.charCodeAt(r);
        o >= Wf && o <= Zf ? n += t[r] : e += o % Qf;
    }

    return n + e;
}


var Wf = 48,
    Zf = 57,
    Qf = 10,
    Bf = 20;

function Qt(t, n) {
    var e = $(t, n);

    try {
        for (var r = Bt(e), o = "", i = 0; i < r.length; i += 2) o += r[i];

        return o;
    } catch (t) { }
}

//us = "v6.5.0",
// fs = "200"
//nc.tag = us
//nc.fTag = fs
//var s = Qt(h(t), Pi(nC.tag, nC.fTag));

function genPC(payloadJSON, UUID, tag, fTag) {
    return Qt(h(payloadJSON), UUID + ":" + tag + ":" + fTag);
}

module.exports = {
    genPC: genPC,
    uuid: vn,
    $: $,
    Kr: Kr,
    Do: Do,

    decodePayload: function (payload, options) {
        // let { shift, base64, shiftAmount } = options;

        base64 = true;
        shift = true;
        shiftAmount = 50;

        const string = base64 ? Buffer.from(payload, 'base64').toString() : payload;
        let d = '';
        for (let i = 0; i < string.length; i++) {
            d += shift ? String.fromCharCode(string.charCodeAt(i) ^ shiftAmount) : string[i];
        }
        return d;
    },

    encodePayload: function (payload, uuid, sts) {
        var sts = !sts || sts.length === 0 ? '1604064986000' : sts
      
        const BasePayload = encode(ie(payload, 50))
      
        const fv = ie(encode(sts), 10)
      
        return Fa(fv, BasePayload, Ev(fv, BasePayload.length, uuid))
      }
}