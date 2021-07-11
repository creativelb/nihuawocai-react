export function changeRoomId(roomId) {
    return {
        type: 'change_roomId',
        data: roomId
    }
}

// 清空redux的roomId 设为0就是清空了
export function clearRoomId() {
    return {
        type: 'change_roomId',
        data: 0
    }
}