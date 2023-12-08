
document.querySelector("#lookupOwner").value = "Current User";
document.querySelector("#lookupOwner").setAttribute('data-info', getCookie("login"));

var tasktypes = localStorage.getItem('default_task_types')
tasktypes = tasktypes.split(',');
tasktypes.forEach(el => {
  document.getElementById("tasktypes").innerHTML += `
  <option value="${el}">${el}</option>
  `
});

var taskstatus = localStorage.getItem('default_task_status')
taskstatus = taskstatus.split(',');
taskstatus.forEach(el => {
  document.getElementById("taskstatus").innerHTML += `
  <option value="${el}">${el}</option>
  `
});

document.getElementById("taskstatus").onchange = (e) => {
  const value = e.target.value;
  if (value == "Completed") {
    document.getElementById("enddatestatus").style.display = "flex"
  } else {
    document.getElementById("enddatestatus").style.display = "none"
  }
}

// this.Tracker.toggleTask(i, this.getFromid(i).hours, this.getFromid(i).minutes);
//         chrome.runtime.sendMessage({ name: 'startTracking', data: this.getFromid(i) ,auth: this.owner, timestamp: this.Tracker.getTime(i) });

document.forms.createTaskForm.addEventListener('submit', (event) => {
  event.preventDefault();
  var formEl = document.forms.createTaskForm;
  const formData = new FormData(formEl);
  const formProps = Object.fromEntries(formData);
  formProps.project_id = document.querySelector("#lookupProject").getAttribute('data-info')
  formProps.owner = document.querySelector("#lookupOwner").getAttribute('data-info')
  formProps.minutes = parseInt(formProps.minutes);
  formProps.hours = parseInt(formProps.hours);
  formProps.start_date = formProps.start_date + " " + formProps.start_time + ":00";
  formProps.end_date = formProps.end_date + " " + formProps.end_time + ":00";

  if (formProps.status !== "Completed") {
    delete formProps.end_date;
  }

  const requiredFields = formEl.querySelectorAll('[required]');
  let allFieldsValid = true;
  requiredFields.forEach(function (field) {
    if (!field.checkValidity()) {
      allFieldsValid = false;
    }
  });
  if (allFieldsValid) {
    createTask(formProps).then((x) => {
      if (formProps.status == "In Progress") {
        console.log('i ran ', x)
        if (!formProps.task_id) {
          formProps.task_id = x.task_id;
        }
        chrome.runtime.sendMessage({ name: 'startTracking', data: formProps, auth: getCookie("login") });
      }
      window.location = './home.html'
    })
  }
})
console.log(new Date(), new Date().toISOString().substring(0, 10), new Date().toISOString())
function getTime() {
  return ('0' + new Date().getHours()).substr(-2) + ":" +  ('0' + new Date().getMinutes()).substr(-2) ;
}
document.getElementById("start_date").valueAsDate = new Date();
document.getElementById("start_time").value = getTime();
// document.getElementById("start_date").value = new Date().toISOString().substring(0, 10);
// document.getElementById("start_time").value = new Date().toISOString().substr(11, 5);

const delay = 500;
let otimerId;
document.getElementById("lookupOwner").onkeyup = (e) => {
  clearTimeout(otimerId);
  otimerId = setTimeout(() => {
    const value = e.target.value;
    if (value === '') return document.getElementById("lookupOwnerList").style.display = "none";
    search('user?search_string=' + value).then(x => {
      document.getElementById("lookupOwnerList").style.display = "block";
      document.getElementById("OwnersList").innerHTML = "";
      x.users.forEach(el => {
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
          document.querySelector("#lookupOwner").setAttribute('data-info', x.getAttribute('data-info'));
          document.getElementById("lookupOwnerList").style.display = "none";
        })
      })
    })
  }, delay)

}

let ptimerId;
document.getElementById("lookupProject").onkeyup = (e) => {
  clearTimeout(ptimerId);
  ptimerId = setTimeout(() => {
    const value = e.target.value;

    if (value === '') return document.getElementById("lookupProjectList").style.display = "none";

    search('project?search_string=' + value).then(x => {
      document.getElementById("lookupProjectList").style.display = "block";
      document.getElementById("ProjectList").innerHTML = "";
      x.users.forEach(el => {
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
          document.querySelector("#lookupProject").setAttribute('data-info', x.getAttribute('data-info'));
          document.getElementById("lookupProjectList").style.display = "none";
        })
      })
    })

  }, delay)

}