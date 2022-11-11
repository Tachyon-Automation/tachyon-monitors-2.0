const fetch = require('node-fetch');
const { v4 } = require('uuid');
const randomUseragent = require('random-useragent');
let sku = "650545386"
const fs = require('fs');
let site = `https://www.walmart.com/orchestra/pdp/graphql/ItemById/8d596c4780b45446d5ccf7c95e35e38080d857437182a6b1b4f3b964f9d4c298/ip/519253793?variables=%7B%22channel%22%3A%22WWW%22%2C%22pageType%22%3A%22ItemPageGlobal%22%2C%22tenant%22%3A%22WM_GLASS%22%2C%22version%22%3A%22v1%22%2C%22iId%22%3A%22519253793%22%2C%22layout%22%3A%5B%22itemDesktop%22%5D%2C%22tempo%22%3A%7B%22targeting%22%3A%22%257B%2522userState%2522%253A%2522loggedIn%2522%257D%22%2C%22params%22%3A%5B%7B%22key%22%3A%22expoVars%22%2C%22value%22%3A%22expoVariationValue%22%7D%2C%7B%22key%22%3A%22expoVars%22%2C%22value%22%3A%22expoVariationValue2%22%7D%5D%7D%2C%22p13N%22%3A%7B%22userClientInfo%22%3A%7B%22isZipLocated%22%3Atrue%2C%22deviceType%22%3A%22desktop%22%7D%2C%22userReqInfo%22%3A%7B%22refererContext%22%3A%7B%22source%22%3A%22itempage%22%7D%2C%22pageUrl%22%3A%22%2Fip%2FM-M-s-Snickers-Twix-Milk-Chocolate-Halloween-Candy-56-Ct-Bulk-Bag%2F519253793%22%7D%7D%2C%22p13nCls%22%3A%7B%22pageId%22%3A%22519253793%22%2C%22userClientInfo%22%3A%7B%22isZipLocated%22%3Atrue%7D%2C%22userReqInfo%22%3A%7B%22refererContext%22%3A%7B%22source%22%3A%22itempage%22%7D%7D%2C%22p13NCallType%22%3A%22ATF%22%7D%2C%22fBBAd%22%3Atrue%2C%22fSL%22%3Atrue%2C%22fIdml%22%3Atrue%2C%22fRev%22%3Atrue%2C%22fFit%22%3Atrue%2C%22fSeo%22%3Atrue%2C%22fP13%22%3Atrue%2C%22fAff%22%3Atrue%2C%22fMq%22%3Atrue%2C%22fGalAd%22%3Afalse%2C%22fSCar%22%3Atrue%2C%22fBB%22%3Atrue%2C%22fDis%22%3Atrue%2C%22eItIb%22%3Atrue%2C%22fIlc%22%3Afalse%2C%22includeLabelV1%22%3Afalse%7D`;
async function test() {
    let resp = await fetch("http://walmart.ca/api/ip/PRD79GILA89V5R8?isUPC=false&includePriceOfferAvailability=true&allOffers=true", {
        "headers": {
          "accept": "application/json",
          "Referer": "https://www.walmart.com/ip/M-M-s-Snickers-Twix-Milk-Chocolate-Halloween-Candy-56-Ct-Bulk-Bag/519253793",
          "Referrer-Policy": "strict-origin-when-cross-origin"
        },
        "body": null,
        "method": "GET"
      });
    console.log(resp.status)
    let body = await resp.json();
    console.log(body.data.product.name)
}
test()