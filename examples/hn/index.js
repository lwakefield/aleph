import './style';

import { h } from 'preact';
import { Router } from 'preact-router';

import Header from './components/header';
import Home from './routes/home';
import Profile from './routes/profile';
import Item from './routes/item'

import Stores from 'aleph/stores'

Stores.register('items')

export default () => (
	<div id="app">
		<Header />
		<div class="container">
			<Router>
				<Home path="/" />
				<Item path="/item/:id" />
			</Router>
		</div>
	</div>
);
