import React, { Component } from 'react';
import {BrowserRouter, Route, Switch, Link, withRouter, Redirect} from 'react-router-dom';
//modules and vendor
import Jumbo from './modules/Jumbo';
import JustNowWidget from './modules/RecentActions.js';
import Login from './modules/Login';
import Logout from './modules/Logout';
import Register from './modules/Register';
import PollPreview from './modules/pollPreview';
import AddPoll from './modules/AddPoll';
import DisplayPoll from './modules/DisplayPoll';
import ListPolls from './modules/ListPolls';
import muiCSS from './vendor/muiCombinedMin.js';
//styles
import './App.css';

class ShowTheLocation extends React.Component {
  render() {
    const { match, location, history } = this.props;
    let loc=this.props.location.pathname.slice(1);
    const auth=this.props.auth;
    if (!loc.length&&auth) { loc='/dash'; }
    return !loc.match(/p\/+/) ? (<div id="nothing"><Jumbo auth={auth}/><LinkHeader loc={loc} history={this.props.history} auth={auth} /></div>) : null;
  }
}

const ShowTheLocationWithRouter = withRouter(ShowTheLocation);

const renderMergedProps = (component, ...rest) => {
  const finalProps = Object.assign({}, ...rest);
  return (React.createElement(component, finalProps));
}

const PrivateRoute = ({ component, ...rest }) => (
  <Route {...rest} render={routeProps => (
  rest.auth!==null ? renderMergedProps(component, routeProps, rest) :
  (<Redirect to={{pathname: '/login', state: { from: routeProps.location } }}/>)
  )}/>
);

const PropsRoute = ({ component, ...rest }) => {
  return (
    <Route {...rest} render={routeProps => {
      return renderMergedProps(component, routeProps, rest);
    }}/>
  );
}

// from: https://reacttraining.com/react-router/web/example/auth-workflow

class LinkHeader extends Component {
  render() {
    const links=[
      {link:'/login',linkText:'LOGIN',auth:false},
      {link:'/add',linkText:'NEW',auth:true},
      {link:'/dash',linkText:'MINE',auth:true},
      {link:'/list',linkText:'ALL',auth:false,alwaysDisplay:true}
    ];

    return (<div className="tabs">
        {links.map((l,idx)=>{
          let glasses=(l.link.slice(1)===this.props.loc) ? 'tab is-selected' : 'tab';
          if (((!l.auth&&this.props.auth==null)||(this.props.auth!==null&&l.auth))||l.alwaysDisplay) { //if route does not require authorization or does & we are logged-in then
            return <div className={glasses} key={idx} onClick={()=>this.props.history.push(l.link)}>{l.linkText}</div>
          }
        })}
      </div>);
  }
}

export default class App extends Component {
  constructor(props) {
  super(props);
  this.state = { messages:[], currentUser: sessionStorage.getItem('votiveUser') };
  this.logout=this.logout.bind(this);
  this.updateVotes=this.updateVotes.bind(this);
}

  updateUser = (user) => { this.setState({currentUser:user}); };

  logout = () => {
    sessionStorage.clear();
    this.setState({currentUser:null});
  };

  isAuth = () => {
    var votiveAuth=JSON.parse(sessionStorage.getItem('votiveAuth'));
    if (votiveAuth) { this.setState({currentUser:votiveAuth.claimedUser}); }
    else { this.setState({currentUser:null}); }
  }

  updateVotes = (cb) => { this.setState({voteCb:cb}); }

  wsMessage = (msg) => {
    let messages=[msg].concat(this.state.messages);
    if (!msg.rehydrate) {
      switch(msg.evtType) {
        case 'newVote': this.state.voteCb(msg); break;
      }
    }
    this.setState({messages});
  }

  widthChange = (mq) => mq.matches ? this.setState({windowBig:true}) : this.setState({windowBig:false});

  componentWillMount() { this.isAuth(); }

  componentDidMount() {
    const mq = window.matchMedia("(min-width: 500px)");
    mq.addListener(this.widthChange);
    mq.matches ? this.setState({windowBig:true}) : this.setState({windowBig:false});
  }

  render() {
    return (
      <div id="cont">
        <BrowserRouter>
        <div className="App mui-container mui-panel">
        {this.state.currentUser && <div id="greeting">{`>> `+this.state.currentUser} <Link to='/logout'>[logout]</Link></div>}
          <div className="container">
              <ShowTheLocationWithRouter auth={this.state.currentUser} />
                <Switch>
                  <PropsRoute path="/p/:pollName" component={DisplayPoll} updateVotes={this.updateVotes} />
                  <PrivateRoute exact path="/" windowBig={this.state.windowBig} component={ListPolls} auth={this.state.currentUser} handler={this.updateUser.bind(this)} />
                  <PropsRoute path="/login" component={Login} auth={this.state.currentUser} handler={this.updateUser.bind(this)} />
                  <Route path="/register" component={Register} />
                  <PrivateRoute path="/add" component={AddPoll} auth={this.state.currentUser}/>
                  <PrivateRoute path="/dash" windowBig={this.state.windowBig} component={ListPolls} auth={this.state.currentUser} />
                  <PropsRoute path="/list" windowBig={this.state.windowBig} component={ListPolls} auth={this.state.currentUser} />
                  <PropsRoute path="/logout" component={Logout} handler={this.logout} auth={this.state.currentUser} />
                </Switch>
              <PrivateRoute path="/preview" auth={this.state.currentUser} component={PollPreview} />
          </div>
          <JustNowWidget messages={this.state.messages} windowBig={this.state.windowBig} handler={this.wsMessage.bind(this)}/>
        </div>
        </BrowserRouter>
      </div>
    );
  }
}
