import React from 'react';

export default function Listing (props) {
  const { listing } = props;

  return (
    <article className='listing'>
      <h1 className='listing-title'>
        <a href={ listing.url }>{ listing.title } ({ listing.score })</a>
      </h1>
      <ul className='listing-flatlist'>
        <li>
          <a href={ listing.permalink }>
            Comments ({ listing.num_comments })
          </a>
        </li>
        { props.showSubreddit ?
          <li>
            <a href={ `/r/${listing.subreddit}` }>
              r/{ listing.subreddit }
            </a>
          </li>
          : null }
      </ul>
    </article>
  );
}
