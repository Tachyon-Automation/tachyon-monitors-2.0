let ShopifyMonitor = require('./base.js');
const helper = require('../x-help/helper');
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
monitors.push(new ShopifyMonitor("https://myfitteds.com", 'HATS'))
monitors.push(new ShopifyMonitor("https://shopcapcity.com", 'HATS'))
monitors.push(new ShopifyMonitor("https://pvtchworktvb.com", 'HATS'))
monitors.push(new ShopifyMonitor("https://madebyerickshop.com", 'HATS'))
monitors.push(new ShopifyMonitor("https://chonchispins.com", 'HATS'))
monitors.push(new ShopifyMonitor("https://capsulehats.com", 'HATS'))
monitors.push(new ShopifyMonitor("https://hatclub.com", 'HATS'))
monitors.push(new ShopifyMonitor("https://sneakerbaas.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://proj3ct.it", 'NONE'))
monitors.push(new ShopifyMonitor("https://fearofgod.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://epitomeatl.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://culturekings.com.au", 'NONE'))
monitors.push(new ShopifyMonitor("https://culturekings.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://crossoverconceptstore.com", 'NONE'))
for(let monitor of monitors) {
    monitor.monitor();
}