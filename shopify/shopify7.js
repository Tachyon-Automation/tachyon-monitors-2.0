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
monitors.push(new ShopifyMonitor("https://solefly.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://asphaltgold.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://millenniumshoes.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://shopwss.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://likelihood.myshopify.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://uptherestore.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://wishatl.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://www.addictmiami.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://drifthouse.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://store.sony.com.my", 'NONE'))
monitors.push(new ShopifyMonitor("https://jetstore.com.mx", 'NONE'))
monitors.push(new ShopifyMonitor("https://capusa.nyc", 'NONE'))
monitors.push(new ShopifyMonitor("https://ldrs1354.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://minmaxgames.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://crownminded.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://embassy.co.nz", 'NONE'))
//
//
for(let monitor of monitors) {
    monitor.monitor();
}