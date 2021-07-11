import React from 'react';
import ReactDOM from 'react-dom';

import App from './App';
import reportWebVitals from './reportWebVitals';

import store from './store/store.js';
import { Provider } from 'react-redux';
import { HashRouter } from 'react-router-dom';

import './style/base.css'
import './style/normalize.css'
import './style/mixin.scss'
import './style/variable.scss'
import 'antd/dist/antd.css';

ReactDOM.render(
	<Provider store={store}>
		<HashRouter>
			<React.StrictMode>
				<App />
			</React.StrictMode>
		</HashRouter>
	</Provider>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
