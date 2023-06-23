import React from 'react';
import { HashRouter, Route, Switch, BrowserRouter as Router, Redirect } from 'react-router-dom';
import { Providers } from './providers';
import {
  HomeView,
  Profile,
  PassportMint
} from './views';
// import { PassportMint } from './views/mint';
// import { Profile } from './views/profile';

export function Routes() {
  // const shouldEnableNftPacks = process.env.NEXT_ENABLE_NFT_PACKS === 'true';
  return (
    <>
      <Router>
        <Providers>
          <Switch>
            <Route
              exact
              path="/mint/:mintAddress"
              component={() => <PassportMint />}
            />
            <Route
              exact
              path="/profile"
              component={() => <Profile />}
            />
            <Route path="/" component={() => <PassportMint />} />
          </Switch>
        </Providers>
      </Router>
    </>
  );
}
