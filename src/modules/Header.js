import React, { Component } from 'react';
import {BrowserRouter, Route, Link, withRouter, Redirect} from 'react-router-dom';

class ShowTheLocation extends React.Component {
  render() {
    const { match, location, history } = this.props;
    const loc=this.props.location.pathname.slice(1);
    const auth=this.props.auth;
    return (<this.Header loc={loc} auth={auth} />);
  }
}

class Header extends Component {
  render() {
    const links=[
      {link:'/login',linkText:'LOGIN',auth:false},
      {link:'/add',linkText:'NEW',auth:true},
      {link:'/dash',linkText:'MINE',auth:true},
      {link:'/list',linkText:'ALL POLLS',auth:false,alwaysDisplay:true},
      {link:'/logout',linkText:'LOG OUT',auth:true},
    ];
    return (
      <div className="tabs">
        {links.map((l,idx)=>{
          let glasses=(l.link.slice(1)===this.props.loc) ? 'tab is-selected' : 'tab';
          if (((!l.auth&&this.props.auth==null)||(this.props.auth!==null&&l.auth))||l.alwaysDisplay) { //if route does not require authorization or does & we are logged-in then
            return <div className={glasses} key={idx}><Link to={l.link}>{l.linkText}</Link></div>
          }
        })}
      </div>
    );
  }
}

const LinkHeader = withRouter(ShowTheLocation);

export default {LinkHeader};
