import {h} from 'preact'
import {spy, mock, stub} from 'sinon'

import Component from 'component'

test('constructor() initializes without data', () => {
	spy(Component.prototype, '_updateData')
	const c = new Component()
	expect(c).toBeDefined()
	expect(c._listeners).toEqual(new Map())
	expect(c._data).toEqual(undefined)
	expect(c._updateData.callCount).toEqual(1)
	Component.prototype._updateData.restore()
})

test('constructor() initializes with static data', () => {
	spy(Component.prototype, '_updateData')
	class Foo extends Component {
		data = {foo: 'bar'}
	}
	const c = new Foo()
	expect(c).toBeDefined()
	expect(c._data).toEqual({foo: 'bar'})
	expect(c._listeners.get('bar')).toBeInstanceOf(Function)
	expect(c._updateData.callCount).toEqual(2) // called twice due to class prop
	Component.prototype._updateData.restore()
})

test('constructor() initializes with get data()', () => {
	spy(Component.prototype, '_updateData')
	class Foo extends Component {
		get data () {
			return {
				foo: 'bar'
			}
		}
	}
	const c = new Foo()
	expect(c).toBeDefined()
	expect(c._data).toBeInstanceOf(Function)
	expect(c._listeners.get('bar')).toBeInstanceOf(Function)
	expect(c._updateData.callCount).toEqual(1)
	Component.prototype._updateData.restore()
})

test('constructor() initializes with data() function', () => {
	spy(Component.prototype, '_updateData')
	class Foo extends Component {
		data () {
			return {
				foo: 'bar'
			}
		}
	}
	const c = new Foo()
	expect(c).toBeDefined()
	expect(c._data).toBeInstanceOf(Function)
	expect(c._listeners.get('bar')).toBeInstanceOf(Function)
	expect(c._updateData.callCount).toEqual(1)
	Component.prototype._updateData.restore()
})

test('_updateData() updates state and listeners', () => {
	spy(Component.prototype, '_flushListeners')
	const Stores = {
		get: path => {
			if (path === 'bar') return 'this is bar'
			if (path === 'qux') return 'this is qux'
		},
		on: () => {}
	}
	spy(Stores, 'get')
	spy(Stores, 'on')
	Component.__Rewire__('Stores', Stores)

	const c = new Component()
	spy(c, 'setState')
	c._data = {foo: 'bar', baz: 'qux'}
	c._updateData()

	expect(c._flushListeners.callCount).toEqual(1)

	expect(c.setState.callCount).toEqual(2)
	expect(c.setState.calledWith({foo: 'this is bar'})).toBeTruthy()
	expect(c.setState.calledWith({baz: 'this is qux'})).toBeTruthy()

	expect(c._listeners.size).toEqual(2)
	expect(c._listeners.get('bar')).toBeInstanceOf(Function)
	expect(c._listeners.get('qux')).toBeInstanceOf(Function)

	expect(c.state).toEqual({foo: 'this is bar', baz: 'this is qux'})

	expect(Stores.get.callCount).toEqual(2)
	expect(Stores.on.callCount).toEqual(2)

	Component.prototype._flushListeners.restore()
})

test('_flushListeners() removes all listeners', () => {
	const Stores = { off: spy() }
	Component.__Rewire__('Stores', Stores)

	const c = new Component()
	c._listeners = new Map()
	c._listeners.set('foo', 'bar')
	c._listeners.set('baz', 'qux')

	c._flushListeners()

	expect(c._listeners).toEqual(new Map())
	expect(Stores.off.callCount).toEqual(2)
})

test('componentWillReceiveProps() updates from data getter', () => {
	const c = new Component()
	c._data = function () {
		return {id: `secret-${this.props.id}`}
	}
	spy(c, '_data')
	stub(c, '_updateData')

	c.componentWillReceiveProps({id: 'foobar'})

	expect(c._data.calledWith({id: 'foobar'}))
	expect(c._updateData.calledWith({id: 'secret-id'}))
})

// test('componentWillReceiveProps() updates from data getter', () => {
// 	class Foo extends Component {
// 		data = {''}
// 		c._data = function () {
// 			return {id: `secret-${this.props.id}`}
// 		}
// 	}
// 	const c = new Foo()
// 	c._data = function () {
// 		return {id: `secret-${this.props.id}`}
// 	}
// 	spy(c, '_data')
// 	stub(c, '_updateData')

// 	c.componentWillReceiveProps({id: 'foobar'})

// 	expect(c._data.calledWith({id: 'foobar'}))
// 	expect(c._updateData.calledWith({id: 'secret-id'}))
// })
