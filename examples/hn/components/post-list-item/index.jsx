import { h } from 'preact';
import { Link } from 'preact-router/match';

import Component from 'zay/component'
import { loadItem } from '../../actions/items'

import style from './style'

export default class PostListItem extends Component {
	get data () {
		return {
			post: `items/map.${this.props.id}`
		}
	}

	componentDidMount() {
		loadItem(this.props.id)
	}

	render(_, {post}) {
		if (!post) {
			return <div class={style.post}>loading...</div>
		}

		return (
			<div class={style.post}>
				<PostLink class={style.title} href={post.url || `/item/${post.id}`}>
					<span>{post.title}</span>
				</PostLink>

				<div class={style.footer}>
					<span>{ post.score } points</span>
					&nbsp;
					<span>by { post.by }</span>
					&nbsp;|&nbsp;

					<Link href={`/item/${post.id}`}>
						<Comments post={post} />
					</Link>
				</div>
			</div>
		)
	}
}

function Comments ({post}) {
	const text = `${post.descendants || 'no'} comments`
	return <span>{text}</span>
}

function PostLink (props) {
	const { post = {} } = props
	return post.url ? h(Link, props) : h('a', props)
}
