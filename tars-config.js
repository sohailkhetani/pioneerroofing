module.exports = {
    "autoprefixerConfig": [
        "> 1%",
        "last 2 versions",
        "Firefox ESR",
        "android 4"
    ],
    "postcss": [],
    "svg": {
        "active": true,
        "workflow": "symbols",
        "symbolsConfig": {
            "loadingType": "inject",
            "usePolyfillForExternalSymbols": true,
            "pathToExternalSymbolsFile": ""
        }
    },
    "useJsLintAndHint": false,
    "jsPathsToConcatBeforeModulesJs": [],
    "lintJsCodeBeforeModules": false,
    "jsPathsToConcatAfterModulesJs": [],
    "lintJsCodeAfterModules": false,
    "useBabel": false,
    "sourcemaps": {
        "js": {
            "active": true,
            "inline": false
        },
        "css": {
            "active": true,
            "inline": false
        }
    },
    "notifyConfig": {
        "useNotify": true,
        "title": "TARS notification",
        "sounds": {},
        "taskFinishedText": "Task finished at: "
    },
    "browserSyncConfig": {
        "baseDir": "./dev",
        "port": 3004,
        "open": true,
        "browser": "default",
        "startUrl": "/index.html",
        "useNotifyInBrowser": true,
        "injectChanges": false
    },
    "removeConsoleLog": true,
    "minifyHtml": false,
    "staticPrefix": "assets/",
    "buildPath": "./builds/",
    "useBuildVersioning": false,
    "useArchiver": true,
    "ulimit": 4096,
    "templater": "handlebars",
    "cssPreprocessor": "scss",
    "useImagesForDisplayWithDpi": [
        96
    ],
    "fs": {
        "staticFolderName": "assets",
        "imagesFolderName": "images"
    }
};