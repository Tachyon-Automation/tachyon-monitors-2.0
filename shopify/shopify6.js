let ShopifyMonitor = require('./base.js');
let monitors = [];
monitors.push(new ShopifyMonitor("https://plaskateboarding.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://thebettergeneration.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://shop.ccs.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://303boards.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://area51store.co.nz", 'NONE'))
monitors.push(new ShopifyMonitor("https://twofeetundr.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://chalicecollectibles.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://futurerfrnce.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://store.taylorswift.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://shopwss.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://ficegallery.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://ferraramarketinc.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://finalmouse.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://tcg-stadium.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://shopjustsports.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://laborskateshop.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://stay-rooted.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://leencustoms.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://futurerfrnce.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://extrabutterny.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://4ucaps.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://stussy.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://bbbranded.com", 'BBBRANDED'))
monitors.push(new ShopifyMonitor("https://pleasuresnow.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://35thnorth.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://calif.cc", 'NONE'))
monitors.push(new ShopifyMonitor("https://www.westnyc.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://juicestore.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://corporategotem.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://safari-zone.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://soleclassics.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://sneakerboxshop.ca", 'UNFILTEREDCA'))
monitors.push(new ShopifyMonitor("https://drinkprime.uk", 'NONE'))
monitors.push(new ShopifyMonitor("https://oqium.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://thenextdoor.fr", 'NONE'))
//
//
for(let monitor of monitors) {
    monitor.monitor();
}