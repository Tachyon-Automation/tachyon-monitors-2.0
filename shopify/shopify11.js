let ShopifyMonitor = require('./base.js');
let monitors = [];
monitors.push(new ShopifyMonitor("https://imranpotato.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://finessestore.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://antisocialcollective.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://alumniofny.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://primitiveskate.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://svrn.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://snkrroom.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://hlorenzo.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://empireskate.co.nz", 'NONE'))
monitors.push(new ShopifyMonitor("https://feature.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://gbny.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://topsandbottomsusa.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://two18.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://limitededition.mx", 'NONE'))
monitors.push(new ShopifyMonitor("https://ninetimesskateshop.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://distritomax.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://shopjustsports.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://plaskateboarding.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://www.tcg-stadium.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://thebettergeneration.com", 'NONE'))
//
for(let monitor of monitors) {
    monitor.monitor();
}