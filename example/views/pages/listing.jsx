import React from 'react';

import Listing from '../components/listing';
import Comment from '../components/comment';

export default function IndexPage (props) {
  return (
    <div>
      <Listing listing= { props.data.listing } />
      { props.data.comments.map(c => <Comment comment={ c } key={ c.id } />) }
    </div>
  );
}
