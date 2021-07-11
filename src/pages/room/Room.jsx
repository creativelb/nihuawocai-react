import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import appActions from '@/store/app/appActions.js' 

import './Room.scss'

import { url } from '@/utils/utils'

/**
 * websocket传递消息 type字段含义
 * 0: 建立连接后发送的第一次请求
 * 1: 准备和取消准备
 * 2: 
 * 3: ...
 * @returns 
 */

function Room(props) {

    const dispatch = useDispatch()
    dispatch(appActions.changeRoomId(props.location.state.roomId))

    console.log('token:' + useSelector(state => state.app.token));
    const [roomId, setRoomId] = useState(useSelector(state => state.app.roomId))
    const [token, setToken] = useState(useSelector(state => state.app.token))

    const [userList, setUserList] = useState([])
    const [socket, setSocket] = useState('')
    const [isPrepare, setIsParepare] = useState(0)

    const receiveMessage = (e) => {
        console.log(e);
        let d = JSON.parse(e.data)
        let {type, data} = d
        
        switch (type) {
            case 0:
                let users = data.map(user => {
                    return {
                        name: user.token,
                        status: user.isPrepare
                    }
                })
                setUserList([...users])
                break;
            case 1:
                let userList_copy;
                setUserList(userList => {
                    userList =  userList.map(user => {
                        if(user.name === data.token) {
                            user.status = data.isPrepare
                            if(user.name === token) {
                                setIsParepare(data.isPrepare)
                            }
                        }
                        return user
                    })
                    // 因为react setstate是异步的 所以将变量保存一下使用
                    userList_copy = userList
                    return [...userList]
                })
                // 房间内人数超过两位 且 没有未准备的人 就进入游戏
                if(!userList_copy.find(user => user.status === 0) && userList_copy.length > 1) {
                    props.history.push('/game')
                }
                break
        }
    }

    const handlePreapre = () => {
        let message = {
            type: 1,
            data: {
                roomId: roomId,
                token,
                isPrepare: isPrepare === 0 ? 1 : 0
            }
        }
        socket.send(JSON.stringify(message))
    }

    useEffect(() => {
        let user = {name: token, status: 0}
        setUserList(userList => {
            userList.push(user)
            return userList
        })
        // socket 相关 url = localhost:8080 或 123.57.41.220:8080
        const socket = new WebSocket(`ws://${url}/socketRoom`)
        setSocket(socket)
        socket.addEventListener('open', function (event) {
            console.log(event)
            socket.send(JSON.stringify({
                type: 0,
                data: {roomId, token}
            }))
        });
        socket.addEventListener("message", receiveMessage);
        socket.addEventListener("close", function (event) {
        });
        return () => {
            socket.close(1000, JSON.stringify({roomId, token}))
        }
    }, [])

    useEffect(() => {
        console.log('userList:' );
        console.log(userList);
    }, [userList])

    return (
        <div className="Room">
            {
                userList.length === 0 ?
                (<h4>暂无数据</h4>) :
                <ul>
                    {
                        userList.map(user => {
                            return (
                                <li className="user-item" key={user.name}>
                                    <div>
                                        <span>姓名: {user.name}</span>
                                        {
                                            user.name === token ? <span className="tag">我</span> : ''
                                        }
                                    </div>
                                    <div className={user.type === 0 ? 'has-prepare' : 'no-prepare'}>状态: {user.status === 0 ? '未准备' : '已准备'}</div>
                                </li>
                            )
                        })
                    }
                </ul>
            }
            <div className="prepare" onClick={handlePreapre}>
                {isPrepare ? '取消准备' : '请准备'}
            </div>
        </div>
    )
}

export default Room