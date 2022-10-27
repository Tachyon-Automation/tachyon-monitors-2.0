module.exports = {
    "apps": [
        {
            "script": "./Retail/amazon-us.js",
            "watch": true,
            "max_memory_restart": "1000M",
            "error_file": "/dev/null",
            "out_file": "/dev/null"
        },
        {
            "script": "./Retail/walmart-us.js",
            "watch": true,
            "max_memory_restart": "1000M",
            "error_file": "/dev/null",
            "out_file": "/dev/null"
        }
    ]
}