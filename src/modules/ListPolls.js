import React, { Component } from 'react';
import {Link} from 'react-router-dom';

export default class PollList extends Component {
  constructor(props) {
    super(props);
    this.state={pendingDeletes:false, pollsPerPage:6, currentPage:1, data:null, listType:null, loading: true, lastSortKey:null, currentSortKey:'expiresOn', currentSortDirection:'asc'};
    this.deletePoll=this.deletePoll.bind(this);
    this.createBigTR=this.createBigTR.bind(this);
    this.createLittleTR=this.createLittleTR.bind(this);
    this.grabPolls=this.grabPolls.bind(this);
    this.headerSort=this.headerSort.bind(this);
    this.getSecondsAgo=this.getSecondsAgo.bind(this);
    this.renderPagination=this.renderPagination.bind(this);
    this.pageFlip=this.pageFlip.bind(this);
  }

  grabPolls = (listType, cb) => {
    fetch('/list', {
      method: 'POST',
      credentials: 'same-origin',
      body: JSON.stringify({type:listType, user:this.props.auth}),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    }).then(r=>r.json()).then(d=>{
      if (d.length) { cb(d); }
      else { cb(null); }
    });
  }

  widthChange = (mq) => mq.matches ? this.setState({windowBig:true}) : this.setState({windowBig:false});

  componentWillMount() {
    const lType = (this.props.location.pathname.slice(1)==='list') ? 'all' : 'user';
    this.setState({listType:lType,user:this.props.auth});
  }

  spinOut = (cb,ms) => setTimeout(()=>{this.setState({loading:false}); cb();},ms);

  componentDidMount() {
    this.setState(JSON.parse(sessionStorage.getItem(this.state.listType)),()=>{
      this.grabPolls(this.state.listType, (D)=>{
        if (D) {
          const sorted=this.sortPolls(D, this.state.currentSortKey, this.state.currentSortDirection).map(e=>e[2]);
          this.spinOut(()=>{
            let table=document.querySelector('table#pollT');
            if (table) {table.style.display='';}
            this.setState({data:sorted, loading:false});
          },170);
        }
        else { this.setState({data:null, loading:false}); }
      });
    });
  }

  componentWillUnmount() {
    sessionStorage.setItem(this.state.listType, JSON.stringify(Object.assign(this.state,{loading:true, data:null})));
  }

  toggleConfirmDelete = (e) => {
    e.preventDefault();
    this.setState({pendingDeletes:!this.state.pendingDeletes});
    const deleteTR = document.querySelector(`tr#${e.currentTarget.id}`);
    const oldCols = deleteTR.innerHTML;
    const dataIdx=(deleteTR.rowIndex-1)+(this.state.currentPage-1)*this.state.pollsPerPage;
    let oldData=this.state.data;
    let restoreValue=this.state.data[dataIdx];
    { oldData[dataIdx]=restoreValue; this.setState(Object.assign(this.state.data,oldData)); }
    oldData[dataIdx]={
      type:'potentialDelete',
      name:this.state.data[dataIdx].hName.replace(/-/g,' '),
      confirmDelete: () => this.deletePoll(this.state.data[dataIdx].name),
      restore: () => { oldData[dataIdx]=restoreValue; this.setState(Object.assign(this.state.data,oldData)); }
    };
    let newDataState=(Object.assign(this.state.data,oldData));
    this.setState(newDataState);
  }

  deletePoll = (pollName) => {
    const hyphenName=pollName.replace(/ /g,'-');
    fetch('/d', {
      method: 'POST',
      credentials: 'same-origin',
      body: JSON.stringify({hName:hyphenName, user:this.props.auth}),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    }).then(res=>res.json()).then((data)=>{
      if (data) { this.grabPolls(this.state.listType, (D) => {
        if (D) {
          const sorted=this.sortPolls(D, this.state.currentSortKey, this.state.currentSortDirection).map(e=>e[2]);
          this.setState({data:sorted, loading:false});
        } else { this.setState({data:null, loading:false}); }
      });
    } else { console.log(data.err); }
    });
  }

  getExpiryText = (time) => {
    let expiryText;
    let expiresIn=Date.parse(time)-Date.now();
    if (!time) { expiryText = 'never'; }
    else if (expiresIn<=0) { expiryText = 'over'; }
    else {
      const mins=Math.floor(expiresIn/(1000*60));
      expiryText = mins>1 ? `in ${mins} minutes` : `in ${mins} minute`;
    }
    return expiryText;
  }

  formatTime = (secs, precision) => {
    if (Number.isNaN(secs)) { return `never`; }
    else if (secs<0) { return `over`; }
    else if (secs<86400&&secs>3600) { return `${(secs/(60*60)).toFixed(precision)} hrs`; }
    else if (secs>86400) { return `${(secs/86400).toFixed(precision)} days`; }
    else if (secs<3600&&secs>60) { return `${(secs/60).toFixed(precision)} mins`; }
    else { return `${secs.toFixed(precision)} secs`; }
  }

  getSecondsAhead = (time) => ((Date.parse(time)-Date.now())/1000);
  getSecondsAgo = (time) => (Date.now()-Date.parse(time))/1000;

  createLittleTR = (row, index) => {
    if (row.type==='potentialDelete') {
      return (
        <tr key={index}>
          <td colSpan="3"><a onClick={row.confirmDelete}><span style={{color:'tomato'}}>Delete {row.name} forever!</span></a><br /><a onClick={row.restore}>Nope, changed my mind</a>
          </td>
        </tr>
      );
    }
    const hyphenated=row.hName.replace(/ /g,'-');
    const spaced=row.hName.replace(/-/g,' ');
    const userDeleteCol = this.state.listType==='user' ? (<td style={{textAlign:'center'}}><a onClick={this.toggleConfirmDelete} id={hyphenated}>delete</a></td>) : '';
    return (
      <tr key={index} id={hyphenated}>
      <td id="title"><Link to={'/p/'+hyphenated}>{spaced}</Link></td>
      <td>{row.totalVotes}</td>
      {userDeleteCol}
      </tr>
    );
  }

  createLittleTH = () => {
    const arrow = this.state.currentSortDirection==='asc' ? ' ⇑' : ' ⇓'
    const key = this.state.currentSortKey;
    const userDeleteColHeader = this.state.listType==='user' ? (<th style={{textAlign:'center'}}><span style={{color:'tomato'}}>X</span></th>) : '';
    //keys: pollName, userName, numVotes, numVisits, expiresOn
    return (
      <tr>
      <th><a id="pollName" onClick={this.headerSort}>Title&nbsp;{key==='pollName' && arrow}</a></th>
      <th><a id="totalVotes" onClick={this.headerSort}>Votes&nbsp;{key==='totalVotes' && arrow}</a></th>
      {userDeleteColHeader}
      </tr>
      );
    }

  createBigTR = (row, index) => {
    if (row.type==='potentialDelete') {
      return (
        <tr key={index}>
          <td colSpan="5"><a onClick={row.confirmDelete}><span style={{color:'tomato'}}>Delete {row.name} forever!</span></a> | <a onClick={row.restore}>Nope, changed my mind</a>
          </td>
        </tr>
      );
    }
    const hyphenated=row.hName.replace(/ /g,'-');
    const spaced=row.hName.replace(/-/g,' ');
    const userDeleteCol = this.state.listType==='user' ? (<td style={{textAlign:'center'}}><a onClick={this.toggleConfirmDelete} id={hyphenated}>delete</a></td>) : '';
    return (
      <tr key={index} id={hyphenated}><td id="title"><Link to={'/p/'+hyphenated}>{spaced}</Link></td>
      {this.state.listType!=='user' &&<td>{row.username}</td>}
      <td>{row.totalVotes}</td>
      <td>{row.accessCt}</td>
      <td>{this.formatTime(this.getSecondsAgo(row.createdOn),1)}</td>
      <td>{this.formatTime(this.getSecondsAhead(row.expiresOn),1)}</td>
      {userDeleteCol}</tr>
    );
  }

  createBigTH = () => {
    const arrow = this.state.currentSortDirection==='asc' ? '⇑' : '⇓'
    const key = this.state.currentSortKey;
    const userDeleteColHeader = this.state.listType==='user' ? (<th style={{textAlign:'center'}}><span style={{color:'tomato'}}>X</span></th>) : '';
    return (
      <tr>
      <th><a id="pollName" onClick={this.headerSort}>Title&nbsp;{key==='pollName' && arrow}</a></th>
      {this.state.listType!=='user' && <th><a id="username" onClick={this.headerSort}>User {key==='username' && arrow}</a></th>}
      <th><a id="totalVotes" onClick={this.headerSort}>Votes&nbsp;{key==='totalVotes' && arrow}</a></th>
      <th><a id="accessCt" onClick={this.headerSort}>Visits&nbsp;{key==='accessCt' && arrow}</a></th>
      <th><a id="createdOn" onClick={this.headerSort}>Age&nbsp;{key==='createdOn' && arrow}</a></th>
      <th><a id="expiresOn" onClick={this.headerSort}>Ends?&nbsp;{key==='expiresOn' && arrow}</a></th>
      {userDeleteColHeader}
      </tr>
    );
  }

  sortAscNum = (a,b) => {
    if (a[1]===null||a[1]==='') { return 1; }
    else if (b[1]===null||b[1]==='') { return -1; }
    else if (a[1]===b[1]) { return 0; }
    else { return a[1]<b[1] ? 1 : -1; }
  }

  sortDescNum = (a,b) => {
    if (a[1]===null||a[1]==='') { return 1; }
    else if (b[1]===null||b[1]==='') { return -1; }
    else if (a[1]===b[1]) { return 0; }
    else { return a[1]<b[1] ? -1 : 1; }
  }

  sortAscText = (a,b) => {
    if (a[1]===null) { return 1; }
    else if (b[1]===null) { return -1; }
    else if (a[1]===b[1]) { return 0; }
    else { return (a[1].toLowerCase()>b[1].toLowerCase()) ? 1 : -1; }
  }

  sortDescText = (a,b) => {
    if (a[1]===null) { return 1; }
    else if (b[1]===null) { return -1; }
    else if (a[1]===b[1]) { return 0; }
    else { return (b[1].toLowerCase()<a[1].toLowerCase()) ? -1 : 1; }
  }

  headerSort = (e) => {
    if (this.state.pendingDeletes) { return false; }
    e.preventDefault();
    const newDir = this.state.currentSortDirection==='asc' ? 'desc' : 'asc';
    this.setState({currentSortDirection:newDir, currentSortKey:e.currentTarget.id}, function() {
      const sorted=this.sortPolls(this.state.data, this.state.currentSortKey, this.state.currentSortDirection).map(e=>e[2]);
      this.setState({data:sorted, currentPage:1});
    });
  }

  sortPolls = (pollArray,key,direction='asc') => {
    //sorts <pollArray> by <key> in <direction>
    //returns [n-elements] x 3 array w/each element having [ID,keySortedOn,originalData]
    let sArr=[];
    pollArray.forEach((poll,idx)=>{
      sArr.push([poll['_id'],poll[key],poll]);
    });
    if (key==='pollName'||key==='username') { (direction==='asc') ? sArr=sArr.sort(this.sortAscText) : sArr=sArr.sort(this.sortDescText); }
    else if (key==='expiresOn') {
      let expiredOnes = sArr.filter(e=>Date.parse(e[2].expiresOn)<=Date.now());
      let neverExpires = sArr.filter(e=>e[2].expiresOn===null||e[2].expiresOn==='');
      let willExpire = sArr.filter(e=>(e[2].expiresOn!==null&&e[2].expiresOn!=='')&&Date.parse(e[2].expiresOn)>=Date.now());
      sArr = (direction==='asc') ? willExpire.sort(this.sortAscNum).concat(neverExpires,expiredOnes) : willExpire.sort(this.sortDescNum).concat(expiredOnes,neverExpires)
      }
    else { (direction==='asc') ? sArr=sArr.sort(this.sortAscNum) : sArr=sArr.sort(this.sortDescNum); }
    return sArr;
  }

  /*If this.props.windowBig
    If more than 10, display 10 with current pg centered and a NEXT MORE.
    If more than 10 and you choose >=7, then 4 behind and 3 ahead
    else
      just display 5 at a time,
      if more than 5, and choice>=3, 2 behind and 2 ahead
  */

  renderPagination = () => {
    const numPages=Math.ceil(this.state.data.length/this.state.pollsPerPage);
    const curr=Number(this.state.currentPage);
    const front=(<a id='back' onClick={this.pageFlip}>
      <button className="mui-btn mui-btn--fab">{`<<`}</button></a>);
    const back=(<a id='fwd' onClick={this.pageFlip}>
      <button className="mui-btn mui-btn--fab">{`>>`}</button></a>);

    let pgStart, pgEnd;
    if (numPages>1) { //we need pagination
      if (this.props.windowBig) {
        if (numPages>=8&&curr>=5) { //more than 10 and currentpg is >=7
          pgStart=curr-4; //5
          pgEnd=Math.min(numPages,curr+3); //4
        } else { pgStart=1; pgEnd=Math.min(numPages, 8); }
      }
      else { //mobile view
        if (numPages>=5&&curr>=3) { //more than 10 and currentpg is >=7
          pgStart=curr-2; //5
          pgEnd=Math.min(numPages,curr+2); //4
        } else { pgStart=1; pgEnd=Math.min(numPages, 4); }
      }
      let pgButtons=[];
      for (var i=pgStart;i<=pgEnd;i++) { //start at 1 b/c humans don't count with zero
        let btnClass = (i==curr) ? 'tab is-selected' : 'tab';
        let aClass = (i==curr) ? 'current-page' : 'page';
        pgButtons.push(
          <a id={i} key={i} className={aClass} onClick={this.pageFlip}>
          <div id="pageButtons" className={btnClass}>{i}</div>
          </a>);
      }
      return (
        <div className="pagination">
          <div className="bookEnd">{front}</div>
          <div className="tabs tabs-pagination">{pgButtons}</div>
          <div className="bookEnd">{back}</div>
        </div>
      );
    } else { return null; }
  }

  pageFlip = (e) => {
    e.preventDefault();
    let curr=Number(this.state.currentPage);
    const numPages=Math.ceil(this.state.data.length/this.state.pollsPerPage);
    let newPg;
    if ((e.currentTarget.id==='back')&&(curr>1)) { this.setState({currentPage:curr-=1}); }
    else if ((e.currentTarget.id==='fwd')&&(curr<numPages)) { this.setState({currentPage:curr+=1}); }
    else {
      const flipTo=Number(e.currentTarget.id);
      if (Number.isInteger(flipTo)&&curr!==flipTo) { this.setState({currentPage:flipTo}); }
      else { return false; } //trying to page off the page
    }
  }

  render() {
    let tableRows, tblHead;
    const start=(this.state.currentPage-1)*this.state.pollsPerPage;
    const end=start+this.state.pollsPerPage;
    let pagination;
    if (this.state.data!==null) {
      pagination = this.renderPagination();
      tblHead = this.props.windowBig ? this.createBigTH() : this.createLittleTH();
      tableRows = (this.state.data) ? this.state.data.slice(start,end).map((i,idx)=>this.props.windowBig ? this.createBigTR(i,idx) : this.createLittleTR(i,idx)) : null;
    }
    return (
      <div id="container">
      {this.state.loading && <div className="loader" />}
      {(tableRows&&!this.state.loading) && <table className="mui-table" id="pollT"><thead>{tblHead}</thead><tbody>{tableRows}</tbody></table>}
      {(!this.state.loading&&!tableRows) && <div id="warning"><h4>You have no polls available.<br />Why not <Link to='/add'>make one</Link> now?</h4></div>}
      {pagination}
      </div>
      );
    }
}
