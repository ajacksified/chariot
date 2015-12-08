import BaseController from './base';
import IndexPage from './views/pages/indexPage';

class Index extends BaseController {
  get body () {
    return IndexPage;
  }

  loadData () {
    const { first, last, sort } = this.req.query;
    const { subreddit } = this.req.params;
    const data = new Map();

    data.set('links',
      api.links.get({
        sort,
        first,
        last,
        subreddit
      })
    );

    return data;
  }
}

export default Index;
