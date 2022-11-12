let ShopifyMonitor = require('./base.js');
let monitors = [];
monitors.push(new ShopifyMonitor("https://leftfoot.com.sg", 'NONE'))
monitors.push(new ShopifyMonitor("https://noteshop.co.uk", 'NONE'))
monitors.push(new ShopifyMonitor("https://upriseskateshop.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://launch.starcowparis.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://it.slamjam.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://lacquer.jp", 'NONE'))
monitors.push(new ShopifyMonitor("https://shop.goodasgoldshop.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://stush.com.mx", 'NONE'))
monitors.push(new ShopifyMonitor("https://kicktheory.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://zulusgames.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://solestop.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://laced.com.au", 'NONE'))
monitors.push(new ShopifyMonitor("https://thepremierstore.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://eastsidegolf.com", 'NONE'))
//
//
for(let monitor of monitors) {
    monitor.monitor();
}