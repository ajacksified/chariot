import 'babel-polyfill';
import throttle from 'lodash/throttle';
import React from 'react-dom';
import { ClientApp as Horse } from 'horse';

import Chariot from './app';

export default class Client extends Chariot(Horse) {
  static findLinkParent(el) {
    if (el.parentNode) {
      if (el.parentNode.tagName === 'A') {
        return el.parentNode;
      }

      return Client.findLinkParent(el.parentNode);
    }
  }

  static onLoad(fns) {
    const fireNow =
      document.readyState === 'complete' || document.readyState === 'interactive';

    fns.forEach(f => {
      if (fireNow) {
        f();
      } else {
        window.addEventListener('DOMContentLoaded', f);
      }
    });
  }

  static setTextContent(node, text) {
    if (node.textContent) {
      node.textContent = text;
    } else if (node.innerText) {
      node.innerText = text;
    }
  }

  constructor (config) {
    super(config);

    this.config = config;
    this.config.mountPoint = document.getElementById(config.mountPoint || 'app-container');

    this.start = this.start.bind(this);
    this.redirect = this.redirect.bind(this);

    // cache common dom refs
    this.dom = {
      $body: document.body,
      $head: document.head,
      $title: document.getElementsByTagName('title')[0],
      $mount: config.mountPoint,
    };

    this.referrer = document.referrer;

    this.middleware = config.middleware || [];
    this.middleware.push(this.modifyContext.bind(this));
    this.middleware.forEach(m => this.enableMiddleware(m));

    this.emitter.setMaxListeners(config.maxListeners || 30);

    this.history = window.history || window.location.history;
    this.scrollCache = {};
    this.initialUrl = this.fullPathName();
  }

  buildContext (href) {
    const request = this.buildRequest(href);
    const app = this;

    return {
      ...request,
      request,
      req: request,
      redirect: app.redirect,
      error: app.error,
    };
  }

  loadRoutes(routes) {
    routes(this);
  }

  async modifyContext (ctx, next) {
    ctx.redirect = this.redirect;
    ctx.env = 'CLIENT';
    ctx.props = ctx.props || {};
    ctx.props.dataCache = this.getState('dataCache');
    console.log('set props', ctx.props);
    await next();
  }

  enableMiddleware(middleware) {
    this.router.use(middleware);
  }

  bindScrolling () {
    window.addEventListener('scroll', throttle(() => {
      this.emit('document:scroll');
    }, 60));
  }

  bindResize() {
    // keep track of width for resize events
    if (!this.startingWidth) {
      this.startingWidth = window.innerWidth;
    }

    if (!this.startingHeight) {
      this.startingHeight = window.innerHeight;
    }

    window.addEventListener('resize', throttle(() => {
      this.emit('document:resize');

      if (window.innerWidth !== this.startingWidth) {
        this.emit('document:resize:width');
      }

      if (window.innerWidth !== this.startingWidth) {
        this.emit('document:resize:height');
      }
    }));
  }

  bindHistory () {
    // If we have history, go ahead and bind links to app renders. It's
    // reasonable to assume that we have a decently modern browser.
    // render for the first time for mounting
    if (history) {
      this.dom.$body.addEventListener('click', (e) => {
        let $link = e.target;

        if ($link.tagName !== 'A') {
          $link = Client.findLinkParent($link);
        }

        if (!$link) {
          return;
        }

        const href = $link.getAttribute('href');
        const currentUrl = this.fullPathName;

        // Don't actually follow the link unless it's internal
        if (
          ($link.target === '_blank' || $link.dataset.noRoute === 'true') ||
          href.indexOf('//') > -1
        ) {
          return;
        }

        e.preventDefault();

        // Set the current url scrollcache, for navigation changes to restore
        this.scrollCache[currentUrl] = window.scrollY;

        // Don't follow links to fragments
        if (href.indexOf('#') === 0) {
          return;
        }

        this.pushState(null, null, href);
        this.initialUrl = this.fullPathName();

        this.render(this.initialUrl, false).then((ctx) => {
          this.dom.$body.scrollTop = 0;
          this.scrollCache[this.initialUrl] = 0;

          if (ctx.props && ctx.props.title) {
            this.setTitle(ctx.props.title);
          }
        });
      });

      window.addEventListener('popstate', () => {
        const href = this.fullPathName();
        this.scrollCache[this.initialUrl] = window.scrollY;

        this.render(href, false).then((props) => {
          if (this.scrollCache[href]) {
            this.dom.$body.scrollTop = this.scrollCache[href];
          }

          this.setTitle(props.title);
        });

        this.initialUrl = href;
      });
    }
  }

  pushState(data, title, url) {
    if (this.history) {
      history.pushState(data, title, url);
    }
  }

  redirect(url) {
    this.pushState(null, null, url);
    this.render(this.fullPathName(), false).then((props) => {
      this.setTitle(props.title);
    });
  }

  setTitle(title) {
    if (title) {
      Client.setTextContent(this.dom.$title, title);
    }
  }

  start() {
    if (this.started) {
      throw new Error('Attempted to run `start` twice');
    }

    Object.keys(this.config).forEach(key => {
      if (window.bootstrap.config[key]) {
        this.config[key] = window.bootstrap.config[key];
      }
    });

    if (window.bootstrap) {
      this.resetState(window.bootstrap);
    }

    this.render(this.initialUrl, true).then(() => {
      this.bindScrolling();
      this.bindResize();
      this.bindHistory();
      this.started = true;
      this.setState('dataCache');
    });
  }

  async render (href, firstLoad, modifyContext) {
    const mountPoint = this.dom.$mount;

    if (!mountPoint) {
      throw new Error(
        'Please define a `mountPoint` on your ClientApp for the react element to render to.'
      );
    }

    let ctx = this.buildContext(href);

    if (modifyContext) {
      ctx = modifyContext(ctx);
    }

    if (firstLoad) {
      ctx.props = this.getState();
    }

    await this.route(ctx);

    try {
      React.render(ctx.body, mountPoint);
    } catch (e) {
      console.log(e);
      //this.error(e, ctx, this);
    }

    return Promise.resolve(ctx);
  }
}
