import React from 'react';
import querystring from 'querystring';

export default function Paging (props) {
  if (!props.listings || !props.listings.length) { return (<ul />); }
  const {
    listings,
    query = {},
    baseUrl = '/',
  } = props;

  const page = parseInt(query.page) || 0;

  const before = listings[0].name;
  const after = listings[listings.length -1].name;

  delete query.before;
  delete query.after;
  delete query.page;

  let beforeEl;
  let afterEl;

  if (page > 0) {
    const qs = querystring.stringify({
      ...query,
      before,
      page: page - 1,
    });
    beforeEl = (
      <li className='paging-before'>
        <a href={ `${baseUrl}?${qs}` }>
          &lt; prev page
        </a>
      </li>
    );
  }

  const qs = querystring.stringify({
    ...query,
    after,
    page: page + 1,
  });

  afterEl = (
    <li className='paging-after'>
      <a href={ `${baseUrl}?${qs}` }>
        next page &gt;
      </a>
    </li>
  );

  return (
    <ul className='paging'>
      { beforeEl }
      { afterEl }
    </ul>
  );
}
