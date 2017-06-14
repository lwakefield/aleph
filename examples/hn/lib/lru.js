// Super simple LRU cache, probably not very efficient (see touch)
export default class LRU {
	cache = new Map()
	accessed = []

	constructor (max = 1000) {
		this.max = max
	}

	set (key, val) {
		this.cache.set(key, val)
		this.touch(key)

		if (this.accessed.length >= this.max) {
			this.evict()
		}
	}

	get (key) {
		this.touch(key)
		return this.cache[key]
	}

	touch (key) {
		const index = this.accessed.indexOf(key)
		if (index !== -1) {
			this.accessed = this.accessed.splice(index, 1)
		}
		this.accessed.push(key)
	}

	evict () {
		const stale = this.accessed.shift()
		delete this.cache[stale]
	}
}
