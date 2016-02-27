import ReactController from 'chariot/src/reactController';
import DefaultLayout from '../views/layouts/default';
import BaseLayout from '../views/layouts/base';

export default class BaseController extends ReactController {
  layout = DefaultLayout;
  pageLayout = BaseLayout;
}
