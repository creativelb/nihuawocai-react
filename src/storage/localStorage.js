let localStorage = window.localStorage

// 获取localstorage中的元素
export let getLocalStorage = function(key) {
    let value = localStorage.getItem(key)
    if(value) {
        return JSON.parse(value)
    }
    return value
}
// 设置localstorage中的元素
export let setLocalStorage = function(key, value) {
    if(!value && value === 0) {
        value = ''
    }
    value = JSON.stringify(value)
    localStorage.setItem(key, value)
}
// 删除localstorage中的元素
export let removeLocalStorage = function(key) {
    return localStorage.removeItem(key)
}