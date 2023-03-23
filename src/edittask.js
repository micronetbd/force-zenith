const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

function paramsToObject(entries) {
  const result = {}
  for (const [key, value] of entries) {
    result[key] = value;
  }
  return result;
}

function getNextDay(dateString) {
  var date = new Date(dateString);
  date.setDate(date.getDate() + 1);
  var year = date.getFullYear();
  var month = ("0" + (date.getMonth() + 1)).slice(-2);
  var day = ("0" + date.getDate()).slice(-2);
  return year + "-" + month + "-" + day;
}
// document.getElementById("taskstatus").onchange = () => {
//   let t = document.getElementById("taskstatus").value;
//   if (t == "Completed") {
//     document.getElementById("endtime").style.display = 'flex';
//   } else {
//     document.getElementById("endtime").style.display = 'none';
//   }
// }


var taskstatus = localStorage.getItem('default_task_status')
taskstatus = taskstatus.split(',');
taskstatus.forEach(el => {
  document.getElementById("taskstatus").innerHTML += `
  <option value="${el}">${el}</option>
  `
});

const entries = urlParams.entries();
const params = paramsToObject(entries);
// if (params.status === 'Completed') {
//   document.getElementById("endtime").style.display = 'flex';
// }
console.log('params', params);
var form = document.querySelector('form')
let sd = new Date(params.start_date);
let ed = new Date(params.end_date);
// console.log(params, ed)
form["start_date"].value = sd.toISOString().substr(0, 10);
form["start_time"].value = params.start_date.substr(11);
if (ed !== "Invalid Date" && params.end_date !== "") {
  form["end_date"].value = ed.toISOString().substr(0, 10);
  form["end_time"].value = params.end_date.substr(11);
}
if (params.end_date === "") {
  form["end_date"].value = ''
  form["end_time"].value = ''
}
form["owner"].value = params.user_name;
form["status"].value = params.status;
form["description"].value = params.description;
document.getElementById("taskstatus").value = params.status;
// form["description"].value = JSON.parse(params.description.replace(/&quot;/g, '"'));
// console.log('form', JSON.stringify(params.description))
// console.log('form', JSON.parse((params.description.replace(/&quot;/g, '"').replace(/\n/g, " "))), params.description)
document.querySelector("#lookupOwner").setAttribute('data-info', params.user_id);

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
document.forms.editTaskForm.addEventListener('submit', (event) => {
  event.preventDefault();

  var form = document.querySelector('form')
  const formData = new FormData(form);
  const formProps = Object.fromEntries(formData);
  var editdata = {};

  editdata.owner = document.querySelector("#lookupOwner").getAttribute('data-info');
  editdata.start_date = formProps.start_date + " " + formProps.start_time;
  editdata.end_date = formProps.end_date + " " + formProps.end_time;
  editdata.description = formProps.description;
  editdata.status = formProps.status;
  editdata.project_id = params.project_id;
  editdata.type = params.type;
  editdata.name = params.name;
  editdata.task_id = params.task_id;
  editdata.hours = parseInt(params.hours);
  editdata.minutes = parseInt(params.minutes);
  // console.log(editdata, formProps.end_date, formProps.end_time, new Date(editdata.end_date))
  if (new Date(editdata.end_date) == "Invalid Date") {
    delete editdata.end_date;
    // console.log("deleted", editdata)
  }

  const requiredFields = form.querySelectorAll('[required]');
  let allFieldsValid = true;
  requiredFields.forEach(function (field) {
    if (!field.checkValidity()) {
      allFieldsValid = false;
    }
  });
  if (allFieldsValid) {
    editTask(editdata).then((x) => {
      if (editdata.status == "In Progress") {
        chrome.runtime.sendMessage({ name: 'startTracking', data: editdata, auth: getCookie("login") });
      } else {
        chrome.runtime.sendMessage({ name: 'pauseTracking', data: editdata.task_id });
      }
      window.location = './home.html'
    })
  }
  // }
})