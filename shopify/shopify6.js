let ShopifyMonitor = require('./base.js');
let monitors = [];
monitors.push(new ShopifyMonitor("https://plaskateboarding.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://www.tcg-stadium.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://thebettergeneration.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://shop.ccs.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://www.303boards.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://area51store.co.nz", 'NONE'))
monitors.push(new ShopifyMonitor("https://twofeetundr.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://twofeetundr.com", 'NONE'))
//
for(let monitor of monitors) {
    monitor.monitor();
}