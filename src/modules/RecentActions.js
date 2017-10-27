import React, { Component } from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'
import { toasterFormat as tFmt } from './TimeUtils';
import { Link } from 'react-router-dom';

export default class RecentVotesWidget extends Component {
  constructor(props) {
    super(props);
    this.state={messages:[],isOn:true};
    this.sockets=this.sockets.bind(this);
  }

  sockets = () => {
    const socket = new WebSocket('ws://localhost:8888');
    socket.addEventListener('open', (event) => {
      socket.send(JSON.stringify({action:'newClient'}));
    });
    socket.addEventListener('message', (event) => {
      event=JSON.parse(event.data);
      if (event.type==='initialUpdate') { //event.data is an array of most recent events
        let newMessages=event.data.reverse().map(e=>this.props.handler( //reverse to display ascending
          Object.assign(JSON.parse(e.event),{rehydrate:true})
        ));
      }
      else { this.props.handler(event); }
    }
    );
  }

  componentDidMount() { this.sockets(); }

  componentWillReceiveProps(newProps) {
    if (this.props.windowBig!==newProps.windowBig) {
      let aW=document.querySelector('span#activityWidget');
      newProps.windowBig ? aW.style.fontSize='0.9em' : aW.style.fontSize='0.7em';
    }
    if (this.props.messages!==newProps.messages) {
      this.setState({messages:newProps.messages});
    }
  }

  render() {
    let displayItems=this.state.messages.slice(0,4);
    displayItems=displayItems.map((p,idx)=>{ //first 4 messages
      let voteUser = p.username ? p.username : 'Anon ';
      //server gives us a Date.now() and we parse it here to get a ms since 1970 integer for the key
      switch(p.evtType) {
        case 'newUser': return (<div id='toast' key={Date.parse(p.actionTime)} className={'event-'+idx}><em>{tFmt(p.actionTime, 1)}</em><br />{p.username} joined us</div>); break;
        case 'newPoll': return (<div id='toast' key={Date.parse(p.actionTime)} className={'event-'+idx}><em>{tFmt(p.actionTime, 1)}</em><br />{p.username} created<br />—<Link to={'/p/'+p.hName}>{p.pollName}</Link></div>); break;
        case 'newVote': return (<div id='toast' key={Date.parse(p.actionTime)} className={'event-'+idx}><em>{tFmt(p.actionTime, 1)}</em><br />{voteUser} voted for {p.vote}<br />—<Link to={'/p/'+p.hName}>{p.hName.replace(/-/g,' ')}</Link></div>); break;
      }
    });
    console.log(displayItems);
    return(
      <div id="toasterWidget">
        <ReactCSSTransitionGroup transitionName="example"
        transitionEnter={false}
        transitionLeave={true}
        transitionEnterTimeout={1700}
        transitionLeaveTimeout={1000}
        id="activityWidget">{displayItems}</ReactCSSTransitionGroup>
      </div>
    );
  }
}
