function toggleDisplay() {
    var extensionDisplay = document.getElementById("forceextension").style.display;
    document.getElementById("forceextension").style.display = extensionDisplay === "none" ? "block" : "none";
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log(sender.tab ? `Greeting received in content.js from: ${sender.tab.url}` : "Greeting received in content.js from the extension");
    if (request.greeting === "hello") {
        toggleDisplay();
        sendResponse({ message: "Toggle display action performed in content.js" });
    }
});

function createIframe() {
    var substack = document.createElement("iframe");
    substack.src = chrome.runtime.getURL("src/index.html");
    substack.id = "forceextension";
    Object.assign(substack.style, {
        width: "620px",
        height: "100vh",
        zIndex: "9000",
        position: "absolute",
        border: "none",
        display: "none",
        right: "0"
    });
    document.body.before(substack);
}

createIframe(); // Call this function on script load

// Notify background.js that content.js has loaded
chrome.runtime.sendMessage({ message: "content.js is loaded and ready" });
