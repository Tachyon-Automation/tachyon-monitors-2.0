let ShopifyMonitor = require('./base.js');
let monitors = [];
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