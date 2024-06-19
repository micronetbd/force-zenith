var Interval = {}
var timeInterval = {}
chrome.action.onClicked.addListener( (tab)=> {
        chrome.tabs.sendMessage(tab.id, {greeting: "hello"}, function(response) {
        });
})
setInterval(() => {
    if (Object.keys(Interval).length > 0) {
        chrome.action.setIcon({
            path: "../TimerRunning.png"
        });
    } else {
        chrome.action.setIcon({
            path: "../Idle Icon1.png"
        });
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

    fetch("https://micronetbd.my.salesforce-sites.com/services/apexrest/task", requestOptions)
        //.then(x => console.log(x))
        .catch((error) => { console.log(error) })
}


function trackTime(message) {
    const startTimestamp = Date.now() - (message.data.hours * 3600000) - (message.data.minutes * 60000) - (0 * 1000);
    let elapsedSeconds = 0;
    if (!Interval[message.data.task_id]) {
        Interval[message.data.task_id] = setInterval(() => {
            elapsedSeconds = Math.floor((Date.now() - startTimestamp) / 1000);
            const hoursElapsed = Math.floor(elapsedSeconds / 3600);
            const minutesElapsed = Math.floor((elapsedSeconds - (hoursElapsed * 3600)) / 60);
            message.data.hours = hoursElapsed;
            message.data.minutes = minutesElapsed;
            update(message.data, message.auth);

        }, 6000);
    }
}
function sendtime(message) {
    const startTimestamp = Date.now() - (message.data.hours * 3600000) - (message.data.minutes * 60000) - (0 * 1000);
    let elapsedSeconds = 0;
    if (!timeInterval['time' + message.data.task_id]) {
        timeInterval['time' + message.data.task_id] = setInterval(() => {
            elapsedSeconds = Math.floor((Date.now() - startTimestamp) / 1000);
            const hoursElapsed = Math.floor(elapsedSeconds / 3600);
            const minutesElapsed = Math.floor((elapsedSeconds - (hoursElapsed * 3600)) / 60);
            const secondsElapsed = elapsedSeconds - (hoursElapsed * 3600) - (minutesElapsed * 60);
            try {
                chrome.runtime.sendMessage({ message, hoursElapsed, minutesElapsed, secondsElapsed });
            } catch (error) {
                console.log(error)
            }

        }, 1000);
    }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

    if (message.name === 'startTracking') {

        trackTime(message)
        sendtime(message)

    }
    if (message.name === 'pauseTracking') {
        if (Interval[message.data]) {
            clearInterval(Interval[message.data])
            clearInterval(timeInterval['time' + message.data])
            delete Interval[message.data]
            delete timeInterval['time' + message.data]
        }
    }
    if (message.name === 'logout') {
        for (const key in Interval) {
            clearInterval(Interval[key])
            clearInterval(timeInterval['time' + key])
            delete Interval[key]
            delete timeInterval['time' + key]
        }

    }
});