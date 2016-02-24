import ReactController from 'chariot/reactController';
import DefaultLayout from '../view/layouts/default';

export default class BaseController extends ReactController {
  layout = DefaultLayout;
}
