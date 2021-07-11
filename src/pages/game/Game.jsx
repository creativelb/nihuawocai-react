import React, { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import appActions from '@/store/app/appActions.js' 

import { message, Input } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import './Game.scss'

import { url } from '@/utils/utils'

/**
 * 游戏页面
 * 
 * type 代表 发送和收到消息的类型 
 * 0: 新建立页面时向服务器发送数据
 * 1: 用户第一次点击时发送消息和收到消息
 * 2: 用户移动时发送坐标
 * 3: 用户松手时
 * 4: 切换笔的颜色 (切成白色就可以当做橡皮擦用)
 * 5: 切换笔的粗细
 * 6: 清屏(暂且不做这个功能)
 * 8: 答题失败,时间结束无人答题成功
 * 9: 答题成功,有人回答对了问题
 */
function Game(props) {

    const [roomId, setRoomId] = useState(useSelector(state => state.app.roomId))
    const [token, setToken] = useState(useSelector(state => state.app.token))
    const [socket, setSocket] = useState('')
    // 颜色和宽度的工具条是否显示
    const [colorTool, setColorTool] = useState(false)
    const [penWidthTool, setPenWidthTool] = useState(false)
    const c = useRef()
    const [canvasObject, setCanvasObject] = useState({})
    const [isYourTurn, setIsYourTurn] = useState(false)
    const [inputAnswer, setInputAnswer] = useState('')
    const [answer, setAnswer] = useState('')
    const [time, setTime] = useState(60)
    const [timer, setTimer] = useState('')
    const [timeShow, setTimeShow] = useState(false)

    // 真实坐标系统和canvas画布坐标系统的转化 用于传输给服务器 
    let coordinateTranslate = (trueX, trueY) => {
        let canvasWidth = 1000;
        let canvasHeight = 1000;
        let canvasBox = canvasObject.el.getBoundingClientRect(); //获取canvas元素的边界框
        return {
            //对canvas元素大小与绘图表面大小不一致时进行缩放 1000为canvas画布的宽高
            x: (trueX - canvasBox.left)*(canvasWidth/canvasBox.width), 
            y: (trueY - canvasBox.top)*(canvasHeight/canvasBox.height)
        }
    }

    let receiveMessage = (e) => {
        console.log(e);
        let {type, data} = JSON.parse(e.data)
        if(type === 1) {
            canvasObject.ctx.beginPath();
            canvasObject.ctx.moveTo(data.position.x, data.position.y)
        }else if(type === 2) {
            canvasObject.ctx.lineTo(data.position.x, data.position.y)
            canvasObject.ctx.stroke()
            canvasObject.ctx.beginPath();
            canvasObject.ctx.moveTo(data.position.x, data.position.y)
        }else if(type === 3) {
            setAnswer(data.answer)
            setIsYourTurn(data.isYourTurn)
            // 如果轮到你画 就把答案露出来
            let t = setInterval(() => {
                setTime((prev) => {
                    if(prev === '') return 60
                    prev = prev-1
                    if(prev === 0) clearInterval(t)
                    return prev
                })
            }, 1000);
            setTimer(t)
            setTimeShow(true)

        }else if(type === 4) {
            canvasObject.ctx.strokeStyle = data.color
            setCanvasObject((prev) => {
                return {
                    ...prev,
                    color: data.color
                }
            })
            setColorTool(false)
        }else if(type === 5) {
            canvasObject.ctx.lineWidth = data.penWidth
            setCanvasObject((prev) => {
                return {
                    ...prev,
                    width: data.penWidth
                }
            })
            setPenWidthTool(false)
            console.log('penWidth:' + data.penWidth);
        }else if(type === 8) {
            message.warning({
                content: '很可惜,答题失败~',
                style: {
                    marginTop: '10vh',
                },
            });
            setTimeout(() => {
                props.history.replace('/home')    
            }, 1000);
        }else if(type === 9) {
            message.success({
                content: `恭喜${data.token}答对了~`,
                style: {
                    marginTop: '10vh',
                },
            });
            setTimeout(() => {
                props.history.replace('/home')    
            }, 1000);
        }
    }
    // 点击开始 移动 结束
    let canvasTouchStart = (e) => {
        console.log(e);
        let position = coordinateTranslate(e.touches[0].clientX, e.touches[0].clientY)
        canvasObject.ctx.beginPath();
        canvasObject.ctx.moveTo(position.x, position.y)
        // 暂时关闭yourturn逻辑 多用户调试时再开启
        if(!isYourTurn) {
            message.warning({
                content: '现在还没轮到你',
                style: {
                    marginTop: '10vh',
                },
            });
            return
        }
        let params = {
            type: 1,
            data:{
                roomId,
                token,
                position
            }
        }
        socket.send(JSON.stringify(params))
    }

    let canvasTouchMove = (e) => {
        if(!isYourTurn) return
        let position = coordinateTranslate(e.touches[0].clientX, e.touches[0].clientY)
        // canvas.ctx.beginPath()
        canvasObject.ctx.lineTo(position.x, position.y)
        canvasObject.ctx.stroke()
        canvasObject.ctx.beginPath()
        canvasObject.ctx.moveTo(position.x, position.y)
        let params = {
            type: 2,
            data:{
                roomId,
                token,
                position
            }
        }
        socket.send(JSON.stringify(params))
    }

    let canvasTouchEnd = (e) => {
        console.log(e);
    }

    let changeColor = (color) => {
        let params = {
            type: 4,
            data:{
                roomId,
                token,
                color
            }
        }
        socket.send(JSON.stringify(params))
    }

    let changePenWdith = (penWidth) => {
        let params = {
            type: 5,
            data:{
                roomId,
                token,
                penWidth
            }
        }
        socket.send(JSON.stringify(params))
    }

    let verifyAnswer = () => {
        if(inputAnswer === answer) {
            let params = {
                type: 9,
                data:{
                    roomId,
                    token
                }
            }
            socket.send(JSON.stringify(params))
        }else {
            setInputAnswer('')
        }
    }

    if(socket && typeof socket === 'object') {
        
        socket.onmessage = receiveMessage;
    }

    useEffect(() => {
        if(typeof time === 'number' && time <= 0) {
            message.warning({
                content: '很可惜,答题失败~',
                style: {
                    marginTop: '10vh',
                },
            });
            let params = {
                type: 8,
                data:{
                    roomId,
                    token
                }
            }
            socket.send(JSON.stringify(params))
            setTimeout(() => {
                props.history.replace('/home')    
            }, 1000);
        }
    }, [time])

    useEffect(() => {
        // canvas相关
        let canvasEl = c.current
        let ctx = c.current.getContext('2d')
        setCanvasObject({
                el: canvasEl,
                ctx: ctx,
                color: '#000',
                width: 3})
        // 设置canvas区域的大小 应该为方形区域 最大为800px*800px
        let gameEl = document.querySelector('.Game')
        let height = gameEl.clientHeight
        let width = gameEl.clientWidth - 40
        let size = Math.min(height, width, 800)
        c.current.style.width = size + 'px'
        c.current.style.height = size + 'px'
        // socket 相关 url = localhost:8080 或 123.57.41.220:8080
        const socket = new WebSocket(`ws://${url}/socketGame`)
        socket.addEventListener('open', function (event) {
            socket.send(JSON.stringify({
                type: 0,
                data: {roomId, token}
            }))
        });
        socket.addEventListener("close", function (event) {
        });
        setSocket(socket)
        return () => {
            // 离开前关闭socket
            socket.close(1000, JSON.stringify({roomId, token}))
            // 离开前如果定时器没关就要关闭
            clearInterval(timer)
        }
    }, [])

    return (
        <div className="Game">
            <div className="time" style={{display: timeShow ? 'block' : 'none'}}>
                还剩{time}秒
            </div>
            <div className="answer" style={{display: isYourTurn ? 'block' : 'none'}}>
                {answer}
            </div>
            <div className="home" onClick={() => props.history.push('/home')}>
                <HomeOutlined style={{fontSize: '20px'}}/>
            </div>
            <canvas 
                ref={c} 
                width="1000" 
                height="1000" 
                className="canvas"
                onTouchStart={canvasTouchStart}
                onTouchMove={canvasTouchMove}
                onTouchEnd={canvasTouchEnd}>
            </canvas>
            <div className="input-wapper">
                <Input 
                    placeholder="答案" 
                    disabled={isYourTurn} 
                    onChange={(e) => {setInputAnswer(e.target.value); console.log(e.target.value);}}
                />
                <div className="submit" onClick={verifyAnswer}>
                    提交
                </div>
            </div>
            <div className="tools">
                <div className="color-tool" onClick={() => {setColorTool(true)}}>
                    <ul className="color-list" style={{display: colorTool ? 'block' : 'none'}}>
                        <li className="color-item" onClick={() => changeColor('#000')}><span></span><span>黑色</span></li>
                        <li className="color-item" onClick={() => changeColor('#FF0000')}><span></span><span>红色</span></li>
                        <li className="color-item" onClick={() => changeColor('#FFF')}><span></span><span>白色</span></li>
                    </ul>
                    <span>颜色</span>
                </div>
                <div className="penwidth-tool" onClick={() => {setPenWidthTool(true)}}>
                    <ul className="penwidth-list" style={{display: penWidthTool ? 'block' : 'none'}}>
                        <li className="penwidth-item" onClick={() => changePenWdith(1)}><span></span><span>1</span></li>
                        <li className="penwidth-item" onClick={() => changePenWdith(5)}><span></span><span>5</span></li>
                        <li className="penwidth-item" onClick={() => changePenWdith(8)}><span></span><span>8</span></li>
                    </ul>
                    <span>粗细</span>
                </div>
            </div>
        </div>
    )
}

export default Game