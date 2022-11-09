let ShopifyMonitor = require('./base.js');
const helper = require('../x-help/helper');
let monitors = [];
monitors.push(new ShopifyMonitor("https://www.abovethecloudsstore.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://antisocialsocialclub.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://bapefrance.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://bdgastore.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://bimtoy.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://blendsus.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://www.blkmkt.us", 'NONE'))
monitors.push(new ShopifyMonitor("https://bowsandarrowsberkeley.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://brremix.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://burnrubbersneakers.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://ca.octobersveryown.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://shoegallerymiami.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://shop.extrabutterny.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://amigoskateshop.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://njskateshop.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://owlandgoosegifts.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://lustmexico.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://atmos.co.id", 'NONE'))
monitors.push(new ShopifyMonitor("https://us.bape.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://imranpotato.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://finessestore.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://antisocialcollective.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://alumniofny.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://primitiveskate.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://www.svrn.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://snkrroom.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://hlorenzo.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://empireskate.co.nz", 'NONE'))
monitors.push(new ShopifyMonitor("https://feature.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://gbny.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://topsandbottomsusa.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://two18.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://limitededition.mx", 'NONE'))
monitors.push(new ShopifyMonitor("https://ninetimesskateshop.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://www.distritomax.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://www.shopjustsports.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://plaskateboarding.com", 'NONE'))
//
for(let monitor of monitors) {
    monitor.monitor();
}