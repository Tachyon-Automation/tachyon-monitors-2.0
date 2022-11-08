module.exports = {
    "apps": [
        {
            "script": "./shopify/shopify.js",
            "watch": true,
            "max_memory_restart": "1000M",
            "error_file": "/dev/null",
            "out_file": "/dev/null"
        }
    ]
}