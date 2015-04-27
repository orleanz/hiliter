(function doReplace() {

  chrome.runtime.sendMessage({method: "getDB"}, function(response) {

    if (!response.enabled) return;

    var dtStart = new Date().getTime();

    var splitter = new RegExp("([\\s|,|;|\\?|\\.|!])");
   
    var wordlist = JSON.parse(response.db);

    var clipLim = 2;
    var clipMinLength = 5;

    var dict = {};    
    for (var i = 0; i <= clipLim; i++) {
      buildDict(wordlist, i);
    }

    var tns = getTextNodesIn(document);

    for (var i = 0; i < tns.length; i++) {

        var node = tns[i];
        var nv = node.nodeValue.trim();

        if (nv && hasWordFromList(nv)) {

            var ar = nv.split(splitter);
            var newar = [];
            var bigSpan = document.createElement("span");

            var textCollect = "";

            for (var j = 0; j < ar.length; j++) {

                var curText = ar[j];
                var tr = getTranslation(curText);
                
                if (tr) {

                    var tr2 = tr.split("=>");

                    if (response.inline == 1) {

                        var tmp = tr2.length > 1 ? tr2[1] : tr;
                        textCollect += curText + " [" + tmp.trim() + "]";

                    } else {

                        if (textCollect) {
                            bigSpan.appendChild(document.createTextNode(textCollect));
                            textCollect = "";
                        }

                        var s = document.createElement("span");
                        s.style.borderBottom = "1px dotted gray";

                        if (response.inline == 2) {
                            s.textContent = tr2.length > 1 ? tr2[1] : tr;
                            s.title = curText;
                        } else {
                            s.textContent = curText;
                            s.title = tr;
                        }
                        
                        bigSpan.appendChild(s);

                    }

                } else {

                    textCollect += curText;

                }

            }

            if (textCollect) {
                bigSpan.appendChild(document.createTextNode(textCollect));
            }

            node.parentNode.replaceChild(bigSpan, node);

        }
        
    }

    var dtFinish = new Date().getTime();

    chrome.runtime.sendMessage({method: "done", value: dtFinish-dtStart});

    function getTranslation(word) {

        var translation = null;

        if (word.length >= clipMinLength) {

          for (var k = 0; k <= clipLim; k++) {

            var shortenedWord = word.substr(0, word.length - k);
            var lookupResult = dict[shortenedWord];
            if (lookupResult) {
              if (word == lookupResult.baseform) {
                translation = lookupResult.translation;
              } else {
                translation = lookupResult.baseform + " => " + lookupResult.translation;              
              }
              break;
            } 

          }  

        }

        return translation;

    }

    function hasWordFromList(txt) {

        var words = txt.split(splitter);

        for (var i = 0; i < words.length; i++) {

            var word = words[i];

            if (word.length >= clipMinLength) {

                for (var k = 0; k <= clipLim; k++) {
                    var shortenedWord = word.substr(0, word.length - k);
                    if (shortenedWord in dict) {
                        return true;
                    }
                }

            }

        }

        return false;
    }

    function buildDict(ar, clip) {

        for (var i = 0; i < ar.length; i ++) {

            var key = ar[i][0];
            var value = ar[i][1];

            if (clip == 0) {
              dict[key] = {translation: value, baseform: key}
            } else {
              if (key.length >= clipMinLength) {
                var newKey = key.substr(0, key.length - clip);
                if (!(newKey in dict)) {
                  dict[newKey] = {translation: value, baseform: key};
                }
              }
            } // end if

        } // end for

    } // end function

    }); // end sendmessage

})();


function getTextNodesIn(node, includeWhitespaceNodes) {
    var textNodes = [], nonWhitespaceMatcher = /\S/;

    function getTextNodes(node) {
        if (node.nodeType == 3) {
            if (includeWhitespaceNodes || nonWhitespaceMatcher.test(node.nodeValue)) {
                textNodes.push(node);
            }
        } else {
            for (var i = 0, len = node.childNodes.length; i < len; ++i) {
                getTextNodes(node.childNodes[i]);
            }
        }
    }

    getTextNodes(node);
    return textNodes;
}

