import { HashRouter, Switch, Route, Redirect } from 'react-router-dom';
import React, { useState } from 'react'

import { Input, Button, message } from 'antd';

import {cancelBubble} from '@/utils/utils.js'
import {uuid} from '@/utils/uuid.js'

import './Home.scss'

function Home(props) {

    const [roomIdDialogShow, setRoomIdDialogShow] = useState(false)
    const [roomId, setRoomId] = useState('')

    let startGame = () => {
        let roomId = uuid();
        let state = {roomId: roomId}
        props.history.push({pathname: '/room', state})
    }

    let joinGame = () => {
        setRoomIdDialogShow(true)
    }

    let inputRoomId = (e) =>{
        setRoomId(e.target.value)
    }
    let joinRoom = () => {
        if(!roomId) {
            // message.info('This is a normal message');
            message.error({
                content: '房间id不能为空',
                className: 'Home-message-error',
                duration: 1
            })
            return
        } 
        Promise.resolve().then(() => {
            // roomid 模拟拿rooid向服务器发送请求的过程
            props.history.push({
                pathname: '/room',
                state: {roomId: roomId}
            })
        })
    }

    return (
        <div className="Home">
            <div className="create-game" onClick={startGame}>
                开始游戏
            </div>
            <div className="join-game" onClick={joinGame}>
                加入游戏
            </div>
            <div className="dialog" onClick={() => {setRoomIdDialogShow(value => {return false})}} style={{display: roomIdDialogShow ? '' : 'none'}}>
                <div className="roomid-dialog" onClick={cancelBubble}>
                    <h4>请输入房间id:</h4>
                    <Input placeholder="房间id" onChange={inputRoomId}></Input>
                    <Button onClick={joinRoom}>确定</Button>
                </div>
            </div>
        </div>
    )
}

export default Home