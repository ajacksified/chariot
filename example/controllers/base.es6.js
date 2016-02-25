import ReactController from 'chariot/src/reactController';
import DefaultLayout from '../views/layouts/default';

export default class BaseController extends ReactController {
  layout = DefaultLayout;
}
