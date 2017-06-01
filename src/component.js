import { Component as _Component } from 'preact';

import Stores from './stores'

const pairs = obj => Object.keys(obj).map(k => [k, obj[k]])

export default class Component extends _Component {
	constructor (...args) {
		super(...args)

		this._listeners = new Map()
		const dataDescriptor = Object.getOwnPropertyDescriptor(this.constructor.prototype, 'data')
		this._data = dataDescriptor && dataDescriptor.get
			|| dataDescriptor && dataDescriptor.value

		this._updateData()
	}

	// This will pickup class properties after initialization
	set data (val) {
		this._data = val
		this._updateData()
	}

	componentWillReceiveProps(nextProps) {
		this._updateData(nextProps)
	}

	_updateData (props = this.props) {
		const data = this._data instanceof Function
			? this._data.call({props}, props)
			: this._data

		if (data === undefined) {
			return
		}
		this._flushListeners()

		for (const [k, path] of pairs(data)) {
			const fn = () => this.setState({[k]: Stores.get(path)})

			this._listeners.set(path, fn)
			Stores.on(path, fn)
			fn()
		}
	}

	_flushListeners () {
		for (const [path, fn] of this._listeners.entries()) {
			Stores.off(path, fn)
		}
		this._listeners = new Map()
	}
}

