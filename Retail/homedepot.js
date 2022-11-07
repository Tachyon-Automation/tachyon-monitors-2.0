const helper = require('../x-help/helper');
const groups = require('../x-help/groups.json');
const database = require('../x-help/database');
const discordBot = require('../x-help/discord')
const randomUseragent = require('random-useragent');
const fs = require('fs');
const HTMLParser = require('node-html-parser');
const Discord = require('discord.js');
const { v4 } = require('uuid');
const CHANNEL = '833822048467025920' //channel id
const site = 'HOMEDEPOT'; //site name
const catagory = 'RETAIL'
const version = `Homedepot v1.0` //Site version
const table = site.toLowerCase();
discordBot.login();
let PRODUCTS = {}
startMonitoring()
async function startMonitoring() {
    let SKUList = await database.query(`SELECT * from ${table}`);
    for (let row of SKUList.rows) {
        PRODUCTS[row.sku] = {
            sku: row.sku,
            waittime: row.waittime,
            sizes: row.sizes
        }
        monitor(row.sku)
    }
    console.log(`[${site}] Monitoring all SKUs!`)
}

async function monitor(sku) {
    try {
        let product = PRODUCTS[sku]
        if (!product)
            return;
        let proxy = 'http://usa.rotating.proxyrack.net:9000' //proxy per site
        let headers = {
            'User-Agent': randomUseragent.getRandom(),
            'Content-Type': 'application/json',
            'x-experience-name': 'general-merchandise'
        }
        let body3 = {
            "operationName": "productClientOnlyProduct",
            "variables": {
              "skipSpecificationGroup": false,
              "skipSubscribeAndSave": false,
              "skipKPF": false,
              "skipInstallServices": true,
              "itemId": sku,
              "storeId": "1273",
              "zipCode": "14621"
            },
            "query": "query productClientOnlyProduct($storeId: String, $zipCode: String, $quantity: Int, $itemId: String!, $dataSource: String, $loyaltyMembershipInput: LoyaltyMembershipInput, $skipSpecificationGroup: Boolean = false, $skipSubscribeAndSave: Boolean = false, $skipKPF: Boolean = false, $skipInstallServices: Boolean = true) {\n  product(itemId: $itemId, dataSource: $dataSource, loyaltyMembershipInput: $loyaltyMembershipInput) {\n    fulfillment(storeId: $storeId, zipCode: $zipCode, quantity: $quantity) {\n      backordered\n      fulfillmentOptions {\n        type\n        services {\n          type\n          locations {\n            isAnchor\n            locationId\n            inventory {\n              isOutOfStock\n              quantity\n              isInStock\n              isLimitedQuantity\n              isUnavailable\n              maxAllowedBopisQty\n              minAllowedBopisQty\n              __typename\n            }\n            curbsidePickupFlag\n            isBuyInStoreCheckNearBy\n            distance\n            storeName\n            state\n            type\n            storePhone\n            __typename\n          }\n          hasFreeShipping\n          freeDeliveryThreshold\n          optimalFulfillment\n          deliveryTimeline\n          deliveryDates {\n            startDate\n            endDate\n            __typename\n          }\n          deliveryCharge\n          dynamicEta {\n            hours\n            minutes\n            __typename\n          }\n          totalCharge\n          __typename\n        }\n        fulfillable\n        __typename\n      }\n      backorderedShipDate\n      bossExcludedShipStates\n      excludedShipStates\n      seasonStatusEligible\n      anchorStoreStatus\n      anchorStoreStatusType\n      sthExcludedShipState\n      bossExcludedShipState\n      onlineStoreStatus\n      onlineStoreStatusType\n      inStoreAssemblyEligible\n      __typename\n    }\n    info {\n      dotComColorEligible\n      hidePrice\n      ecoRebate\n      quantityLimit\n      sskMin\n      sskMax\n      unitOfMeasureCoverage\n      wasMaxPriceRange\n      wasMinPriceRange\n      fiscalYear\n      productDepartment\n      classNumber\n      forProfessionalUseOnly\n      globalCustomConfigurator {\n        customButtonText\n        customDescription\n        customExperience\n        customExperienceUrl\n        customTitle\n        __typename\n      }\n      paintBrand\n      movingCalculatorEligible\n      label\n      prop65Warning\n      returnable\n      hasSubscription\n      isBuryProduct\n      isSponsored\n      isGenericProduct\n      isLiveGoodsProduct\n      sponsoredBeacon {\n        onClickBeacon\n        onViewBeacon\n        __typename\n      }\n      sponsoredMetadata {\n        campaignId\n        placementId\n        slotId\n        __typename\n      }\n      productSubType {\n        name\n        link\n        __typename\n      }\n      categoryHierarchy\n      samplesAvailable\n      customerSignal {\n        previouslyPurchased\n        __typename\n      }\n      productDepartmentId\n      augmentedReality\n      swatches {\n        isSelected\n        itemId\n        label\n        swatchImgUrl\n        url\n        value\n        __typename\n      }\n      totalNumberOfOptions\n      recommendationFlags {\n        visualNavigation\n        pipCollections\n        packages\n        ACC\n        __typename\n      }\n      pipCalculator {\n        toggle\n        coverageUnits\n        display\n        publisher\n        __typename\n      }\n      replacementOMSID\n      minimumOrderQuantity\n      projectCalculatorEligible\n      subClassNumber\n      calculatorType\n      protectionPlanSku\n      hasServiceAddOns\n      consultationType\n      __typename\n    }\n    identifiers {\n      skuClassification\n      canonicalUrl\n      brandName\n      itemId\n      modelNumber\n      productLabel\n      storeSkuNumber\n      upcGtin13\n      specialOrderSku\n      toolRentalSkuNumber\n      rentalCategory\n      rentalSubCategory\n      upc\n      productType\n      isSuperSku\n      parentId\n      roomVOEnabled\n      sampleId\n      __typename\n    }\n    itemId\n    dataSources\n    availabilityType {\n      discontinued\n      status\n      type\n      buyable\n      __typename\n    }\n    details {\n      description\n      collection {\n        url\n        collectionId\n        name\n        __typename\n      }\n      highlights\n      descriptiveAttributes {\n        name\n        value\n        bulleted\n        sequence\n        __typename\n      }\n      additionalResources {\n        infoAndGuides {\n          name\n          url\n          __typename\n        }\n        installationAndRentals {\n          contentType\n          name\n          url\n          __typename\n        }\n        diyProjects {\n          contentType\n          name\n          url\n          __typename\n        }\n        __typename\n      }\n      installation {\n        leadGenUrl\n        __typename\n      }\n      __typename\n    }\n    media {\n      images {\n        url\n        type\n        subType\n        sizes\n        __typename\n      }\n      video {\n        shortDescription\n        thumbnail\n        url\n        videoStill\n        link {\n          text\n          url\n          __typename\n        }\n        title\n        type\n        videoId\n        longDescription\n        __typename\n      }\n      threeSixty {\n        id\n        url\n        __typename\n      }\n      augmentedRealityLink {\n        usdz\n        image\n        __typename\n      }\n      richContent {\n        content\n        displayMode\n        richContentSource\n        salsifyRichContent\n        __typename\n      }\n      __typename\n    }\n    pricing(storeId: $storeId) {\n      promotion {\n        dates {\n          end\n          start\n          __typename\n        }\n        type\n        description {\n          shortDesc\n          longDesc\n          __typename\n        }\n        dollarOff\n        percentageOff\n        savingsCenter\n        savingsCenterPromos\n        specialBuySavings\n        specialBuyDollarOff\n        specialBuyPercentageOff\n        experienceTag\n        subExperienceTag\n        itemList\n        reward {\n          tiers {\n            minPurchaseAmount\n            minPurchaseQuantity\n            rewardPercent\n            rewardAmountPerOrder\n            rewardAmountPerItem\n            rewardFixedPrice\n            __typename\n          }\n          __typename\n        }\n        nvalues\n        brandRefinementId\n        __typename\n      }\n      value\n      alternatePriceDisplay\n      alternate {\n        bulk {\n          pricePerUnit\n          thresholdQuantity\n          value\n          __typename\n        }\n        unit {\n          caseUnitOfMeasure\n          unitsOriginalPrice\n          unitsPerCase\n          value\n          __typename\n        }\n        __typename\n      }\n      original\n      mapAboveOriginalPrice\n      message\n      preferredPriceFlag\n      specialBuy\n      unitOfMeasure\n      conditionalPromotions {\n        dates {\n          start\n          end\n          __typename\n        }\n        description {\n          shortDesc\n          longDesc\n          __typename\n        }\n        experienceTag\n        subExperienceTag\n        eligibilityCriteria {\n          itemGroup\n          minPurchaseAmount\n          minPurchaseQuantity\n          relatedSkusCount\n          omsSkus\n          __typename\n        }\n        reward {\n          tiers {\n            minPurchaseAmount\n            minPurchaseQuantity\n            rewardPercent\n            rewardAmountPerOrder\n            rewardAmountPerItem\n            rewardFixedPrice\n            __typename\n          }\n          __typename\n        }\n        nvalues\n        brandRefinementId\n        __typename\n      }\n      __typename\n    }\n    reviews {\n      ratingsReviews {\n        averageRating\n        totalReviews\n        __typename\n      }\n      __typename\n    }\n    seo {\n      seoKeywords\n      seoDescription\n      __typename\n    }\n    specificationGroup @skip(if: $skipSpecificationGroup) {\n      specifications {\n        specName\n        specValue\n        __typename\n      }\n      specTitle\n      __typename\n    }\n    taxonomy {\n      breadCrumbs {\n        label\n        url\n        browseUrl\n        creativeIconUrl\n        deselectUrl\n        dimensionName\n        refinementKey\n        __typename\n      }\n      brandLinkUrl\n      __typename\n    }\n    favoriteDetail {\n      count\n      __typename\n    }\n    sizeAndFitDetail {\n      attributeGroups {\n        attributes {\n          attributeName\n          dimensions\n          __typename\n        }\n        dimensionLabel\n        productType\n        __typename\n      }\n      __typename\n    }\n    subscription @skip(if: $skipSubscribeAndSave) {\n      defaultfrequency\n      discountPercentage\n      subscriptionEnabled\n      __typename\n    }\n    badges(storeId: $storeId) {\n      label\n      name\n      color\n      creativeImageUrl\n      endDate\n      message\n      timerDuration\n      timer {\n        timeBombThreshold\n        daysLeftThreshold\n        dateDisplayThreshold\n        message\n        __typename\n      }\n      __typename\n    }\n    keyProductFeatures @skip(if: $skipKPF) {\n      keyProductFeaturesItems {\n        features {\n          name\n          refinementId\n          refinementUrl\n          value\n          __typename\n        }\n        __typename\n      }\n      __typename\n    }\n    dataSource\n    installServices(storeId: $storeId, zipCode: $zipCode) @skip(if: $skipInstallServices) {\n      scheduleAMeasure\n      gccCarpetDesignAndOrderEligible\n      __typename\n    }\n    projectDetails {\n      projectId\n      __typename\n    }\n    seoDescription\n    __typename\n  }\n}\n"
          }
        let method = 'POST'; //request method
        let req = `https://www.homedepot.com/federation-gateway/graphql?opname=productClientOnlyProduct`//request url
        let set = await helper.requestJson3(req, method, proxy, headers, body3)
        //console.log(set.response.status)
        if (set.response.status != 200) {
            monitor(sku);
            return
        }
        let body = await set.json //request function
        let status = PRODUCTS[sku].sizes
        if (body.data.product.fulfillment.fulfillmentOptions[1].fulfillable) {
            let url = `https://www.homedepot.com/p/tachyon/${sku}#Tachyon`
            let title = body.data.product.identifiers.productLabel
            let price = '$' + body.data.product.pricing.value
            let image = body.data.product.media.images[0].url.replace('<SIZE>','500')
            let stock = body.data.product.fulfillment.fulfillmentOptions[1].services[0].locations[0].inventory.quantity
            if (status !== "In-Stock") {
                let sites = await helper.dbconnect(catagory+site)
                let qt = 'NA'
                let links = `[ATC](https://www.homedepot.com/p/tachyon/${sku}#Tachyon)`
                console.log(`[time: ${new Date().toISOString()}, product: ${sku}, title: ${title}]`)
                for (let group of sites) {
                    await helper.postRetail(url, title, sku, price, image, stock, group, version, qt, links)
                }
                PRODUCTS[sku].sizes = 'In-Stock'
                await database.query(`update ${table} set sizes='In-Stock' where sku='${sku}'`)
            }
        } else {
            if (status !== "Out-of-Stock") {
                PRODUCTS[sku].sizes = 'Out-of-Stock'
                await database.query(`update ${table} set sizes='Out-of-Stock' where sku='${sku}'`)
            }
        }
        await helper.sleep(product.waittime);
        monitor(sku);
        return
    } catch (e) {
        //console.log(e)
        monitor(sku)
        return
    }
}
helper.discordbot(CHANNEL, PRODUCTS, table, monitor, site)
