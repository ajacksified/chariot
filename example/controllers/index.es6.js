import ReactController from 'chariot/reactController';
import IndexPage from './views/pages/indexPage';

class Index extends ReactController {
  get data () {
    const { req, api } = this.props;
    const { first, last, sort } = req.query;
    const { subreddit } = req.params;
    const data = new Map();

    data.set('links',
      api.links.get({
        sort,
        first,
        last,
        subreddit,
      })
    );

    return data;
  }

  page = IndexPage;
}

export default Index;
