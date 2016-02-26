import React from 'react';

export default function Listing (props) {
  return (
    <article>
      <h1>{ props.listing.title }</h1>
      <ul>
        <li><a href={ props.listing.permalink }>View Comments</a></li>
        <li><a href={ props.listing.url }>View Link</a></li>
      </ul>
    </article>
  );
}
