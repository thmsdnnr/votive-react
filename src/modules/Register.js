import React, { Component } from 'react';
import {Link} from 'react-router-dom';

function InputFields(props) {
  return (
    <div>
    <div className="mui-textfield mui-textfield--float-label">
      <input type="text" name="username" required="true" autoFocus="true" onInput={props.setText}/><br />
      <label>make a name for yourself</label>
    </div>
    <div className="mui-textfield mui-textfield--float-label">
      <input type="password" name="password" required="true" onInput={props.setText}/>
      <label>password</label>
    </div>
    </div>
  );
}

export default class RegisterForm extends Component {
  constructor(props) {
    super(props);
    this.state = {username: null, password: null, userTaken: false, warning:false, msg:null};
    this.setText = this.setText.bind(this);
    this.tryRegister = this.tryRegister.bind(this);
  }

  setText = e => this.setState({[e.target.name]:e.target.value});

  tryRegister = (e) => {
    e.preventDefault();
    if (this.state.username.match(/[^a-z0-9]/gi)) {
      this.setState({warning:true, msg:'Sorry, your username cannot have special characters.'});
      document.querySelector(`input[name="username"]`).focus();
      return false;
    }
    fetch('/register', {
      method:'POST',
      credentials: 'same-origin',
      body:JSON.stringify({'username':this.state.username, 'password':this.state.password}),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    }).then(r=>r.json()).then(d=>{
      if (!d.warning) {
        const auth=JSON.stringify({token:d.token,claimedUser:this.state.username});
        sessionStorage.setItem('votiveAuth', auth);
        this.props.history.push({pathname:'/login',state:{username:this.state.username}});
      } else {
        this.setState({userTaken:true,username:null});
        const uName=document.querySelector(`input[name="username"]`);
        uName.focus();
        uName.value='';
      }
    });
  };

  render() {
    return (
      <div id="registerBox" className="pageBox">
        <form onSubmit={this.tryRegister}>
          <InputFields setText={this.setText}/>
          {this.state.userTaken && <div id="warning"><h3>Sorry, that name is taken. Try again?</h3></div>}
          {this.state.warning && <div id="warning"><h3>{this.state.msg}</h3></div>}
          <button type="submit" className="mui-btn mui-btn--raised mui-btn--primary">join us</button>
          <Link to="/login"><button type="login" className="mui-btn btn--small mui-btn--flat mui-btn--accent">LOGIN</button></Link>
        </form><br />
      </div>
      );
    }
}
