let initState = {
    play: false,
    currentTime: 0,
    currentSong: {}
}

let playerReducer = function(state = initState, action) {
    let type = action.type
    switch (type) {
        case 'changePlay':
            return {...state, play: action.data}
        case 'changeCurrentTime':
            return {...state, currentTime: action.data}
        default:
            return state
    }
}

export default playerReducer