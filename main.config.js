module.exports = {
    "apps": [
        {
            "script": "./Reddit Deals/reddit.js",
            "watch": true,
            "max_memory_restart": "1000M",
            "error_file": "/dev/null",
            "out_file": "/dev/null"
        },
        {
            "script": "./slickdeals/slickdeals.js",
            "watch": true,
            "max_memory_restart": "1000M",
            "error_file": "/dev/null",
            "out_file": "/dev/null"
        },
        {
            "script": "./snkrs/base.js",
            "watch": true,
            "max_memory_restart": "1000M",
            "error_file": "/dev/null",
            "out_file": "/dev/null"
        }
    ]
}