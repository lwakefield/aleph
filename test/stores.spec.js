import {spy} from 'sinon'

import {Stores as _Stores} from 'stores'

let Stores = null
beforeEach(() => {
	Stores = new _Stores()
})

test('register() defaults to {}', () => {
	Stores.register('foo')
	expect(Stores._stores.get('foo')).toEqual({})
})

test('register() with val ', () => {
	Stores.register('foo', [])
	expect(Stores._stores.get('foo')).toEqual([])
})

test('mutate()', () => {
	Stores.register('foo')
	Stores.mutate('foo/bar', 'hello world')
	expect(Stores._stores.get('foo').bar).toEqual('hello world')
})

test('mutate() on a deep path', () => {
	Stores.register('foo')
	Stores.mutate('foo/bar.baz', 'hello world')
	expect(Stores._stores.get('foo').bar.baz).toEqual('hello world')
})

test('mutate() throws error on undefined stores', () => {
	expect(() => Stores.mutate('foo/bar', 'hello world'))
		.toThrow('Store has not been defined')
})

test('get()', () => {
	Stores.register('foo', {bar: 'baz'})
	expect(Stores.get('foo/bar')).toEqual('baz')
})

test('get() on deep path', () => {
	Stores.register('foo', {bar: {baz: 'qux'}})
	expect(Stores.get('foo/bar.baz')).toEqual('qux')
})

test('get() returns defaultVal if store is not found', () => {
	expect(Stores.get('foo')).toEqual(undefined)
	expect(Stores.get('foo/')).toEqual(undefined)

	expect(Stores.get('foo', false)).toEqual(false)
	expect(Stores.get('foo/', false)).toEqual(false)
})

test('get() returns store if there are no keys', () => {
	Stores.register('foo')
	expect(Stores.get('foo')).toEqual({})
	expect(Stores.get('foo/')).toEqual({})
})

test('get() returns defaultVal if invalid path', () => {
	Stores.register('foo')
	expect(Stores.get('foo/bar.baz', 'qux')).toEqual('qux')
})

test('on() registers a listener for the first time', () => {
	const fn = () => {}
	Stores.on('foo', fn)
	expect(Stores._listeners.get('foo')).toEqual(new Set([fn]))
})

test('on() registers multiple listeners', () => {
	const fn1 = () => {}
	const fn2 = () => {}
	Stores.on('foo', fn1)
	Stores.on('foo', fn2)
	expect(Stores._listeners.get('foo')).toEqual(new Set([fn1, fn2]))
})

test('off() removes a listener', () => {
	const fn = () => {}
	Stores._listeners.set('foo', new Set([fn]))
	Stores.off('foo', fn)
	expect(Stores._listeners.get('foo')).toEqual(new Set())
})

test('off() does not throw on non present listener', () => {
	const fn = () => {}
	Stores._listeners.set('foo', new Set())
	expect(Stores.off('foobar', fn)).toEqual(undefined)
})

test('off() does not throw on invalid listener', () => {
	const fn = () => {}
	expect(Stores.off('foobar', fn)).toEqual(undefined)
})

test('emit() calls all relevant listeners', () => {
	const listeners = new Map()
	const [
		fn1,
		fn2,
		fn3,
		fn4
	] = [
		spy(),
		spy(),
		spy(),
		spy()
	]
	listeners.set('foo',         new Set([fn1]))
	listeners.set('foo/bar',     new Set([fn2]))
	listeners.set('foo/bar.baz', new Set([fn3]))
	listeners.set('qux/bar.baz', new Set([fn4]))

	Stores._listeners = listeners

	Stores.emit('foo')
	expect(fn1.callCount).toEqual(1)
	expect(fn2.callCount).toEqual(1)
	expect(fn3.callCount).toEqual(1)
	expect(fn4.callCount).toEqual(0)
})
