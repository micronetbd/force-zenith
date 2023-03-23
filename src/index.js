if (getCookie("login")) window.location = "./home.html";

document.getElementById("login").onclick = () => {
    const formEl = document.forms.loginform;
    const formData = new FormData(formEl);
    login(formData)
}