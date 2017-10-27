import React from 'react';
import {BrowserRouter, Route, Link} from 'react-router-dom';

// modules or "pages"
import App from '../App';
import Login from './Login';
import Register from './Register';
import AddPoll from './AddPoll';
import DisplayPoll from './DisplayPoll';
import ListPolls from './ListPolls';

export default (
  <div>
    <Route path="/" component={App} />
    <Route path="/login" component={Login} />
    <Route path="/register" component={Register} />
    <Route path="/add" component={AddPoll} />
    <Route path="/dash" component={ListPolls} />
    <Route path="/list" component={ListPolls} />
  </div>
);
