import 'react-router-dom';

declare module 'react-router-dom' {
  // https://github.com/DefinitelyTyped/DefinitelyTyped/issues/36870

  export interface StaticContext {
    statusCode?: number;
  }

  export interface StaticRouterContext extends StaticContext {
    url?: string;
    action?: 'PUSH' | 'REPLACE';
    location?: object;
  }
}
