import React from 'react';

export default function Comment (props) {
  const commentScoreClass = props.comment.score > 0 ? 'comment-positive' : 'comment-negative';

  return (
    <ul className='comment-list'>
      <li className='comment'>
        <span className='comment-author'>{ props.comment.author }</span>
        <span className={ `comment-score ${commentScoreClass }` }>
          { props.comment.score }
        </span>
        <p className='comment-body'>{ props.comment.body }</p>
        { props.comment.replies ?
          props.comment.replies.map(c => <Comment comment={ c } key={ c.id } />)
        : null }
      </li>
    </ul>
  );
}
