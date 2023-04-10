chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        console.log(sender.tab ?
            "from a content script:" + sender.tab.url :
            "from the extension");
        if (request.greeting == "hello") {
            var con=document.getElementById("forceextension").style.display ;
            if(con==="none"){
                document.getElementById("forceextension").style.display   = "block"
            }else{
                document.getElementById("forceextension").style.display   = "none"
            }
        }

        sendResponse({ farewell: "goodbye" });
    }
);
var substack = document.createElement("iframe");
substack.src = chrome.runtime.getURL("src/index.html");
substack.style.width = "620px";
substack.id = "forceextension";
substack.style.height = "100vh";
substack.style['z-index'] = "9000";
substack.style.position = "absolute";
substack.style.border = "none";
substack.style.display = "none";
substack.style.right = 0;
document.body.before(substack);
