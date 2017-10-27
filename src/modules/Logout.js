import React, { Component } from 'react';

export default class Logout extends Component {
  constructor(props) {
    super(props);
    this.state={msg:null};
  }

  componentDidMount() {
    this.props.handler();
    sessionStorage.clear();
    fetch('/logout',{
      method:'GET',
      credentials: 'same-origin',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    }).then(res=>res.json()).then(data=>{
      this.setState({msg:data.msg});
      setTimeout(()=>{this.props.history.push('/login')},1500);
    });
  }

  render() {
    return(
      <div className="pageBox">{this.state.msg!==null && <h4>{this.state.msg}</h4>}</div>
    )
  }
}
