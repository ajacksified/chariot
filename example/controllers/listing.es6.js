import ReactController from 'chariot/reactController';
import ListingPage from './views/pages/listing';

class Listing extends ReactController {
  get data () {
    const { req, api } = this.props;
    const { sort, commentId, context } = req.query;
    const { linkId } = req.params;

    const commentParams = { linkId, sort, context, parentCommentId: commentId };

    return {
      link: api.links.get({ id: linkId }),
      comments: api.comments.get(commentParams),
    };
  }

  page = ListingPage;
}

export default Listing;
