import React, { Component } from 'react';

export default class AddPoll extends Component {
  constructor(props) {
    super(props);
    this.state={pollName:null, choices:'', ttv:null, user:this.props.auth, warning:false};
    this.addPoll=this.addPoll.bind(this);
  }

  componentDidMount() {
    const prevWork=JSON.parse(sessionStorage.getItem('votiveNewPoll'));
    if (prevWork) {
      this.setState(prevWork, ()=>{
        this.repopulate(prevWork);
        this.validateInput();
      });
    }
  }

  repopulate = (prevWork) => {
    document.querySelector('input#name').value=prevWork.pollName;
    document.querySelector('textarea#choices').value=prevWork.choices;
    document.querySelector('input#ttv').value=prevWork.ttv;
    document.querySelector(`#${prevWork.focusedElementID}`).focus();
  }

  addPoll = (e) => {
    e.preventDefault();
    if (this.validateInput()) {
      fetch('/add', {
        method: 'POST',
        credentials: 'same-origin',
        body: JSON.stringify(Object.assign(this.state,{choices:this.state.choices.split(/\n/).filter(e=>e.length)})),
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }).then(res=>res.json()).then(d=>{
        sessionStorage.removeItem('votiveNewPoll');
        this.props.history.push(`/p/${d}`);
    });
  }
}

  validateInput = () => {
    let choices=this.state.choices.split(/\n/).filter(e=>e.length);
    if ((!(choices.length>=2&&this.state.pollName!==null))||choices.filter((e,idx)=>idx===choices.lastIndexOf(e)).length<2)
    {
      this.setState({warning:true});
      return false;
    }
    else {
      this.setState({warning:false});
      return true;
    }
  }

  showPreview = (e) => {
    e.preventDefault();
    if (this.validateInput()) {
      sessionStorage.setItem('votiveNewPoll', JSON.stringify(this.state));
      this.props.history.push({pathname:'/preview', state: Object.assign({},this.state,{user:this.props.auth})});
    }
  }

  setText = (e) => { this.setState({[e.target.name]:e.target.value,focusedElementID:e.currentTarget.id}); }

  toggleClearConfirm = (e) => {
    e.preventDefault();
    this.setState({clearConfirm:!this.state.clearConfirm}, ()=>{
      if (!this.state.clearConfirm&&this.state.focusedElementID) {
        document.querySelector(`#${this.state.focusedElementID}`).focus(); //refocus
      }
    });
  }

  clearForm = (e) => {
    e.preventDefault();
    const pollName=document.querySelector('input#name');
    pollName.value='';
    document.querySelector('textarea#choices').value='';
    document.querySelector('input#ttv').value='';
    sessionStorage.removeItem('votiveNewPoll');
    pollName.focus();
    this.setState({clearConfirm:false, warning:false});
  }

  render() {
    const clearConfirm = (
      <div id="buttonBox">
        <div id="warning"><h4>This is permanent. Are you sure?</h4><br />
        <button className="mui-btn mui-btn--raised mui-btn--primary" type="clear" onClick={this.toggleClearConfirm}>Wait, no!</button><br />
        <button className="mui-btn mui-btn--raised mui-btn--danger" type="clear" onClick={this.clearForm}>DO IT</button>
        </div>
      </div>
    );

    const normalButtons = (
    <div id="buttonBox">
      <button className="mui-btn mui-btn--raised mui-btn--primary" type="submit" onClick={this.addPoll}>submit</button><br />
      <button className="mui-btn mui-btn--raised" type="preview" onClick={this.showPreview}>preview & customize</button><br />
      <button className="mui-btn mui-btn--raised mui-btn--danger" type="clear" onClick={this.toggleClearConfirm}>clear</button>
    </div>);

    return (
      <div id="pollBox" className="pageBox">
        <form onSubmit={this.validateInput} id="newPoll">
        <div className="mui-textfield mui-textfield--float-label" id="txt">
          <input type="text" name="pollName" id="name" autoFocus="true" required="true" onInput={this.setText} />
          <label>Poll Name</label>
        </div><br />
        <div className="mui-textfield mui-textfield--float-label">
          <input type="number" min="1" id="ttv" name="ttv" onInput={this.setText} />
          <label>Hours to Vote, blank=no limit</label>
        </div><br />
        <div className="mui-textfield mui-textfield--float-label">
          <textarea className="mdl-textfield__input" name="choices" type="text" rows="3" cols="3" id="choices" onInput={this.setText}></textarea>
          <label>Choices — separate by [ENTER]...</label>
          {this.state.warning && <div id="warning"><h4>Provide two unique candidates.</h4></div> }
        </div><br />
        <input type="hidden" name="choices" id="choiceSubmit" /><br />
        {!this.state.clearConfirm && normalButtons }
        {this.state.clearConfirm && clearConfirm }
        </form>
      </div>
      );
    }
}
