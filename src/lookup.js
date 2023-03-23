
const delay = 500;

let ptimerId;
document.getElementById("lookupProject").onkeyup = (e) => {
    clearTimeout(ptimerId);
    ptimerId = setTimeout(() => {

        const value = e.target.value;
        var myHeaders = new Headers();
        myHeaders.append("task_manager_id", getCookie("login"));

        var requestOptions = {
            method: 'GET',
            headers: myHeaders,
            redirect: 'follow'
        };

        fetch("https://micronetbd--uat.sandbox.my.salesforce-sites.com/services/apexrest/project?search_string=" + value, requestOptions)
            .then(response => response.text())
            .then(result => {
                result = JSON.parse(result)
                if (result.success) {
                    // console.log(result)
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
                                this.project = `[\"${x.getAttribute('data-info')}\"]`;
                                this.getAll();
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

    }, delay)

}
let otimerId;
document.getElementById("lookupOwner").onkeyup = (e) => {
    clearTimeout(otimerId);
    otimerId = setTimeout(() => {

        const value = e.target.value;
        var myHeaders = new Headers();
        myHeaders.append("task_manager_id", getCookie("login"));

        var requestOptions = {
            method: 'GET',
            headers: myHeaders,
            redirect: 'follow'
        };

        fetch("https://micronetbd--uat.sandbox.my.salesforce-sites.com/services/apexrest/user?search_string=" + value, requestOptions)
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
                                e.target.value = x.innerText;
                                this.owner = x.getAttribute('data-info');
                                this.getAll();
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

    }, delay)

}

document.getElementById("start_date").onchange = (e) => {
    this.startDate = e.target.value + ' 19:00:00';
    this.getAll()
}
document.getElementById("end_date").onchange = (e) => {
    this.endDate = e.target.value + ' 19:00:00';
    this.getAll()
}