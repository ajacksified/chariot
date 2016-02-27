import React from 'react';

export default function BaseLayout (props) {
  return (
    <div>
      <div className='topnav'>
        <a href='/' className='topnav-logo'>reddit</a>
      </div>

      { props.children }
    </div>
  );
}
