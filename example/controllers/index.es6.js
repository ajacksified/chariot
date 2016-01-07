import ReactController from 'chariot/reactController';
import IndexPage from './views/pages/indexPage';

class Index extends ReactController {
  get data () {
    const { req, api } = this.props;
    const { first, last, sort } = req.query;
    const { subreddit } = req.params;

    const linkGetParams = { sort, first, last, subreddit };

    return {
      links: api.links.get(linkGetParams),
    };
  }

  page = IndexPage;
}

export default Index;
