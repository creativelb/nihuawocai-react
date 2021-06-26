import {createStore, combineReducers, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';

import player from './player/reducer.js'

let store = createStore(
    combineReducers({player}),
    applyMiddleware(thunk)
);

export default store;