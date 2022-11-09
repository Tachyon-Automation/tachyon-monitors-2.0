let ShopifyMonitor = require('./base.js');
const helper = require('../x-help/helper');
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
monitors.push(new ShopifyMonitor("https://properlbc.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://renarts.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://rise45.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://rh-ude.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://rockcitykicks.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://saintalfred.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://sbyserena.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://sneakerpolitics.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://a-ma-maniere.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://socialstatuspgh.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://apbstore.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://thedarksideinitiative.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://ruleofnext.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://xhibition.co", 'NONE'))
monitors.push(new ShopifyMonitor("https://bbcicecream.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://atmosusa.com", 'NONE'))

for(let monitor of monitors) {
    monitor.monitor();
}