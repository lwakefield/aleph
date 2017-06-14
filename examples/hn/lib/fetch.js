import fetch from 'isomorphic-unfetch'

const queue = new Set()
const listeners = new Map()

export default function (...args) {
	const promise = fetch(...args)
	queue.add(promise)
	return promise.then(value => {
		complete(promise)
		return Promise.resolve(value)
	}).catch(value => {
		complete(promise)
		return Promise.reject(value)
	})
}

function complete (promise) {
	queue.delete(promise)

	if (queue.size === 0) notify('emptied')
}

function notify (event) {
	const eventListeners = listeners.get(event) || []
	for (const fn of eventListeners) fn()
}

export function on (event, fn) {
	const existing = listeners.get(event) || new Set()
	existing.add(fn)
	listeners.set(event, existing)
}

export function off (event, fn) {
	const existing = listeners.get(event) || new Set()
	existing.delete(fn)
	listeners.set(event, existing)
}
