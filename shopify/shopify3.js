let ShopifyMonitor = require('./base.js');
const helper = require('../x-help/helper');
let monitors = [];
monitors.push(new ShopifyMonitor("https://www.deadstock.ca", 'UNFILTEREDCA'))
monitors.push(new ShopifyMonitor("https://size.ca", 'UNFILTEREDCA'))
monitors.push(new ShopifyMonitor("https://jdsports.ca", 'UNFILTEREDCA'))
monitors.push(new ShopifyMonitor("https://nrml.ca", 'UNFILTEREDCA'))
monitors.push(new ShopifyMonitor("https://shop.havenshop.com", 'UNFILTEREDCA'))
monitors.push(new ShopifyMonitor("https://www.capsuletoronto.com", 'UNFILTEREDCA'))
monitors.push(new ShopifyMonitor("https://nomadshop.net", 'UNFILTEREDCA'))
monitors.push(new ShopifyMonitor("https://www.theclosetinc.com", 'UNFILTEREDCA'))
monitors.push(new ShopifyMonitor("https://www.courtsidesneakers.com", 'UNFILTEREDCA'))
monitors.push(new ShopifyMonitor("https://havenshop.com", 'UNFILTEREDCA'))
monitors.push(new ShopifyMonitor("https://shop.exclucitylife.com", 'UNFILTEREDCA'))
monitors.push(new ShopifyMonitor("https://momentumshop.ca", 'UNFILTEREDCA'))
monitors.push(new ShopifyMonitor("https://lessoneseven.com", 'UNFILTEREDCA'))
monitors.push(new ShopifyMonitor("https://cncpts.com", 'CNCPTS'))
monitors.push(new ShopifyMonitor("https://gallery.canary---yellow.com", 'CANARYYELLOW'))
monitors.push(new ShopifyMonitor("https://www.hoopsheaven.com.au", 'NONE'))
monitors.push(new ShopifyMonitor("https://usgstore.com.au", 'NONE'))
monitors.push(new ShopifyMonitor("https://creme321.com", 'NONE'))
for(let monitor of monitors) {
    monitor.monitor();
}