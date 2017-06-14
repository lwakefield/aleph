import Stores from 'zay/stores'

export async function loadTopStories() {
	const existingTop = Stores.get('items/top')
	if (existingTop !== undefined) return existingTop

	const top = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json')
		.then(v => v.json())
	Stores.mutate('items/top', top)

	return top
}

export async function loadItem(id) {
	const existingStore = Stores.get(`items/map.${id}`)
	if (existingStore !== undefined) return existingStore

	const post = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)
		.then(v => v.json())
	Stores.mutate(`items/map.${id}`, post)

	return post
}

export function loadItems(ids = []) {
	return Promise.all(ids.map(id => loadItem(id)))
}

export async function loadComments(ids = []) {
	const comments = await loadItems(ids)
	await Promise.all(comments.map(c => loadItems(c.kids)))
}
