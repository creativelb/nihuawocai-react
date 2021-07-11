import {getLocalStorage, setLocalStorage} from '@/storage/localStorage.js'
import {uuid} from '@/utils/uuid'


let token = getLocalStorage('token')
if(!token) {
    token = uuid()
    setLocalStorage('token', token)
}

let init = {
    token: token,
    roomId: ''
}

let appReducer = function(state = init, action) {
    let type = action.type
    switch (type) {
        case 'change_token':
            if(!action.data === state.token) {
                setLocalStorage('token', action.data)
                return {...state, token: action.data}
            }
        case 'change_roomId': {
            let roomId = action.data
            return {...state, roomId}
        }
        default:
            return state
    }
}

export default appReducer