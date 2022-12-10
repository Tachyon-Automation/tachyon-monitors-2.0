const helper = require('./x-help/helper');
const fs = require('fs');
const database = require('./x-help/database');
const HTMLParser = require('node-html-parser');
const Discord = require('discord.js');
const randomUseragent = require('random-useragent');
const table = 'amazondeal'
const { v4 } = require('uuid');
let offset = 0
let success = 0
let loads = [
  `widgetConfig=%257B%2522query%2522%253A%257B%2522queryType%2522%253A%2522AND%2522%252C%2522conditions%2522%253A%255B%257B%2522queryType%2522%253A%2522OR%2522%252C%2522conditions%2522%253A%255B%257B%2522conditionType%2522%253A%2522MERCHANT%2522%252C%2522values%2522%253A%255B%2522ATVPDKIKX0DER%2522%255D%257D%255D%257D%252C%257B%2522queryType%2522%253A%2522OR%2522%252C%2522conditions%2522%253A%255B%257B%2522conditionType%2522%253A%2522BROWSE%2522%252C%2522values%2522%253A%255B%25221063236%2522%255D%257D%255D%257D%255D%257D%252C%2522sortType%2522%253A%2522MOST_POPULAR%2522%252C%2522title%2522%253A%2522Bath%2522%252C%2522moreCouponLinkUrl%2522%253A%2522https%253A%252F%252Fwww.amazon.com%252Fs%253Fi%253Dgarden%2526srs%253D2231352011%2526bbn%253D1063236%2526rh%253Dn%25253A1055398%25252Cn%25253A1063498%25252Cn%25253A1063236%25252Cp_85%25253A2470955011%25252Cp_72%25253A1248916011%2526dc%2526qid%253D1574754551%2526rnid%253D1248913011%2526ref%253Dsr_nr_p_72_2%2522%252C%2522moreCouponLinkText%2522%253A%2522%255Bsee%2520all%255D%2522%252C%2522showSort%2522%253A%25220%2522%252C%2522preRenderCouponCount%2522%253A%252210%2522%252C%2522couponsPerPage%2522%253A%2522200%2522%252C%2522maxCouponsPerRequest%2522%253A%252230%2522%252C%2522excludedPromotionIds%2522%253A%255B%255D%252C%2522promotionIds%2522%253A%255B%255D%252C%2522recentOrExpiring%2522%253A%2522recent%2522%252C%2522creativeId%2522%253A%2522b9989f69-c91e-4852-a676-5ffc7f69bfbd%2522%252C%2522placementId%2522%253A%2522a0b962fd-fb21-4e15-b8ad-c69444f1de74%2522%257D&offset=3000&limit=3000&widgetType=SHOVELER&sortType=MOST_POPULAR`,
  `widgetConfig=%257B%2522query%2522%253A%257B%2522queryType%2522%253A%2522AND%2522%252C%2522conditions%2522%253A%255B%255D%257D%252C%2522sortType%2522%253A%2522MOST_POPULAR%2522%252C%2522homePageLinkUrl%2522%253A%2522%252Fcoupons%252Fb%252F%253Fnode%255Cu003d2231352011%2522%252C%2522moreCouponLinkUrl%2522%253A%2522www.amazon.com%252Fcoupons%2522%252C%2522showSort%2522%253A%25220%2522%252C%2522preRenderCouponCount%2522%253A%252210%2522%252C%2522couponsPerPage%2522%253A%252230%2522%252C%2522maxCouponsPerRequest%2522%253A%252230%2522%252C%2522excludedPromotionIds%2522%253A%255B%255D%252C%2522promotionIds%2522%253A%255B%255D%252C%2522recentOrExpiring%2522%253A%2522recent%2522%252C%2522creativeId%2522%253A%25228ea93716-9eba-3fcb-8257-ad599d073611%2522%252C%2522placementId%2522%253A%25222ab886e2-b523-4eac-8dba-c8263602a388%2522%257D&limit=3000&offset=3000&sortType=NEWEST&actionTrigger=showMoreButton&filter=%257B%2522queryType%2522%253A%2522AND%2522%252C%2522conditions%2522%253A%255B%257B%2522queryType%2522%253A%2522OR%2522%252C%2522conditions%2522%253A%255B%257B%2522conditionType%2522%253A%2522GL%2522%252C%2522values%2522%253A%255B%252221%2522%252C%252275%2522%255D%257D%255D%257D%252C%257B%2522queryType%2522%253A%2522OR%2522%252C%2522conditions%2522%253A%255B%257B%2522conditionType%2522%253A%2522BROWSE%2522%252C%2522values%2522%253A%255B%2522251909011%2522%252C%25221263206011%2522%252C%25221263207011%2522%252C%2522166220011%2522%252C%2522276729011%2522%252C%2522165993011%2522%252C%2522166057011%2522%252C%2522196601011%2522%252C%2522166092011%2522%252C%2522166118011%2522%252C%2522166316011%2522%252C%2522166164011%2522%252C%2522166220011%2522%252C%2522166210011%2522%252C%2522166359011%2522%252C%2522166420011%2522%252C%2522166461011%2522%252C%2522256994011%2522%252C%2522166508011%2522%252C%2522166099011%2522%252C%2522165796011%2522%255D%257D%255D%257D%255D%257D&widgetType=CATEGORY_BAR`,
  `widgetConfig=%257B%2522query%2522%253A%257B%2522queryType%2522%253A%2522AND%2522%252C%2522conditions%2522%253A%255B%257B%2522queryType%2522%253A%2522OR%2522%252C%2522conditions%2522%253A%255B%257B%2522conditionType%2522%253A%2522BROWSE%2522%252C%2522values%2522%253A%255B%25221063278%2522%252C%25221063252%2522%252C%25221063306%2522%252C%25223736081%2522%255D%257D%255D%257D%255D%257D%252C%2522sortType%2522%253A%2522MOST_POPULAR%2522%252C%2522title%2522%253A%2522Home%2522%252C%2522moreCouponLinkUrl%2522%253A%2522https%253A%252F%252Fwww.amazon.com%252Fb%253Fnode%253D20533017011%2522%252C%2522moreCouponLinkText%2522%253A%2522%255Bsee%2520all%255D%2522%252C%2522showSort%2522%253A%25220%2522%252C%2522preRenderCouponCount%2522%253A%252210%2522%252C%2522couponsPerPage%2522%253A%2522200%2522%252C%2522maxCouponsPerRequest%2522%253A%252230%2522%252C%2522excludedPromotionIds%2522%253A%255B%255D%252C%2522promotionIds%2522%253A%255B%255D%252C%2522recentOrExpiring%2522%253A%2522recent%2522%252C%2522creativeId%2522%253A%25222a589dec-1874-4a22-ad8f-8aaa171b5c31%2522%252C%2522placementId%2522%253A%2522a7223ff1-34be-4c27-959b-5b7ca3e15d9e%2522%257D&offset=3000&limit=3000&widgetType=SHOVELER&sortType=MOST_POPULAR`,
  `widgetConfig=%257B%2522query%2522%253A%257B%2522queryType%2522%253A%2522AND%2522%252C%2522conditions%2522%253A%255B%255D%257D%252C%2522sortType%2522%253A%2522MOST_POPULAR%2522%252C%2522homePageLinkUrl%2522%253A%2522%252Fcoupons%252Fb%252F%253Fnode%255Cu003d2231352011%2522%252C%2522moreCouponLinkUrl%2522%253A%2522www.amazon.com%252Fcoupons%2522%252C%2522showSort%2522%253A%25220%2522%252C%2522preRenderCouponCount%2522%253A%252210%2522%252C%2522couponsPerPage%2522%253A%252230%2522%252C%2522maxCouponsPerRequest%2522%253A%252230%2522%252C%2522excludedPromotionIds%2522%253A%255B%255D%252C%2522promotionIds%2522%253A%255B%255D%252C%2522recentOrExpiring%2522%253A%2522recent%2522%252C%2522creativeId%2522%253A%25226648c6af-03dd-3dab-a725-f65ded99642c%2522%252C%2522placementId%2522%253A%2522e3bad1b0-418b-42c7-a31a-98fe90bb60b8%2522%257D&limit=3000&offset=3000&sortType=NEWEST&actionTrigger=showMoreButton&filter=%257B%2522queryType%2522%253A%2522AND%2522%252C%2522conditions%2522%253A%255B%257B%2522queryType%2522%253A%2522OR%2522%252C%2522conditions%2522%253A%255B%257B%2522conditionType%2522%253A%2522GL%2522%252C%2522values%2522%253A%255B%2522263%2522%252C%2522328%2522%255D%257D%255D%257D%255D%257D&widgetType=CATEGORY_BAR`,
  `widgetConfig=%257B%2522query%2522%253A%257B%2522queryType%2522%253A%2522AND%2522%252C%2522conditions%2522%253A%255B%255D%257D%252C%2522sortType%2522%253A%2522MOST_POPULAR%2522%252C%2522homePageLinkUrl%2522%253A%2522%252Fcoupons%252Fb%252F%253Fnode%255Cu003d2231352011%2522%252C%2522moreCouponLinkUrl%2522%253A%2522www.amazon.com%252Fcoupons%2522%252C%2522showSort%2522%253A%25220%2522%252C%2522preRenderCouponCount%2522%253A%252210%2522%252C%2522couponsPerPage%2522%253A%252230%2522%252C%2522maxCouponsPerRequest%2522%253A%252230%2522%252C%2522excludedPromotionIds%2522%253A%255B%255D%252C%2522promotionIds%2522%253A%255B%255D%252C%2522recentOrExpiring%2522%253A%2522recent%2522%252C%2522creativeId%2522%253A%25224759a588-2bd8-391e-ac45-e715555faa85%2522%252C%2522placementId%2522%253A%25220e19d832-1687-40a9-aa19-aff8d265a37f%2522%257D&limit=3000&offset=3000&sortType=NEWEST&actionTrigger=showMoreButton&filter=%257B%2522queryType%2522%253A%2522AND%2522%252C%2522conditions%2522%253A%255B%257B%2522queryType%2522%253A%2522OR%2522%252C%2522conditions%2522%253A%255B%257B%2522conditionType%2522%253A%2522GL%2522%252C%2522values%2522%253A%255B%2522194%2522%255D%257D%255D%257D%255D%257D&widgetType=CATEGORY_BAR`,
  `widgetConfig=%257B%2522query%2522%253A%257B%2522queryType%2522%253A%2522AND%2522%252C%2522conditions%2522%253A%255B%257B%2522queryType%2522%253A%2522OR%2522%252C%2522conditions%2522%253A%255B%257B%2522conditionType%2522%253A%2522BROWSE%2522%252C%2522values%2522%253A%255B%2522553760%2522%255D%257D%255D%257D%255D%257D%252C%2522sortType%2522%253A%2522MOST_POPULAR%2522%252C%2522title%2522%253A%2522Grills%2520%2526%2520Outdoor%2520Cooking%2522%252C%2522moreCouponLinkUrl%2522%253A%2522https%253A%252F%252Fwww.amazon.com%252Fs%253Fi%253Dlawngarden%2526srs%253D2231352011%2526bbn%253D3238155011%2526rh%253Dn%25253A2972638011%25252Cn%25253A%2525213238155011%25252Cn%25253A553760%25252Cp_72%25253A2661619011%25252Cp_85%25253A2470955011%2526dc%2526fst%253Das%25253Aoff%2526qid%253D1574837777%2526rnid%253D3238155011%2526ref%253Dsr_nr_n_4%2522%252C%2522moreCouponLinkText%2522%253A%2522%255Bsee%2520all%255D%2522%252C%2522showSort%2522%253A%25220%2522%252C%2522preRenderCouponCount%2522%253A%252210%2522%252C%2522couponsPerPage%2522%253A%2522200%2522%252C%2522maxCouponsPerRequest%2522%253A%252230%2522%252C%2522excludedPromotionIds%2522%253A%255B%255D%252C%2522promotionIds%2522%253A%255B%255D%252C%2522recentOrExpiring%2522%253A%2522recent%2522%252C%2522creativeId%2522%253A%25222551ed66-412a-424d-bc1c-70c68b7242f7%2522%252C%2522placementId%2522%253A%2522b5426810-2489-4def-a6d8-819ccc4ef545%2522%257D&offset=3000&limit=3000&widgetType=SHOVELER&sortType=MOST_POPULAR`,
  `widgetConfig=%257B%2522query%2522%253A%257B%2522queryType%2522%253A%2522AND%2522%252C%2522conditions%2522%253A%255B%257B%2522queryType%2522%253A%2522OR%2522%252C%2522conditions%2522%253A%255B%257B%2522conditionType%2522%253A%2522BROWSE%2522%252C%2522values%2522%253A%255B%2522553824%2522%255D%257D%255D%257D%255D%257D%252C%2522sortType%2522%253A%2522MOST_POPULAR%2522%252C%2522title%2522%253A%2522Patio%2520Furniture%2522%252C%2522moreCouponLinkUrl%2522%253A%2522https%253A%252F%252Fwww.amazon.com%252Fs%253Fi%253Dlawngarden%2526srs%253D2231352011%2526bbn%253D553824%2526rh%253Dn%25253A2972638011%25252Cn%25253A3238155011%25252Cn%25253A553824%25252Cp_72%25253A2661619011%25252Cp_85%25253A2470955011%2526dc%2526fst%253Das%25253Aoff%2526qid%253D1574837661%2526rnid%253D2470954011%2526ref%253Dsr_nr_p_85_1%2522%252C%2522moreCouponLinkText%2522%253A%2522%255Bsee%2520all%255D%2522%252C%2522showSort%2522%253A%25220%2522%252C%2522preRenderCouponCount%2522%253A%252210%2522%252C%2522couponsPerPage%2522%253A%2522200%2522%252C%2522maxCouponsPerRequest%2522%253A%252230%2522%252C%2522excludedPromotionIds%2522%253A%255B%255D%252C%2522promotionIds%2522%253A%255B%255D%252C%2522recentOrExpiring%2522%253A%2522recent%2522%252C%2522creativeId%2522%253A%2522537b3e46-7253-457c-9611-38ffa56c954c%2522%252C%2522placementId%2522%253A%2522108271e4-ee56-4823-b4a9-0c8ac81e735b%2522%257D&offset=3000&limit=3000&widgetType=SHOVELER&sortType=MOST_POPULAR`,
  `widgetConfig=%257B%2522query%2522%253A%257B%2522queryType%2522%253A%2522AND%2522%252C%2522conditions%2522%253A%255B%257B%2522queryType%2522%253A%2522OR%2522%252C%2522conditions%2522%253A%255B%257B%2522conditionType%2522%253A%2522GL%2522%252C%2522values%2522%253A%255B%252223%2522%252C%2522422%2522%255D%257D%255D%257D%255D%257D%252C%2522sortType%2522%253A%2522MOST_POPULAR%2522%252C%2522title%2522%253A%2522Electronics%2522%252C%2522moreCouponLinkUrl%2522%253A%2522%252Fb%253Fnode%253D20338622011%2522%252C%2522moreCouponLinkText%2522%253A%2522%255Bsee%2520all%2520coupons%255D%2522%252C%2522showSort%2522%253A%2522%2522%252C%2522preRenderCouponCount%2522%253A%252210%2522%252C%2522couponsPerPage%2522%253A%2522200%2522%252C%2522maxCouponsPerRequest%2522%253A%252230%2522%252C%2522excludedPromotionIds%2522%253A%255B%255D%252C%2522promotionIds%2522%253A%255B%255D%252C%2522recentOrExpiring%2522%253A%2522recent%2522%252C%2522creativeId%2522%253A%25221ea5f450-31a1-4e0e-9806-2605fff607e1%2522%252C%2522placementId%2522%253A%2522fd9888e4-3a9a-48ee-adc3-73075e45c5d1%2522%257D&offset=3000&limit=3000&widgetType=SHOVELER&sortType=MOST_POPULAR`,
  `widgetConfig=%257B%2522query%2522%253A%257B%2522queryType%2522%253A%2522AND%2522%252C%2522conditions%2522%253A%255B%257B%2522queryType%2522%253A%2522OR%2522%252C%2522conditions%2522%253A%255B%257B%2522conditionType%2522%253A%2522BROWSE%2522%252C%2522values%2522%253A%255B%252212653393011%2522%255D%257D%255D%257D%255D%257D%252C%2522sortType%2522%253A%2522DISCOUNT_PERCENTAGE%2522%252C%2522title%2522%253A%2522Renewed%2522%252C%2522moreCouponLinkUrl%2522%253A%2522%252Fb%253Fnode%253D20338264011%2522%252C%2522moreCouponLinkText%2522%253A%2522%255BSee%2520more%255D%2522%252C%2522showSort%2522%253A%25220%2522%252C%2522preRenderCouponCount%2522%253A%252210%2522%252C%2522couponsPerPage%2522%253A%2522200%2522%252C%2522maxCouponsPerRequest%2522%253A%252230%2522%252C%2522excludedPromotionIds%2522%253A%255B%2522A3PKEMQZNA0PM9%2522%252C%2522ACUWQ26J4D2N8%2522%252C%2522A2XAY1UXOYXCZJ%2522%252C%2522A2B8JHOJXRKP6T%2522%252C%2522A3VFHBINP3BF7A%2522%252C%2522AEEZKBTSWWW9Y%2522%252C%2522A2XAY1UXOYXCZJ%2522%255D%252C%2522promotionIds%2522%253A%255B%255D%252C%2522recentOrExpiring%2522%253A%2522recent%2522%252C%2522creativeId%2522%253A%252266d1e1c3-37dd-427c-9e11-df6a3f129166%2522%252C%2522placementId%2522%253A%2522a49a9d98-52b8-4196-93fa-7b7146c71761%2522%257D&offset=3000&limit=3000&widgetType=SHOVELER&sortType=DISCOUNT_PERCENTAGE`,
  `widgetConfig=%257B%2522query%2522%253A%257B%2522queryType%2522%253A%2522AND%2522%252C%2522conditions%2522%253A%255B%257B%2522queryType%2522%253A%2522OR%2522%252C%2522conditions%2522%253A%255B%257B%2522conditionType%2522%253A%2522GL%2522%252C%2522values%2522%253A%255B%2522193%2522%252C%2522309%2522%252C%2522197%2522%255D%257D%255D%257D%255D%257D%252C%2522sortType%2522%253A%2522MOST_POPULAR%2522%252C%2522title%2522%253A%2522Fashion%2522%252C%2522moreCouponLinkUrl%2522%253A%2522%252Fb%253Fnode%253D20361684011%2522%252C%2522moreCouponLinkText%2522%253A%2522%255Bsee%2520all%255D%2522%252C%2522showSort%2522%253A%2522%2522%252C%2522preRenderCouponCount%2522%253A%252210%2522%252C%2522couponsPerPage%2522%253A%2522200%2522%252C%2522maxCouponsPerRequest%2522%253A%252230%2522%252C%2522excludedPromotionIds%2522%253A%255B%255D%252C%2522promotionIds%2522%253A%255B%255D%252C%2522recentOrExpiring%2522%253A%2522recent%2522%252C%2522creativeId%2522%253A%252211030cd5-6790-4261-aaf0-6e50ed984cb7%2522%252C%2522placementId%2522%253A%2522a2d46f10-58ea-4adc-a8b1-93fa81fb2e9b%2522%257D&offset=3000&limit=3000&widgetType=SHOVELER&sortType=MOST_POPULAR`,
  `widgetConfig=%257B%2522query%2522%253A%257B%2522queryType%2522%253A%2522AND%2522%252C%2522conditions%2522%253A%255B%257B%2522queryType%2522%253A%2522OR%2522%252C%2522conditions%2522%253A%255B%257B%2522conditionType%2522%253A%2522GL%2522%252C%2522values%2522%253A%255B%2522121%2522%252C%2522364%2522%255D%257D%255D%257D%252C%257B%2522queryType%2522%253A%2522OR%2522%252C%2522conditions%2522%253A%255B%257B%2522conditionType%2522%253A%2522PROGRAM%2522%252C%2522values%2522%253A%255B%2522none%2522%255D%257D%255D%257D%255D%257D%252C%2522sortType%2522%253A%2522MOST_POPULAR%2522%252C%2522title%2522%253A%2522Personal%2520Care%2520%2526%2520Daily%2520Essentials%2522%252C%2522moreCouponLinkUrl%2522%253A%2522%252Fb%253Fnode%253D13213779011%2522%252C%2522moreCouponLinkText%2522%253A%2522%255BSee%2520more%255D%2522%252C%2522showSort%2522%253A%2522%2522%252C%2522preRenderCouponCount%2522%253A%252210%2522%252C%2522couponsPerPage%2522%253A%2522200%2522%252C%2522maxCouponsPerRequest%2522%253A%252230%2522%252C%2522excludedPromotionIds%2522%253A%255B%255D%252C%2522promotionIds%2522%253A%255B%255D%252C%2522recentOrExpiring%2522%253A%2522recent%2522%252C%2522creativeId%2522%253A%25222e03fd9d-f9fd-4b6b-9ab0-9f587013ee92%2522%252C%2522placementId%2522%253A%252231a7b288-c7aa-4889-9721-fd62ea7811b3%2522%257D&offset=3000&limit=3000&widgetType=SHOVELER&sortType=MOST_POPULAR`,
  `widgetConfig=%257B%2522query%2522%253A%257B%2522queryType%2522%253A%2522AND%2522%252C%2522conditions%2522%253A%255B%257B%2522queryType%2522%253A%2522OR%2522%252C%2522conditions%2522%253A%255B%257B%2522conditionType%2522%253A%2522GL%2522%252C%2522values%2522%253A%255B%2522325%2522%252C%2522251%2522%255D%257D%255D%257D%252C%257B%2522queryType%2522%253A%2522OR%2522%252C%2522conditions%2522%253A%255B%257B%2522conditionType%2522%253A%2522PROGRAM%2522%252C%2522values%2522%253A%255B%2522none%2522%255D%257D%255D%257D%255D%257D%252C%2522sortType%2522%253A%2522MOST_POPULAR%2522%252C%2522title%2522%253A%2522Grocery%2520and%2520Gourmet%2522%252C%2522moreCouponLinkUrl%2522%253A%2522%252Fb%253Fnode%253D20361669011%2522%252C%2522moreCouponLinkText%2522%253A%2522%255BSee%2520more%2520coupons%255D%2522%252C%2522showSort%2522%253A%2522%2522%252C%2522preRenderCouponCount%2522%253A%252210%2522%252C%2522couponsPerPage%2522%253A%2522200%2522%252C%2522maxCouponsPerRequest%2522%253A%252230%2522%252C%2522excludedPromotionIds%2522%253A%255B%255D%252C%2522promotionIds%2522%253A%255B%255D%252C%2522recentOrExpiring%2522%253A%2522recent%2522%252C%2522creativeId%2522%253A%2522b65b7f29-96e9-499f-b62f-97e0cea5993f%2522%252C%2522placementId%2522%253A%2522e77b81cd-135a-4c51-ac3d-94cf5292b332%2522%257D&offset=3000&limit=3000&widgetType=SHOVELER&sortType=MOST_POPULAR`,
  `widgetConfig=%257B%2522query%2522%253A%257B%2522queryType%2522%253A%2522AND%2522%252C%2522conditions%2522%253A%255B%257B%2522queryType%2522%253A%2522OR%2522%252C%2522conditions%2522%253A%255B%257B%2522conditionType%2522%253A%2522BROWSE%2522%252C%2522values%2522%253A%255B%25226563140011%2522%255D%257D%255D%257D%255D%257D%252C%2522sortType%2522%253A%2522MOST_POPULAR%2522%252C%2522title%2522%253A%2522Smart%2520Home%2522%252C%2522moreCouponLinkUrl%2522%253A%2522%252Fb%253Fnode%253D20378563011%2522%252C%2522moreCouponLinkText%2522%253A%2522%255Bsee%2520all%2520coupons%255D%2522%252C%2522showSort%2522%253A%2522%2522%252C%2522preRenderCouponCount%2522%253A%252210%2522%252C%2522couponsPerPage%2522%253A%2522200%2522%252C%2522maxCouponsPerRequest%2522%253A%252230%2522%252C%2522excludedPromotionIds%2522%253A%255B%255D%252C%2522promotionIds%2522%253A%255B%255D%252C%2522recentOrExpiring%2522%253A%2522recent%2522%252C%2522creativeId%2522%253A%2522ff3c7fe8-4638-4aaa-8ea3-6846882f70cf%2522%252C%2522placementId%2522%253A%252220c77d4a-67d2-4bb1-9aad-752b50c7a4c4%2522%257D&offset=3000&limit=3000&widgetType=SHOVELER&sortType=MOST_POPULAR`,
  `widgetConfig=%257B%2522query%2522%253A%257B%2522queryType%2522%253A%2522AND%2522%252C%2522conditions%2522%253A%255B%257B%2522queryType%2522%253A%2522OR%2522%252C%2522conditions%2522%253A%255B%257B%2522conditionType%2522%253A%2522GL%2522%252C%2522values%2522%253A%255B%2522201%2522%252C%252279%2522%255D%257D%255D%257D%255D%257D%252C%2522sortType%2522%253A%2522MOST_POPULAR%2522%252C%2522title%2522%253A%2522Home%2520%2526%2520Kitchen%2522%252C%2522moreCouponLinkUrl%2522%253A%2522%252Fb%253Fnode%253D20378563011%2522%252C%2522moreCouponLinkText%2522%253A%2522%255Bsee%2520all%2520coupons%255D%2522%252C%2522showSort%2522%253A%2522%2522%252C%2522preRenderCouponCount%2522%253A%252210%2522%252C%2522couponsPerPage%2522%253A%2522200%2522%252C%2522maxCouponsPerRequest%2522%253A%252230%2522%252C%2522excludedPromotionIds%2522%253A%255B%2522A2WATKMCMTA629%2522%255D%252C%2522promotionIds%2522%253A%255B%255D%252C%2522recentOrExpiring%2522%253A%2522recent%2522%252C%2522creativeId%2522%253A%25229e361c2c-cbac-42bd-a425-fc9b29d15324%2522%252C%2522placementId%2522%253A%2522d4f7ae94-8fe3-4250-a483-80297d3c47ad%2522%257D&offset=3000&limit=3000&widgetType=SHOVELER&sortType=MOST_POPULAR`,
  `widgetConfig=%257B%2522query%2522%253A%257B%2522queryType%2522%253A%2522AND%2522%252C%2522conditions%2522%253A%255B%257B%2522queryType%2522%253A%2522OR%2522%252C%2522conditions%2522%253A%255B%257B%2522conditionType%2522%253A%2522PROGRAM%2522%252C%2522values%2522%253A%255B%2522none%2522%252C%2522spc%2522%255D%257D%255D%257D%255D%257D%252C%2522sortType%2522%253A%2522MOST_POPULAR%2522%252C%2522title%2522%253A%2522Most%2520Popular%2520Coupons%2522%252C%2522showSort%2522%253A%25220%2522%252C%2522preRenderCouponCount%2522%253A%252210%2522%252C%2522couponsPerPage%2522%253A%2522200%2522%252C%2522maxCouponsPerRequest%2522%253A%252230%2522%252C%2522excludedPromotionIds%2522%253A%255B%2522A3K491C9LE9BIQ%2522%255D%252C%2522promotionIds%2522%253A%255B%255D%252C%2522recentOrExpiring%2522%253A%2522recent%2522%252C%2522creativeId%2522%253A%252204230cb6-ea5b-4383-bed5-ad0f98b0a712%2522%252C%2522placementId%2522%253A%2522d95fabe6-67a0-4278-900f-e98cfb264e1c%2522%257D&offset=3000&limit=3000&widgetType=SHOVELER&sortType=MOST_POPULAR`,
]
monitor()
for (let load of loads) {
  monitor(load)
}
async function monitor(load) {
  try {
    let proxy = await helper.getRandomProxy() //proxy per site
    let agent = randomUseragent.getRandom()
    var ip = (Math.floor(Math.random() * 255) + 1) + "." + (Math.floor(Math.random() * 255)) + "." + (Math.floor(Math.random() * 255)) + "." + (Math.floor(Math.random() * 255));
    let headers = {
      "x-forwarded-for": ip,
      "content-type": "application/x-www-form-urlencoded",
      //'cookie': 'ubid-main=131-7158895-3564110; sid="4NPjmTwX5ugg2YllJIYsNA==|naTglXK71Hh/oMtGAV29ABwW9cKLJxqiGW9fVJO8Z4w="; lc-main=en_US; skin=noskin; ubid-acbus=134-5302987-1803100; s_pers=%20s_fid%3D16758A91CD6220FC-3345B643BF25AB60%7C1826337500711%3B%20s_dl%3D1%7C1668572900711%3B%20gpv_page%3DUS%253ASD%253ASOA-sem%7C1668572900713%3B%20s_ev15%3D%255B%255B%2527SEUSSOAGOOG-B10238B-D%2527%252C%25271668571100715%2527%255D%255D%7C1826337500715%3B; s_sess=%20s_cc%3Dtrue%3B%20s_ppvl%3DUS%25253ASD%25253ASOA-sem%252C29%252C29%252C745%252C1242%252C745%252C1920%252C1080%252C1%252CL%3B%20c_m%3DSEUSSOAGOOG-B10238B-Dwww.google.comPaid%2520Search%3B%20s_sq%3D%3B%20s_ppv%3DUS%25253ASD%25253ASOA-sem%252C29%252C29%252C745%252C1242%252C745%252C1920%252C1080%252C1%252CL%3B; s_cc=true; s_sq=%5B%5BB%5D%5D; csrf=1039969867; lwa-context=dbad46f6d0cc9d9e9dee5cdc507efe0c; session-id-apay=139-7338695-9897565; session-id=139-0506219-1434459; cwr_u=1229226c-b906-44c9-b940-8ad62b3867b6; sst-main=Sst1|PQHZiHKSpyAlk-ghnQ_CwntNCW5ABpj09ClLJ_4kb1_T2VLCczGstDZi35SGgmkvn5TVuj1rHN6fikWl_tDBiInbmTZY_z9uZlPMpWcidV3TK-D6qS-xY0pkOSUblLGQfqDkD8nGkmR0w3Ji9Jrziw0Xa-aH0dk4LQGd6S8NCfUA-1w82FM7wSbplwvm6hQ550whfAZMYKZKUrLpdO3D92rWq2yfuZbJMtYvT2_nzgP4tuvbnHOM-AorOqP2BzWRfY6eAzdNEG5TEYki2GCqgCovKFMMEIWYJTErcKwe7B0md-4; i18n-prefs=USD; s_nr=1670559076857-New; s_vnum=2102559076857%26vn%3D1; s_dslv=1670559076858; s_ppv=21; x-main="Ulq4TDrv8W?ZB?EENcYh5CbKC95nuAkFn@IMiaKiaRmDxxyIzkF5hnpCmKIXOBVh"; at-main=Atza|IwEBIESvRCmfnKmzvyxZ_bwhYSsRd9jPPX6YH7uRXE4EsyyWJYWp8euIljKSt5n1MhGNY3o0uPkQi0VqIALRIyavHvtLP4nuAwXC5apMKLPdHJ8FKxFePenbVfwCCnqhGPoeTBOwVDWTPEzJ7UT2e_THW4TomJW86YCmQH1gAay4zXGyZDwiYAPB8lR1ym1XnEW3OR4kNC2lDU3T_Bp0KUungKPc; sess-at-main="mJRUAgPgX1SeFPU4cPbdgcgCHeupYT/SYpDcFcVvC8w="; session-id-time=2082787201l; av-timezone=America/New_York; session-token=61PhNAkGgYcT9J7dYdO/r4S9IookEaIZBM0G2Ooammc4sUuuULc7+hjOo9CBuH2Gj/kcECuai75xjJkrRZAhAqx/TK1w6cB/RLsswCQloC6BkVebGloQj8OuUYns9dKBJ6tc/+1d2YqeBbSqbzIzW+VQCG9iKHgnG2HiVgXTXYWpHeTVqj6HWprVO9FtNA9xsdqiBWWV7TrABUgcFnytH0KYVyY19Ig0TiiYgbADBA+J8PbcRgYV9sp2Mff0A305; csm-hit=tb:JGNTFKG3YHKHZ3HV63T1+s-J54E34M23K0GNC0CT0GS|1670636473239&t:1670636473239&adb:adblk_yes',
      'user-agent': agent
    }

    let method = 'POST'; //request method

    let req = `https://www.amazon.com/hz/coupons/loadMoreCoupons`//request url
    let startTime = Date.now()
    let set = await helper.requestJson4(req, method, proxy, headers, load)
    //console.log(set.response.status)

    if (set.response.status != 200) {
      monitor(load);
      return

    } //request function
    //console.log(set.json.products)
    if (set.text.includes("we just need to make sure you're not a robot")) {
      monitor(load);
      return
    }
    //offset += 3000
    let root = set.html
    let skulist = []
    let products = root.querySelectorAll('.a-section.a-text-left.coupon')
    let query = await database.query(`SELECT * from ${table}`);
    for(row of query.rows){
      skulist.push(row.sku)
    }
    for (let product of products) {
      let asin = product.attributes['data-asin']
      if (skulist.includes(asin)) {
        console.log('already in database')
        continue
      }
      console.log(asin)
      success++
      database.query(`insert into ${table}(sku) values('${asin}')`)
    }
    console.log(success)
    monitor(load);
    return
  } catch (e) {
    console.log(e)
    monitor(load)
    return
  }
}
