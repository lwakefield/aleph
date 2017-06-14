import { h } from 'preact';
import style from './style';
import { Link } from 'preact-router/match';

import Component from 'zay/component'

import PostListItem from '../../components/post-list-item'
import { loadTopStories } from '../../actions/items'

export default class Home extends Component {
	data = {
		top: 'items/top'
	}

	componentDidMount() {
		loadTopStories()
	}

	render({page=0}, {top = []}) {
		const [start, end] = getStartAndEnd(page, 20)

		return (
			<div>
				<div>
					{
						range(start, end).map(index =>
							<Item key={index} position={index} id={top[index]} />
						)
					}
				</div>

				<PageLinks currentPage={page} />
			</div>
		);
	}
}

function getStartAndEnd (unparsedPage, perPage) {
	const page = parseInt(unparsedPage)
	return [page * perPage, (page * perPage) + perPage]
}

function range (start, end) {
	const result = []
	for (let i = start; i < end; i++) {
		result.push(i)
	}
	return result
}

function Item ({position, id}) {
	return (
		<div class={style.listItem}>
			<div class={style.itemPosition}>{ position }.</div>
			{
				id !== undefined
					? <PostListItem id={id} />
					: 'loading...'
			}
		</div>
	)
}


function PageLinks ({currentPage}) {
	const parsedPage = parseInt(currentPage)

	const prevPage = parsedPage ?
		<Link href={`/?page=${parsedPage - 1}`}>Prev</Link> :
		<span class={style.disabled}>Prev</span>
	return (
		<div class={style.footer}>
			{prevPage}
			<span>&nbsp;|&nbsp;</span>
			<Link href={`/?page=${parsedPage + 1}`}>Next</Link>
		</div>
	)
}
