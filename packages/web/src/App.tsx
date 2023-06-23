import React from 'react';
import { Route, Switch, BrowserRouter as Router } from 'react-router-dom';
import { Providers } from './providers';
import { HomeView, PassportMint, Profile } from './views';
// import { Routes } from './views/preLaunch/routes'

function App() {
  return (
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
  );
}

export default App;
