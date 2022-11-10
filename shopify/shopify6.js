let ShopifyMonitor = require('./base.js');
let monitors = [];
monitors.push(new ShopifyMonitor("https://plaskateboarding.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://www.tcg-stadium.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://thebettergeneration.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://shop.ccs.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://www.303boards.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://area51store.co.nz", 'NONE'))
monitors.push(new ShopifyMonitor("https://twofeetundr.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://chalicecollectibles.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://futurerfrnce.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://store.taylorswift.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://shopwss.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://ficegallery.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://ferraramarketinc.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://finalmouse.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://www.tcg-stadium.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://shopjustsports.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://laborskateshop.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://stay-rooted.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://leencustoms.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://futurerfrnce.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://extrabutterny.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://4ucaps.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://stussy.com", 'NONE'))
//
for(let monitor of monitors) {
    monitor.monitor();
}