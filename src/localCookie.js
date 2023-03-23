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