import { h, Component } from 'preact'

import Stores from './stores'

const pairs = obj => Object.keys(obj).map(k => [k, obj[k]])

export default function give (propMapFn) {
	return target => connect(target, propMapFn)
}

export function connect (Target, propMapFn) {

	return class Connector extends Component {
		constructor (...args) {
			super(...args)

			this.__listeners = new Map()
			this.propMap = propMapFn(this.props)

			for (const [key, path] of pairs(this.propMap)) {
				this.__connect(key, path)
			}
		}

		componentDidUpdate () {
			const nextPropMap = propMapFn(this.props)
			const lastPropMap = this.propMap

			for (const [key, path] of pairs(nextPropMap)) {
				if (lastPropMap[key] !== path) {
					this.__disconnect(lastPropMap[key])
					this.__connect(key,  path)
				}
			}

			this.propMap = nextPropMap
		}

		__connect (key, path) {
			const fn = () => this.setState({[key]: Stores.get(path)})
			fn()
			Stores.on(path, fn)
			this.__listeners.set(path, fn)
		}

		__disconnect (path) {
			const listener = this.__listeners.get(path)
			Stores.off(path, listener)
			this.__listeners.delete(path)
		}

		render (props, state) {
			return <Target {...props} {...state} />
		}
	}

}
