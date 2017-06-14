import { stub } from 'sinon'

import fetch,
	{
		__Rewire__,
		__ResetDependency__,
		on,
		off
	}
from '../../lib/fetch'

const wait = (t, v) => new Promise(
	resolve => setTimeout(() => resolve(v), t)
)

beforeEach(() => __ResetDependency__('fetch'))

test('fetch()', async () => {
	__Rewire__('fetch', val => wait(100, val))

	const start = Date.now()
	const res = await fetch('foo')
	const elapsed = Date.now() - start

	expect(res).toEqual('foo')
	expect(elapsed >= 100).toBeTruthy()
	expect(elapsed < 110).toBeTruthy()
})

describe('on()', () => {
	it('listens to emptied events', async () => {
		__Rewire__('fetch', val => wait(100, val))
		const fn = stub()

		on('emptied', fn)

		await fetch('foo')
		expect(fn.callCount).toEqual(1)

		await fetch('foo')
		expect(fn.callCount).toEqual(2)
	})
	it('listens and waits for emptied events', async () => {
		__Rewire__('fetch', t => wait(t))
		const fn = stub()

		on('emptied', fn)

		const start = Date.now()
		fetch(100)
		await fetch(200)
		const elapsed = Date.now() - start
		expect(fn.callCount).toEqual(1)
		expect(elapsed >= 200).toBeTruthy()
		expect(elapsed < 210).toBeTruthy()
	})
})


test('off()', async () => {
	__Rewire__('fetch', t => wait(t))
	const fn = stub()

	on('emptied', fn)
	await fetch(100)
	off('emptied', fn)
	await fetch(100)

	expect(fn.callCount).toEqual(1)
})
