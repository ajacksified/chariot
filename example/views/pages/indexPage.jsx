import React from 'react';

import Listing from '../components/listing';
import Paging from '../components/paging';

export default function IndexPage (props) {
  const subredditName = props.data.subreddit ? props.data.subreddit.display_name : '';

  if (props.data.links) {
    return (
      <div>
        <h1>{ subredditName || 'reddit' }</h1>
        { props.data.links.map(l =>
          <Listing listing={ l } key={ l.id } showSubreddit={ !subredditName } />)
        }

        <Paging
          listings={ props.data.links }
          baseUrl={ props.context.path }
          query={ props.context.query }
        />
      </div>
    );
  }

  return (
    <div>
      <h1>Loading</h1>
    </div>
  );
}
