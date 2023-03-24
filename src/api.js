var APIURL = 'https://micronetbd.my.salesforce-sites.com/services/apexrest/';


function makeHttpRequest(url, method, headers, data) {
    // console.log('requestOptions', data)
    const requestOptions = {
        method: method,
        headers: headers,
        redirect: 'follow',
        url: APIURL + url
    };
    if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
        requestOptions.data = data;
    } else {
        requestOptions.params = data;
    }

    return axios(requestOptions)
        .then(response => {
            // console.log('makeHttpRequest', response, data)
            if (response.data.success) {
                return response.data;
            } else {
                throw new Error(JSON.stringify(response.data));
            }
        })
        .catch(error => {
            throw error;
        });
}

function login(value) {
    const formProps = Object.fromEntries(value);
    const headers = {
        'Access-Control-Allow-Origin': '*'
    };
    const data = new URLSearchParams();
    data.append("username", formProps.username);
    data.append("password", formProps.password);

    makeHttpRequest('login', 'POST', headers, data)
        .then(result => {
            if (result.success) {
                console.log("login data", result)
                localStorage.setItem('default_project_types', result.default_project_types)
                localStorage.setItem('default_project_status', result.default_task_types)
                localStorage.setItem('default_task_types', result.default_task_types)
                localStorage.setItem('default_task_status', result.default_task_status)
                setCookie("login", result.user_id, 24);
                window.location = "./home.html";
            } else {
                alert("invalid username or password !")
            }
        })
        .catch(error => {
            console.error(error);
            alert(error.message);
        });
}

function getAllTasks(owner, projects, startDate, endDate) {
    function getAllTasks(data) {
        let tasks = [];
        if (!data) return tasks
        for (let i = 0; i < data.length; i++) {
            for (let j = 0; j < data[i].users.length; j++) {
                for (let k = 0; k < data[i].users[j].tasks.length; k++) {
                    data[i].users[j].tasks[k].project_name = data[i].project_name
                    data[i].users[j].tasks[k].project_id = data[i].project_id
                    data[i].users[j].tasks[k].user_name = data[i].users[j].user_name
                    data[i].users[j].tasks[k].user_id = data[i].users[j].user_id
                    tasks.push(data[i].users[j].tasks[k])
                }
            }
        }
        return tasks;
    }
    return new Promise((resolve, reject) => {
        var headers = {
            'Content-Type': 'application/json',
            'task_manager_id': getCookie("login")
        };

        var payload = {
            "user_ids": [owner],
            "start_date": startDate,
            "end_date": endDate,
            "project_Ids": projects,
            "page_size": 100,
            "page_offset": 0
        }
        makeHttpRequest('task/list', 'POST', headers, JSON.stringify(payload)).then(result => {
            if (result) {
                resolve(getAllTasks(result.projects));
            } else {
                resolve([]);
            }
        })

    })
}

function removeTask(url) {
    return new Promise((resolve, reject) => {
        var headers = {
            'task_manager_id': getCookie("login")
        };
        makeHttpRequest(url, 'DELETE', headers, [])
            .then(result => {
                if (result.success) {
                    resolve(true)
                }
            })
            .catch(error => {
                console.error(error);
                alert(error.message);
            });
    })

}

function createTask(formProps) {
    return new Promise((resolve, reject) => {
        var headers = {
            'task_manager_id': getCookie("login")
        };

        var urlencoded = new URLSearchParams();
        urlencoded.append("name", formProps.name);
        urlencoded.append("type", formProps.type);
        urlencoded.append("start_date", formProps.start_date);
        urlencoded.append("owner", formProps.owner);
        urlencoded.append("project_id", formProps.project_id);
        urlencoded.append("minutes", formProps.minutes);
        urlencoded.append("hours", formProps.hours);
        urlencoded.append("notes", formProps.notes);
        urlencoded.append("status", formProps.status);
        if (formProps.end_date) {
            urlencoded.append("end_date", formProps.end_date);
        }

        makeHttpRequest('task', 'POST', headers, urlencoded)
            .then(result => {
                if (result.success) {
                    resolve(result)
                } else {
                    alert(JSON.stringify(result))
                }
            })
            .catch(error => {
                console.error(error);
                alert(error.message);
            });
    })
}
function getTask(payload) {
    return new Promise((resolve, reject) => {
        var headers = {
            'Content-Type': 'application/json',
            'task_manager_id': getCookie("login")
        };
        makeHttpRequest('task/list', 'POST', headers, JSON.stringify(payload)).then(result => {
            console.log(result)

            if (result.projects) {
                resolve(result.projects[0].users[0].tasks[0]);
            } else {
                resolve([]);
            }
        })
    })
}
function editTask(editdata) {
    return new Promise((resolve, reject) => {

        // console.log('editdata', editdata)
        var headers = {
            'task_manager_id': getCookie("login")
        };
        // if (typeof editdata.description == "string") {
        //     editdata.description = JSON.parse(editdata.description)
        // } else {
        //     editdata.description = JSON.stringify(editdata.description)

        // }
        var urlencoded = new URLSearchParams();
        urlencoded.append("task_id", editdata.task_id);
        urlencoded.append("name", editdata.name);
        urlencoded.append("type", editdata.type);
        urlencoded.append("start_date", editdata.start_date);
        urlencoded.append("owner", editdata.owner);
        urlencoded.append("project_id", editdata.project_id);
        urlencoded.append("hours", editdata.hours);
        urlencoded.append("minutes", editdata.minutes);
        urlencoded.append("notes", editdata.description);
        urlencoded.append("status", editdata.status);
        if (editdata.end_date) {
            urlencoded.append("end_date", editdata.end_date + ":00");
        }
        makeHttpRequest('task', 'PUT', headers, urlencoded).then(result => {
            if (result.success) {
                resolve(result)
            } else {
                alert(JSON.stringify(result))
            }
        })
    })

}
function search(url) {
    return new Promise((resolve, reject) => {
        var headers = {
            'task_manager_id': getCookie("login")
        };
        makeHttpRequest(url, 'GET', headers, [])
            .then(result => {
                if (result.success) {
                    resolve(result)
                } else {
                    console.log(result);
                    // alert(JSON.stringify(result))
                }
            })
            .catch(error => {
                console.error(error);
                // alert(error.message);
            });

    })
}

function createProject(formProps) {
    var headers = {
        'task_manager_id': getCookie("login")
    };
    var urlencoded = new URLSearchParams();
    urlencoded.append("name", formProps.name);
    urlencoded.append("type", formProps.type);
    urlencoded.append("start_date", formProps.start_date);
    urlencoded.append("end_date", formProps.end_date);
    urlencoded.append("manager", formProps.manager);
    urlencoded.append("budgeted_hours", "100");
    urlencoded.append("client_account", formProps.client_account);
    urlencoded.append("status", "In Progress");
    makeHttpRequest('project', 'POST', headers, urlencoded).then(result => {
        if (result.success) {
            window.location = './home.html'
        } else {
            alert(JSON.stringify(result))
        }
    })
}



