let ShopifyMonitor = require('./base.js');
let monitors = [];
monitors.push(new ShopifyMonitor("https://hannibalstore.it", 'NONE'))
monitors.push(new ShopifyMonitor("https://hanon-shop.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://highsandlows.net.au", 'NONE'))
monitors.push(new ShopifyMonitor("https://humanmade.jp", 'NONE'))
monitors.push(new ShopifyMonitor("https://jjjjound.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://kongonline.co.uk", 'NONE'))
monitors.push(new ShopifyMonitor("https://lapstoneandhammer.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://launch.toytokyo.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://leaders1354.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://lessoneseven.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://notre-shop.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://offthehook.ca", 'UNFILTEREDCA'))
monitors.push(new ShopifyMonitor("https://pampamlondon.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://patta.nl", 'NONE'))

for(let monitor of monitors) {
    monitor.monitor();
}