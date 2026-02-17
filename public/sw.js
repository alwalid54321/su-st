/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// If the loader is already loaded, just stop.
if (!self.define) {
  let registry = {};

  // Used for `eval` and `importScripts` where we can't get script URL by other means.
  // In both cases, it's safe to use a global var because those functions are synchronous.
  let nextDefineUri;

  const singleRequire = (uri, parentUri) => {
    uri = new URL(uri + ".js", parentUri).href;
    return registry[uri] || (
      
        new Promise(resolve => {
          if ("document" in self) {
            const script = document.createElement("script");
            script.src = uri;
            script.onload = resolve;
            document.head.appendChild(script);
          } else {
            nextDefineUri = uri;
            importScripts(uri);
            resolve();
          }
        })
      
      .then(() => {
        let promise = registry[uri];
        if (!promise) {
          throw new Error(`Module ${uri} didn’t register its module`);
        }
        return promise;
      })
    );
  };

  self.define = (depsNames, factory) => {
    const uri = nextDefineUri || ("document" in self ? document.currentScript.src : "") || location.href;
    if (registry[uri]) {
      // Module is already loading or loaded.
      return;
    }
    let exports = {};
    const require = depUri => singleRequire(depUri, uri);
    const specialDeps = {
      module: { uri },
      exports,
      require
    };
    registry[uri] = Promise.all(depsNames.map(
      depName => specialDeps[depName] || require(depName)
    )).then(deps => {
      factory(...deps);
      return exports;
    });
  };
}
define(['./workbox-c008c882'], (function (workbox) { 'use strict';

  importScripts();
  self.skipWaiting();
  workbox.clientsClaim();

  /**
   * The precacheAndRoute() method efficiently caches and responds to
   * requests for URLs in the manifest.
   * See https://goo.gl/S9QRab
   */
  workbox.precacheAndRoute([{
    "url": "/_next/app-build-manifest.json",
    "revision": "e80e5760c23bc1af9ee25f83a5d2c64b"
  }, {
    "url": "/_next/build-manifest.json",
    "revision": "35f1562458fde1518b2c9808eefc3fc1"
  }, {
    "url": "/_next/react-loadable-manifest.json",
    "revision": "9502d77c8c75374476a704c2753148cc"
  }, {
    "url": "/_next/server/middleware-build-manifest.js",
    "revision": "4dc6647f58dedfc99e331e8429e885a0"
  }, {
    "url": "/_next/server/middleware-react-loadable-manifest.js",
    "revision": "01c055fe28da589a183daf15250d497f"
  }, {
    "url": "/_next/server/next-font-manifest.js",
    "revision": "f7097bf7c93c1cbb4c118491ca6d2b04"
  }, {
    "url": "/_next/server/next-font-manifest.json",
    "revision": "d51420cd4aa5d37d6719849cf36d0d6f"
  }, {
    "url": "/_next/static/chunks/_app-pages-browser_node_modules_next_dist_client_dev_noop-turbopack-hmr_js.js",
    "revision": "4f8b1384e9c50500b94931cae3b6805b"
  }, {
    "url": "/_next/static/chunks/app-pages-internals.js",
    "revision": "b8038853009cc16c99b628bb91ee411f"
  }, {
    "url": "/_next/static/chunks/app/_not-found/page.js",
    "revision": "16579c4c581d4ed2883ec2cea5a5dd82"
  }, {
    "url": "/_next/static/chunks/app/api/announcements/route.js",
    "revision": "b4b4104b39a3b3cb1666dc06aa812a54"
  }, {
    "url": "/_next/static/chunks/app/api/auth/%5B...nextauth%5D/route.js",
    "revision": "d0a8e1ccd6e8ded9f1cbd89835699802"
  }, {
    "url": "/_next/static/chunks/app/api/currencies/route.js",
    "revision": "1dda249ddf7f69bca8318ac031bd6978"
  }, {
    "url": "/_next/static/chunks/app/api/gallery/route.js",
    "revision": "a230865e09e6f4bcf94ac340a52b0f94"
  }, {
    "url": "/_next/static/chunks/app/api/market-data/route.js",
    "revision": "cef99414795c34177a0ee2cae17d3946"
  }, {
    "url": "/_next/static/chunks/app/api/user/plan/route.js",
    "revision": "0238e9d2bddfda62581657d5f41c1d68"
  }, {
    "url": "/_next/static/chunks/app/error.js",
    "revision": "c43c08a50361cda870b515516200c606"
  }, {
    "url": "/_next/static/chunks/app/layout.js",
    "revision": "a82b409813bcec1825503f85b985e752"
  }, {
    "url": "/_next/static/chunks/app/not-found.js",
    "revision": "1e3a923553d068b0d4c75bda9717f229"
  }, {
    "url": "/_next/static/chunks/app/page.js",
    "revision": "9555957639cb62c217ac4b5c4db505cf"
  }, {
    "url": "/_next/static/chunks/main-app.js",
    "revision": "7d0782f5e305d509092d7be1b2ec4211"
  }, {
    "url": "/_next/static/chunks/polyfills.js",
    "revision": "846118c33b2c0e922d7b3a7676f81f6f"
  }, {
    "url": "/_next/static/chunks/webpack.js",
    "revision": "11d1296d5b81265540395b00d553d19f"
  }, {
    "url": "/_next/static/css/app/layout.css",
    "revision": "2a77e589398a1bbafebfdfbc90820200"
  }, {
    "url": "/_next/static/css/app/page.css",
    "revision": "512a2142e2ef56e744330756bdbad9ca"
  }, {
    "url": "/_next/static/development/_buildManifest.js",
    "revision": "97f1258b3dd30d37ba33a4c4ed741eed"
  }, {
    "url": "/_next/static/development/_ssgManifest.js",
    "revision": "abee47769bf307639ace4945f9cfd4ff"
  }, {
    "url": "/_next/static/webpack/0dc84267717f585b.webpack.hot-update.json",
    "revision": "development"
  }, {
    "url": "/_next/static/webpack/app/layout.0dc84267717f585b.hot-update.js",
    "revision": "development"
  }, {
    "url": "/_next/static/webpack/webpack.0dc84267717f585b.hot-update.js",
    "revision": "development"
  }], {
    "ignoreURLParametersMatching": [/ts/]
  });
  workbox.cleanupOutdatedCaches();
  workbox.registerRoute("/", new workbox.NetworkFirst({
    "cacheName": "start-url",
    plugins: [{
      cacheWillUpdate: async ({
        request,
        response,
        event,
        state
      }) => {
        if (response && response.type === 'opaqueredirect') {
          return new Response(response.body, {
            status: 200,
            statusText: 'OK',
            headers: response.headers
          });
        }
        return response;
      }
    }]
  }), 'GET');
  workbox.registerRoute(/.*/i, new workbox.NetworkOnly({
    "cacheName": "dev",
    plugins: []
  }), 'GET');

}));
