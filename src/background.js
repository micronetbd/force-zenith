

var Interval = {};
var timeInterval = {};

chrome.action.onClicked.addListener((tab) => {
    if (tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('chrome-extension://')) {
        chrome.tabs.sendMessage(tab.id, { greeting: "hello" }, function(response) {
            if (chrome.runtime.lastError) {
                console.error('Error sending message:', chrome.runtime.lastError.message);
            } else {
                console.log(response);
            }
        });
    }
});

setInterval(() => {
    if (Object.keys(Interval).length > 0) {
        chrome.action.setIcon({ path: "../TimerRunning.png" });
    } else {
        chrome.action.setIcon({ path: "../Idle Icon1.png" });
    }
}, 1000);

function update(data, auth) {
    var myHeaders = new Headers();
    myHeaders.append("task_manager_id", auth);

    var urlencoded = new URLSearchParams();
    urlencoded.append("task_id", data.task_id);
    urlencoded.append("name", data.name);
    urlencoded.append("type", data.type);
    urlencoded.append("start_date", data.start_date);
    urlencoded.append("owner", data.assign_by_id);
    urlencoded.append("project_id", data.project_id);
    urlencoded.append("hours", data.hours);
    urlencoded.append("minutes", data.minutes);
    urlencoded.append("notes", data.description);
    urlencoded.append("status", data.status);
    if (data.end_date) {
        urlencoded.append("end_date", data.end_date);
    }

    var requestOptions = {
        method: 'PUT',
        headers: myHeaders,
        body: urlencoded,
        redirect: 'follow'
    };

    fetch("https://micronetbd--uat.sandbox.my.salesforce-sites.com/services/apexrest/task", requestOptions)
        .then(x => console.log(x))
        .catch((error) => { console.log(error) })
}
function getElapsedTime(taskId) {
    return JSON.parse(localStorage.getItem(taskId) || '{"hours":0,"minutes":0,"seconds":0}');
}

function setElapsedTime(taskId, elapsedTime) {
    localStorage.setItem(taskId, JSON.stringify(elapsedTime));
}

function clearElapsedTime(taskId) {
    localStorage.removeItem(taskId);
}

function trackTime(message) {
    let elapsedTime = getElapsedTime(message.data.task_id);
    let startTimestamp = Date.now() - (elapsedTime.hours * 3600000 + elapsedTime.minutes * 60000 + elapsedTime.seconds * 1000);
    
    Interval[message.data.task_id] = setInterval(() => {
        let seconds = Math.floor((Date.now() - startTimestamp) / 1000);
        let hours = Math.floor(seconds / 3600);
        seconds -= hours * 3600;
        let minutes = Math.floor(seconds / 60);
        seconds -= minutes * 60;
        
        // Update the message object with the new elapsed time
        message.data.hours = hours;
        message.data.minutes = minutes;
        message.data.seconds = seconds;
        
        update(message.data, message.auth);
        setElapsedTime(message.data.task_id, { hours, minutes, seconds });
    }, 1000);
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.name === 'startTracking') {
        console.log('Starting tracking for task:', message.data.task_id);
        trackTime(message);
    }
    
    if (message.name === 'pauseTracking') {
        console.log('Pausing tracking for task:', message.data.task_id);
        if (Interval[message.data.task_id]) {
            clearInterval(Interval[message.data.task_id]);
            delete Interval[message.data.task_id];
        }
        setElapsedTime(message.data.task_id, { hours: message.data.hours, minutes: message.data.minutes, seconds: message.data.seconds });
    }
    
    if (message.name === 'logout') {
        console.log('Logging out and clearing all tracking data.');
        for (const key in Interval) {
            clearInterval(Interval[key]);
            clearElapsedTime(key);
            delete Interval[key];
        }
    }
    
    // Content script ready acknowledgement
    if (message.contentScriptReady) {
        console.log('Content script has loaded in tab:', sender.tab.id);
    }
});
