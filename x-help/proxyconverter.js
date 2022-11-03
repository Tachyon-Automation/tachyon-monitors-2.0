const fs = require('fs')
async function convert() { 
let data = fs.readFileSync('./list.txt', 'utf8')
let proxies = data.split('\n');
let pr = '';
for (let proxy of proxies) {
    let arr = proxy.trim().split(":");
    pr += `"http://${arr[2]}:${arr[3]}@${arr[0]}:${arr[1]}",\n`
}
pr = '[\n' + pr + '\n]'
fs.writeFileSync('./test.json', await pr)
}
convert()