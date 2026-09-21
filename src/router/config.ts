import type {
  IndexRouteObject,
  LazyRouteFunction,
  NonIndexRouteObject,
} from 'react-router-dom';
import { lazying } from './lazy-route';

type ChildRouteConfig =
  | {
      index: true;
      lazy: LazyRouteFunction<IndexRouteObject>;
    }
  | {
      path: string;
      lazy: LazyRouteFunction<NonIndexRouteObject>;
    };

export const routeConfig: ChildRouteConfig[] = [
  {
    index: true,
    lazy: lazying('../page/home', 'HomePage'),
  },
  {
    path: 'about',
    lazy: lazying('../page/about', 'AboutPage'),
  },
  {
    path: 'form-demo',
    lazy: lazying('../page/form-demo', 'FormDemoPage'),
  },
];
