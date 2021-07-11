export let cancelBubble = function(event) {
    //阻止冒泡
    event = event || window.event;
    if(event && event.stopPropagation) {
        event.stopPropagation();
    }else {
        event.cancelBubble = true;
    }
}

let url1 = 'localhost:8080'
let url2 = '123.57.41.220:8080'

export let url = url2