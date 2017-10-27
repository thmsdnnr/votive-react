import React, { Component } from 'react';
import {Link} from 'react-router-dom';

function InputFields(props) {
  const username=props.loginState ? props.loginState.username : null;
    if (username) {
      return (
        <div>
        <div className="mui-textfield mui-textfield--float-label">
          <input type="text" name="username" required="true" value={username} onInput={props.setText} />
          <label>username</label>
        </div><br />
        <div className="mui-textfield mui-textfield--float-label">
          <input type="password" required="true" name="password" autoFocus="true" onInput={props.setText} />
          <label>password</label>
        </div>
        </div>
      );
    }
    else {
      return (
        <div>
          <div className="mui-textfield mui-textfield--float-label">
            <input type="text" name="username" autoFocus="true" required="true" onInput={props.setText} />
            <label>username</label>
          </div><br />
          <div className="mui-textfield mui-textfield--float-label">
            <input type="password" name="password" required="true" onInput={props.setText} />
            <label>password</label>
          </div>
        </div>
      );
    }
  }

export default class LoginForm extends Component {
  constructor(props) {
    super(props);
    this.state = { username: null, password: null, warning: false };
    this.setText = this.setText.bind(this);
    this.tryLogin = this.tryLogin.bind(this);
  }

  componentWillMount() { if (this.props.auth) { this.props.history.push('/dash'); } }

  setText = e => this.setState({[e.target.name]:e.target.value});

  tryLogin = (e) => {
    e.preventDefault();
    //we autofill username on register, so if this happens, grab that name: user hasn't typed anything.
    const user = this.state.username ? this.state.username : document.querySelector(`input[name='username']`).value;
    fetch('/login', {
       method:'POST',
       credentials: 'same-origin',
       body: JSON.stringify({'username':user, 'password':this.state.password}),
       headers: {
         'Accept': 'application/json',
         'Content-Type': 'application/json'
       }
     }).then(res=>res.json()).then(r=>{
       //TODO this is v broken
       if (!r.warning) { //login success
         this.props.handler(user);
         const auth=JSON.stringify({token:r.token,claimedUser:user});
         sessionStorage.setItem('votiveAuth', auth);
         this.props.history.push('/dash');
       }
       else {
         this.setState({warning:true});
       }
     });
  }

  render() {
    return (
      <div id="loginBox" className="pageBox">
        <form onSubmit={this.tryLogin}>
          <InputFields setText={this.setText} loginState={this.props.location ? this.props.location.state : null}/>
          {this.state.warning && <div id="warning"><h3>Invalid, sorry. Try again?</h3></div>}
          <button type="submit" className="mui-btn mui-btn--raised mui-btn--primary">COME IN</button>
          <Link to="/register"><button type="register" className="mui-btn btn--small mui-btn--flat mui-btn--accent">REGISTER</button></Link>
        </form><br />
      </div>
      );
    }
}
