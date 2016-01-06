import ReactController from 'chariot/reactController';
import ListingPage from './views/pages/listing';

class Listing extends ReactController {
  get data () {
    const { req, api } = this.props;
    const { sort, commentId, context } = req.query;
    const { linkId } = req.params;
    const data = new Map();

    data.set('link',
      api.links.get({
        id: linkId,
      })
    );

    data.set('comments',
      api.links.get({
        linkId,
        sort,
        context,
        parentCommentId: commentId,
      })
    );

    return data;
  }

  page = ListingPage;
}

export default Listing;
