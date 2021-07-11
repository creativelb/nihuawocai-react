import {useSelector,useDispatch} from 'react-redux'
import { HashRouter as Router , Switch, Route, Redirect} from 'react-router-dom';

import Home from '@/pages/home/Home.jsx'
import Room from '@/pages/room/Room.jsx'
import Game from '@/pages/game/Game.jsx'
import _404 from '@/pages/404/404.jsx'

import './App.css';

function App() {

	let player = useSelector(state => state.player);

	return (
		<div className="App">
			{/* 背景音乐 */}
			<audio src={player.currentSong ? player.currentSong.src : '' } ></audio>
			<Switch>
				<Route path="/home" component={Home}></Route>
				<Route path="/room" component={Room}></Route>
				<Route path="/game" component={Game}></Route>
				<Route path="/404" component={_404}></Route>
				<Redirect to="/home"></Redirect>
				<Route path="*" component={_404}></Route>
			</Switch>
		</div>
	);
}

export default App;
