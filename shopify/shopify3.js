let ShopifyMonitor = require('./base.js');
let monitors = [];
monitors.push(new ShopifyMonitor("https://deadstock.ca", 'UNFILTEREDCA'))
monitors.push(new ShopifyMonitor("https://size.ca", 'UNFILTEREDCA'))
monitors.push(new ShopifyMonitor("https://jdsports.ca", 'UNFILTEREDCA'))
monitors.push(new ShopifyMonitor("https://nrml.ca", 'UNFILTEREDCA'))
monitors.push(new ShopifyMonitor("https://shop.havenshop.com", 'UNFILTEREDCA'))
monitors.push(new ShopifyMonitor("https://capsuletoronto.com", 'UNFILTEREDCA'))
monitors.push(new ShopifyMonitor("https://nomadshop.net", 'UNFILTEREDCA'))
monitors.push(new ShopifyMonitor("https://theclosetinc.com", 'UNFILTEREDCA'))
monitors.push(new ShopifyMonitor("https://courtsidesneakers.com", 'UNFILTEREDCA'))
monitors.push(new ShopifyMonitor("https://shop.exclucitylife.com", 'UNFILTEREDCA'))
monitors.push(new ShopifyMonitor("https://momentumshop.ca", 'UNFILTEREDCA'))
monitors.push(new ShopifyMonitor("https://lessoneseven.com", 'UNFILTEREDCA'))
monitors.push(new ShopifyMonitor("https://cncpts.com", 'CNCPTS'))
for(let monitor of monitors) {
    monitor.monitor();
}