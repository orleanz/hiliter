chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.method == "getDB") {
      sendResponse({
        db: localStorage['currentDict'], 
        enabled: localStorage['toolEnabled'] == "true",
        inline: localStorage['useInlineReplacement'] == "true"
      });
    } else if (request.method == "done") {

      localStorage.setItem("lastOpDuration", request.value);

    } else {
      sendResponse({}); 
    }
      
});



