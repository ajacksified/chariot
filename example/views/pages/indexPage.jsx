import React from 'react';

import Listing from '../components/listing';

export default function IndexPage (props) {
  return (
    <div>
      <h1>Listings</h1>
      { props.data.listings.map(l => <Listing listing={ l } key={ l.id } />) }
    </div>
  );
}
