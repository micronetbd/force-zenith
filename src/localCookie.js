// Although these fucntions indicate that cookies can be get and set, the
// data actually stays in local storage (NOT A COOKIE) As such, expiration is irrelvant
// in the response since the local storage will not expire until the user does so manually

function setCookie(name, value, hours) {
    var now = new Date();
    var expirationTime = now.getTime() + hours * 60 * 60 * 1000;
    var expires = new Date(expirationTime);
    localStorage.setItem(name, JSON.stringify({ value: value, expires: expires }));
}

function getCookie(name) {
    var cookie = JSON.parse(localStorage.getItem(name));
    if (cookie == null || cookie.expires > new Date()) {
        localStorage.removeItem(name);
        return null;
    } else {
        return cookie.value;
    }
}