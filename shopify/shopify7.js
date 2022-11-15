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
monitors.push(new ShopifyMonitor("https://jbhifi.com.au", 'JBHIFI'))
monitors.push(new ShopifyMonitor("https://eflash-us.doverstreetmarket.com", 'DSMUS'))
monitors.push(new ShopifyMonitor("https://eflash-sg.doverstreetmarket.com", 'DSMSG'))
monitors.push(new ShopifyMonitor("https://eflash-jp.doverstreetmarket.com", 'DSMJP'))
monitors.push(new ShopifyMonitor("https://eflash.doverstreetmarket.com", 'DSMUK'))
monitors.push(new ShopifyMonitor("https://shop-us.doverstreetmarket.com", 'DSMUS'))
monitors.push(new ShopifyMonitor("https://shop-sg.doverstreetmarket.com", 'DSMSG'))
monitors.push(new ShopifyMonitor("https://shop-jp.doverstreetmarket.com", 'DSMJP'))
//
//
for(let monitor of monitors) {
    monitor.monitor();
}