
var taskList = new tasks();
if (getCookie("login") == null) window.location = "./index.html";

document.getElementById("refreshList").onclick = () => {
    taskList.reset();
    taskList.getAll();
}
document.getElementById("logout").onclick = () => {
    localStorage.removeItem("login");
    localStorage.removeItem("tasks");
    chrome.runtime.sendMessage({ name: 'logout' });
    window.location = "./index.html"
}
try {
    chrome.runtime.onMessage.addListener(function (message) {
        // console.log(message.message.data.task_id)
        let index = taskList.getIndexFromId(message.message.data.task_id)
        // console.log(taskList.data[index])
        console.log(index,`${message.hoursElapsed}h ${message.minutesElapsed}m ${message.secondsElapsed}s`,document.getElementById("clock" + message.message.data.task_id))
        if(taskList.data[index]){
            taskList.data[index].hours = message.hoursElapsed;
            taskList.data[index].minutes = message.minutesElapsed;
            document.getElementById("clock" + message.message.data.task_id).innerHTML = `${message.hoursElapsed}h ${message.minutesElapsed}m ${message.secondsElapsed}s`;
        }

    });
} catch (error) {
    console.error('Error handling message:', error);
}


document.getElementById("start_date").onchange = () => {
    taskList.startDate = new Date(document.getElementById("start_date").value).toISOString().substr(0, 10)
    taskList.getAll(false)
}
document.getElementById("end_date").onchange = () => {
    taskList.endDate = new Date(document.getElementById("end_date").value).toISOString().substr(0, 10)
    taskList.getAll(false)
}


document.getElementById("lookupProject").onkeyup = (e) => {
    let ptimerId;
    clearTimeout(ptimerId);
    ptimerId = setTimeout(() => {

        const value = e.target.value;
        if (value === '') {
            document.getElementById("lookupProjectList").style.display = "none";
            taskList.project = [];
            taskList.startDate = new Date(document.getElementById("start_date").value).toISOString().substr(0, 10)
            taskList.endDate = new Date(document.getElementById("end_date").value).toISOString().substr(0, 10)
            taskList.getAll(false)
            return
        }
        var myHeaders = new Headers();
        myHeaders.append("task_manager_id", getCookie("login"));

        var requestOptions = {
            method: 'GET',
            headers: myHeaders,
            redirect: 'follow'
        };

        fetch("https://micronetbd.my.salesforce-sites.com/services/apexrest/project?search_string=" + value, requestOptions)
            .then(response => response.text())
            .then(result => {
                result = JSON.parse(result)
                if (result.success) {
                    if (result.users.length > 0) {
                        document.getElementById("lookupProjectList").style.display = "block";
                        document.getElementById("ProjectList").innerHTML = "";
                        result.users.forEach(el => {
                            document.getElementById("ProjectList").innerHTML += `
                            <li role="picker" class="slds-listbox__item" data-info="${el.project_id}">
                            <div class="slds-media slds-listbox__option slds-listbox__option_entity slds-listbox__option_has-meta" role="option">
                              <span class="slds-media__body">
                                <span class="slds-listbox__option-text slds-listbox__option-text_entity">
                                  <span><mark>${el.project_name}</mark></span>
                                </span>
                              </span>
                            </div>
                          </li>
                            `;
                        });
                        document.querySelectorAll('[role="picker"]').forEach((x) => {
                            x.addEventListener('click', () => {
                                e.target.value = x.innerText;
                                taskList.project = [x.getAttribute('data-info')];
                                taskList.startDate = new Date(document.getElementById("start_date").value).toISOString().substr(0, 10)
                                taskList.endDate = new Date(document.getElementById("end_date").value).toISOString().substr(0, 10)
                                taskList.getAll(false);
                                document.querySelector("#lookupProject").setAttribute('data-info', x.getAttribute('data-info'));
                                document.getElementById("lookupProjectList").style.display = "none";
                            })
                        })
                    }
                } else {
                    alert(JSON.stringify(result))
                }
            })
            .catch(error => { alert(error) });

    }, 500)

}
document.getElementById("lookupOwner").onkeyup = (e) => {
    let otimerId;
    // console.log("hello")
    clearTimeout(otimerId);
    otimerId = setTimeout(() => {

        const value = e.target.value;
        if (value === '') {
            document.getElementById("lookupOwnerList").style.display = "none";
            taskList.owner = getCookie("login");
            taskList.startDate = new Date(document.getElementById("start_date").value).toISOString().substr(0, 10)
            taskList.endDate = new Date(document.getElementById("end_date").value).toISOString().substr(0, 10)
            taskList.getAll(false)
            return
        }
        var myHeaders = new Headers();
        myHeaders.append("task_manager_id", getCookie("login"));

        var requestOptions = {
            method: 'GET',
            headers: myHeaders,
            redirect: 'follow'
        };
        fetch("https://micronetbd.my.salesforce-sites.com/services/apexrest/user?search_string=" + value, requestOptions)
            .then(response => response.text())
            .then(result => {
                result = JSON.parse(result)
                if (result.success) {
                    if (result.users.length > 0) {
                        document.getElementById("lookupOwnerList").style.display = "block";
                        document.getElementById("OwnersList").innerHTML = "";
                        result.users.forEach(el => {
                            document.getElementById("OwnersList").innerHTML += `
                            <li role="picker" class="slds-listbox__item" data-info="${el.user_id}">
                            <div class="slds-media slds-listbox__option slds-listbox__option_entity slds-listbox__option_has-meta" role="option">
                              <span class="slds-media__body">
                                <span class="slds-listbox__option-text slds-listbox__option-text_entity">
                                  <span><mark>${el.user_name}</mark></span>
                                </span>
                              </span>
                            </div>
                          </li>
                            `;
                        });
                        document.querySelectorAll('[role="picker"]').forEach((x) => {
                            x.addEventListener('click', () => {
                                taskList.owner = x.getAttribute('data-info');
                                taskList.startDate = new Date(document.getElementById("start_date").value).toISOString().substr(0, 10)
                                taskList.endDate = new Date(document.getElementById("end_date").value).toISOString().substr(0, 10)
                                taskList.getAll(false);
                                document.querySelector("#lookupOwner").value = x.innerText
                                document.querySelector("#lookupOwner").setAttribute('data-info', x.getAttribute('data-info'));
                                document.getElementById("lookupOwnerList").style.display = "none";
                            })
                        })
                    }
                } else {
                    alert(JSON.stringify(result))
                }
            })
            .catch(error => { alert(error) });

    }, 500)

}

