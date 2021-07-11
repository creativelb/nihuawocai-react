import {createStore, combineReducers, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';

import player from './player/reducer.js'
import app from './app/reducer.js'

let store = createStore(
    combineReducers({player, app}),
    applyMiddleware(thunk)
);

export default store;