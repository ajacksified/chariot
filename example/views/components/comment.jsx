import React from 'react';

export default function Comment (props) {
  return (
    <ul>
      <b>{ props.comment.author } - { props.comment.score }</b>
      <p>{ props.comment.body }</p>
      { props.replies ? 
        <ul>
          { props.replies.map(c => <Comment comment={ c } key={ c.id } />) }
        </ul>
      : null }
    </ul>
  );
}