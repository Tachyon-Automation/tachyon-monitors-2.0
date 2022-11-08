let ShopifyMonitor = require('./base.js');
const helper = require('../x-help/helper');
let monitors = [];
monitors.push(new ShopifyMonitor("https://shop.doverstreetmarket.com", 'DSMUK'))
monitors.push(new ShopifyMonitor("https://www.space23.it", 'NONE'))
monitors.push(new ShopifyMonitor("https://www.mita-sneakers.co.jp", 'NONE'))
monitors.push(new ShopifyMonitor("https://titan22.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://stoy.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://www.amongstfew.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://limitededt.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://burnrubbersneakers.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://www.bandier.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://it.oneblockdown.it", 'NONE'))
monitors.push(new ShopifyMonitor("https://exclusivefitted.com", 'HATS'))
monitors.push(new ShopifyMonitor("https://sportsworld165.com", 'HATS'))
monitors.push(new ShopifyMonitor("https://www.myfitteds.com", 'HATS'))
monitors.push(new ShopifyMonitor("https://www.shopcapcity.com", 'HATS'))
monitors.push(new ShopifyMonitor("https://pvtchworktvb.com", 'HATS'))
monitors.push(new ShopifyMonitor("https://madebyerickshop.com", 'HATS'))
monitors.push(new ShopifyMonitor("https://chonchispins.com", 'HATS'))
monitors.push(new ShopifyMonitor("https://capsulehats.com", 'HATS'))
monitors.push(new ShopifyMonitor("https://www.hatclub.com", 'HATS'))
monitors.push(new ShopifyMonitor("https://www.sneakerbaas.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://www.proj3ct.it", 'NONE'))
for(let monitor of monitors) {
    monitor.monitor();
}