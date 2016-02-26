import React from 'react';

import Listing from '../components/listing';

export default function IndexPage (props) {
  if (props.data.links) {
    return (
      <div>
        <h1>Listings</h1>
        { props.data.links.body.map(l => <Listing listing={ l } key={ l.id } />) }
      </div>
    );
  }

  return (
    <div>
      <h1>Loading</h1>
    </div>
  );
}
