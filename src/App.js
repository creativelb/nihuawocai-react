import {useSelector,useDispatch} from 'react-redux'
import './App.css';

function App() {

	let player = useSelector(state => state.player);

	return (
		<div className="App">
			{console.log(player)}
			<audio></audio>
		</div>
	);
}

export default App;
