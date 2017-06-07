import { h } from 'preact';
import { Link } from 'preact-router/match';

import Component from 'aleph/component'
import { loadComments } from '../../actions/items'

import style from './style'

export default class CommentList extends Component {
	componentDidMount() {
		loadComments(this.props.commentIds)
			.then(() => this.setState({loaded: true}))
	}

	render({commentIds, class: klass}, {loaded}) {
		if (commentIds === undefined) {
			return null
		}

		if (!loaded) {
			return <div>loading...</div>
		}

		return (
			<div class={klass}>
				{commentIds.map(id => <Comment key={id} id={id} />)}
			</div>
		)
	}
}

export class Comment extends Component {
	get data () {
		return {
			comment: `items/map.${this.props.id}`
		}
	}

	render(_, {comment}) {
		return (
			<div class={style.comment}>
				<strong>{comment.by}</strong>
				<div dangerouslySetInnerHTML={{__html: comment.text}} />

				<CommentList commentIds={comment.kids} class={style.indent} />
			</div>
		)
	}
}

