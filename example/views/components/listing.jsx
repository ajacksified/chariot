import React from 'react';

export default function Listing (props) {
  return (
    <article>
      <h1>{ props.title }</h1>
      <ul>
        <li><a href={ props.permalink }>View Comments</a></li>
        <li><a href={ props.url }>View Link</a></li>
      </ul>
    </article>
  );
}
