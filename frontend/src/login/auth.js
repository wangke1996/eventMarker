export function isLoggedIn() {
    return localStorage.getItem("username") && localStorage.getItem("username") !== "undefined";
}

export function getUserName() {
    let name = localStorage.getItem("username");
    if (!name || name === 'undefined')
        return '';
    return name;
}

export function requiredAuth(nextState, replace) {
    if (!isLoggedIn()) {
        replace({pathname: '/', state: {nextPathname: nextState.location.pathname}})
    }
}