import React from 'react';

export default function DefaultLayout (props) {
  const { config } = props;
  const { manifest } = config;

  let css = manifest['base.css'];
  let js = manifest['client.js'];

  if (config.minifyAssets) {
    css = manifest['base.min.css'];
    js = manifest['client.min.js'];
  }

  css = `${config.assetPath}/css/${css}`;
  js = `${config.assetPath}/js/${js}`;

  return (
    <html>
      <head>
        <title>{ props.title }</title>
        <link href={ css } rel='stylesheet' />
      </head>
      <body>
        <div id='app-container'>
          <div>
            <a href='/'>reddit.com</a>
          </div>

          { props.children }
        </div>

        <script src={ js } async='true' />
      </body>
    </html>
  );
}
