let ShopifyMonitor = require('./base.js');
let monitors = [];
monitors.push(new ShopifyMonitor("https://cactusplantfleamarket.com", 'CPFM'))
monitors.push(new ShopifyMonitor("https://dtlr.com", 'DTLR'))
monitors.push(new ShopifyMonitor("https://kawsone.com", 'KAWS'))
monitors.push(new ShopifyMonitor("https://pesoclo.com", 'PESOCLO'))
monitors.push(new ShopifyMonitor("https://bape.com", 'BAPE'))
monitors.push(new ShopifyMonitor("https://checkout.funko.com", 'FUNKO'))
monitors.push(new ShopifyMonitor("https://eflash-us.doverstreetmarket.com", 'DSMUS'))
monitors.push(new ShopifyMonitor("https://eflash-sg.doverstreetmarket.com", 'DSMSG'))
monitors.push(new ShopifyMonitor("https://eflash-jp.doverstreetmarket.com", 'DSMJP'))
monitors.push(new ShopifyMonitor("https://eflash.doverstreetmarket.com", 'DSMUK'))
monitors.push(new ShopifyMonitor("https://shop-us.doverstreetmarket.com", 'DSMUS'))
monitors.push(new ShopifyMonitor("https://shop-sg.doverstreetmarket.com", 'DSMSG'))
monitors.push(new ShopifyMonitor("https://shop-jp.doverstreetmarket.com", 'DSMJP'))
for(let monitor of monitors) {
    monitor.monitor();
}