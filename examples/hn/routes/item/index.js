import { h } from 'preact';
import { Link } from 'preact-router/match';

import Component from 'zay/component'

import CommentList from '../../components/comment'
import { loadItem } from '../../actions/items'
import style from './style';

export default class Item extends Component {
	get data () {
		return { post: `items/map.${this.props.id}`}
	}

	componentDidMount() {
		loadItem(this.props.id)
	}

	render({}, {post}) {
		if (post === undefined) {
			return <div class={style.item}>{'loading...'}</div>
		}
		return (
			<div>
				<Title post={post} />
				<Body post={post} />
				<hr />
				<div>
					<CommentList commentIds={post.kids} />
				</div>
			</div>
		)
	}
}

function Title ({post}) {
	return <h2>{post.title}</h2>
}

function Body ({post}) {
	if (post.text === undefined) return null

	return <div dangerouslySetInnerHTML={{__html: post.text}} />
}
