import 'babel-polyfill';
import throttle from 'lodash/throttle';
import Horse from 'horse-react/src/client';

import Chariot from './app';

const App = Chariot(Horse);

export default class Client {
  static findLinkParent(el) {
    if (el.parentNode) {
      if (el.parentNode.tagName === 'A') {
        return el.parentNode;
      }

      return Client.findLinkParent(el.parentNode);
    }
  }

  constructor (config) {
    this.config = config;
    this.config.mountPoint = document.getElementById(config.mountPoint || 'app-container');

    // cache common dom refs
    this.dom = {
      $body: document.body,
      $head: document.head,
      $title: document.getElementsByTagName('title')[0],
      $mount: config.mountPoint,
    };

    this.referrer = document.referrer;

    this.app = new App({
      ...config,
    });

    this.middleware = config.middleware || [];
    this.middleware.push(this.modifyContext.bind(this));
    this.middleware.forEach(m => this.enableMiddleware(m));

    this.app.emitter.setMaxListeners(config.maxListeners || 30);

    this.history = window.history || window.location.history;
    this.scrollCache = {};
    this.initialUrl = this.app.fullPathName();
  }

  loadRoutes(routes) {
    routes(this.app);
  }

  async modifyContext (ctx, next) {
    ctx.redirect = this.redirect.bind(this);
    ctx.env = 'CLIENT';
    await next();
  }

  enableMiddleware(middleware) {
    this.app.router.use(middleware);
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
        const currentUrl = this.app.fullPathName;

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
        this.initialUrl = this.app.fullPathName();

        this.app.render(this.initialUrl, false).then((ctx) => {
          this.dom.$body.scrollTop = 0;
          this.scrollCache[this.initialUrl] = 0;

          if (ctx.props && ctx.props.title) {
            this.setTitle(ctx.props.title);
          }
        });
      });

      window.addEventListener('popstate', () => {
        const href = this.app.fullPathName();
        this.scrollCache[this.initialUrl] = window.scrollY;

        this.app.render(href, false).then((props) => {
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
    this.app.render(this.app.fullPathName(), false).then((props) => {
      this.setTitle(props.title);
    });
  }

  setTitle(title) {
    if (title) {
      if (this.dom.$title.textContent) {
        this.dom.$title.textContent = title;
      } else if (this.dom.$title.innerText) {
        this.dom.$title.innerText = title;
      }
    }
  }

  start() {
    if (this.started) {
      throw new Error('Attempted to run `start` twice');
    }

    this.app.render(this.initialUrl, true).then(() => {
      this.bindScrolling();
      this.bindResize();
      this.bindHistory();
      this.started = true;
    });
  }
}
