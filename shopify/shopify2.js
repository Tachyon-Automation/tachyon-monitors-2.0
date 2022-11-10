let ShopifyMonitor = require('./base.js');
let monitors = [];
monitors.push(new ShopifyMonitor("https://shop.doverstreetmarket.com", 'DSMUK'))
monitors.push(new ShopifyMonitor("https://space23.it", 'NONE'))
monitors.push(new ShopifyMonitor("https://mita-sneakers.co.jp", 'NONE'))
monitors.push(new ShopifyMonitor("https://titan22.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://stoy.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://amongstfew.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://limitededt.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://burnrubbersneakers.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://bandier.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://it.oneblockdown.it", 'NONE'))
monitors.push(new ShopifyMonitor("https://exclusivefitted.com", 'HATS'))
monitors.push(new ShopifyMonitor("https://sportsworld165.com", 'HATS'))
for(let monitor of monitors) {
    monitor.monitor();
}