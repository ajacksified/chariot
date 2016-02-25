require('babel-register')({
  ignore: false,
  only: /.+(?:(?:\.es6\.js)|(?:.jsx))$/,
  extensions: ['.js', '.es6.js', '.jsx' ],
  sourceMap: true,
  presets: [
    'es2015',
    'react',
  ],
  plugins: [
    'transform-object-rest-spread',
    'transform-async-to-generator',
    'transform-class-properties',
    'transform-react-constant-elements',
    'transform-react-inline-elements',
  ],
});

require('babel-polyfill');

require('./server.es6.js');
