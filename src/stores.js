function objGet(obj, path, defaultVal) {
    const keys = path.split('.')
    let curr = obj
    while (keys.length) {
        const key = keys.shift()
        if ((key in curr) === false) {
            return defaultVal
        }

        curr = curr[key]
    }

    return curr
}

function objSet(obj, path, val) {
    const keys = path.split('.')
    let curr = obj
    while (keys.length) {
        const key = keys.shift()

        if (keys.length === 0) {
            curr[key] = val
            return
        }

        if ((key in curr) === false) {
            curr[key] = {}
        }

        curr = curr[key]
    }
}

export class Stores {
    _stores = new Map()
    _listeners = new Map()

    register(storeName, val = {}) {
        this._stores.set(storeName, val)
    }

    mutate(path, val) {
        const [storeName, key] = path.split('/')
        const store = this._stores.get(storeName)

        if (store === undefined) throw new Error('Store has not been defined')

        objSet(store, key, val)

        this.emit(path)
    }

    get(path, defaultVal=undefined) {
        const [storeName, key] = path.split('/')
        const store = this._stores.get(storeName)

        if (store === undefined) return defaultVal
        if (key === undefined || key === '') return store

        return objGet(store, key, defaultVal)
    }

    emit (path) {
        const [storeName, keystring=''] = path.split('/')
        const parentPaths = [storeName]
        const keys = keystring.split('.')
        const currKeys = []

        this._emit(storeName)

        while (keys.length) {
            currKeys.push(keys.shift())
            const path = `${storeName}/${currKeys.join('.')}`
            this._emit(path)
        }

        for (const key of this._listeners.keys()) {
            if (key.startsWith(path) && key !== path) {
                this._emit(key)
            }
        }
    }

    _emit (path) {
        const listeners = this._listeners.get(path) || []

        for (const listener of listeners) {
            listener()
        }
    }

    on (path, fn) {
        if (this._listeners.has(path) === false) {
            this._listeners.set(path, new Set([fn]))
            return
        }

        this._listeners.get(path).add(fn)
    }

    off (path, fn) {
        if (this._listeners.has(path) === false) return

        this._listeners.get(path).delete(fn)
    }
}

const instance = new Stores()
export default instance
