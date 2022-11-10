let ShopifyMonitor = require('./base.js');
let monitors = [];
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