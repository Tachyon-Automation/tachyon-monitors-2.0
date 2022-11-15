let ShopifyMonitor = require('./base.js');
let monitors = [];
monitors.push(new ShopifyMonitor("https://kith.com", 'KITHUS'));
monitors.push(new ShopifyMonitor("https://eu.kith.com", 'KITHEU'))
monitors.push(new ShopifyMonitor("https://undefeated.com", 'UNDEFEATED'))
monitors.push(new ShopifyMonitor("https://shop.palaceskateboards.com", 'PALACEUK'))
monitors.push(new ShopifyMonitor("https://shop-usa.palaceskateboards.com", 'PALACEUS'))
monitors.push(new ShopifyMonitor("https://shoepalace.com", 'SHOEPALACE'))
monitors.push(new ShopifyMonitor("https://ycmc.com", 'YCMC'))
monitors.push(new ShopifyMonitor("https://packershoes.com", 'PACKER'))
monitors.push(new ShopifyMonitor("https://jimmyjazz.com", 'JIMMYJAZZ'))
monitors.push(new ShopifyMonitor("https://shopnicekicks.com", 'SNK'))
monitors.push(new ShopifyMonitor("https://exclusivefitted.com", 'EXCLUSIVEFITTED'))
monitors.push(new ShopifyMonitor("https://myfitteds.com", 'MYFITTEDS'))
monitors.push(new ShopifyMonitor("https://slamjam.com", 'SLAMJAM'),)
monitors.push(new ShopifyMonitor("https://shop.travisscott.com", 'TRAVIS'))
monitors.push(new ShopifyMonitor("https://cactusplantfleamarket.com", 'CPFM'))
monitors.push(new ShopifyMonitor("https://dtlr.com", 'DTLR'))
monitors.push(new ShopifyMonitor("https://kawsone.com", 'KAWS'))
monitors.push(new ShopifyMonitor("https://pesoclo.com", 'PESOCLO'))
monitors.push(new ShopifyMonitor("https://bape.com", 'BAPE'))
monitors.push(new ShopifyMonitor("https://checkout.funko.com", 'FUNKO'))
for(let monitor of monitors) {
    monitor.monitor();
}