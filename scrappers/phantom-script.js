var system = require("system");
var env = system.env;
var page = require("webpage").create();

page.settings.userAgent =
  // "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.94 Safari/537.36";
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:84.0) Gecko/20100101 Firefox/84.0";

// default viewport size is small, change it to 1366x768
page.viewportSize = {
  width: 1366,
  height: 768
};

//speedUp
"use strict";
function waitFor(testFx, onReady, timeOutMillis) {
    var maxtimeOutMillis = timeOutMillis ? timeOutMillis : 3000, //< Default Max Timout is 3s
        start = new Date().getTime(),
        condition = false,
        interval = setInterval(function() {
            if ( (new Date().getTime() - start < maxtimeOutMillis) && !condition ) {
                // If not time-out yet and condition not yet fulfilled
                condition = (typeof(testFx) === "string" ? eval(testFx) : testFx()); //< defensive code
            } else {
                if(!condition) {
                    // If condition still not fulfilled (timeout but condition is 'false')
                    console.log("'waitFor()' timeout");
                    phantom.exit(1);
                } else {
                    // Condition fulfilled (timeout and/or condition is 'true')
                    console.log("'waitFor()' finished in " + (new Date().getTime() - start) + "ms.");
                    typeof(onReady) === "string" ? eval(onReady) : onReady(); //< Do what it's supposed to do once the condition is fulfilled
                    clearInterval(interval); //< Stop this interval
                }
            }
        }, 250); //< repeat check every 250ms
};

//block unnecessary link
// block_urls = ['gstatic.com', 'arc.io','core.arc.io','static.arc.io', 'caradstag.casa', 'twitter.com', 'facebook.net', 'facebook.com', 'batsdivannab.com','mawsewtwo.com'];
// page.onResourceRequested = function(requestData, request){
//     for(url in block_urls) {
//         if(requestData.url.indexOf(block_urls[url]) !== -1) {
//             request.abort();
//             console.log(requestData.url + " aborted");
//             return;
//         }
//     }            
// }
// page.settings.loadImages = false;
// open page
page.open(env.URL, function(status) {
  if (status == "success") {
    // wait until all the assets are loaded
    function checkReadyState() {
      var readyState = page.evaluate(function() {
        return document.readyState;
      });

      if (readyState == "complete") {
        waitFor(function() {
        var result = page.evaluate(function() {
          return document.documentElement.outerHTML;
        });

        // exit and return HTML
        console.log(result);
        system.stdout.write(result);
        });
        phantom.exit(0);
      } else {
        setTimeout(checkReadyState, 50);
      }
    }

    checkReadyState();
  } else {
    // if status is not 'success' exit with an error
    console.log(error);
    system.stderr.write(error);
    phantom.exit(1);
  }
});
