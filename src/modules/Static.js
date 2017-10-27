import React, { Component } from 'react';

const AppName = () => (<div id="appName">votive</div>);

class HeaderMessage extends Component {
  render() {
    if (this.props.message) {
      return (<p><div id="message">{this.props.message}</div></p>);
    }
    else { return null; }
  }
}

//TODO refactor later
  function sortAscNum(a,b) {
    if (a[1]>b[1]) { return 1; }
    else if (a[1]<b[1]) { return -1; }
    else { return 0; }
  }

  function sortDescNum(a,b) {
    if (a[1]<b[1]) { return 1; }
    else if (b[1]<a[1]) { return -1; }
    else { return 0; }
  }

  function sortAscText(a,b) {
    if (a[1].toLowerCase()>b[1].toLowerCase()) { return 1; }
    else if (a[1].toLowerCase()<b[1].toLowerCase()) { return -1; }
    else { return 0; }
  }

  function sortDescText(a,b) {
    if (a[1].toLowerCase()<b[1].toLowerCase()) { return 1; }
    else if (b[1].toLowerCase()<a[1].toLowerCase()) { return -1; }
    else { return 0; }
  }

function SortData(rows, key, direction) {
  //returns $rows sorted by $key in $dir direction
  let sArr=[];
  rows.forEach((row)=>{ sArr.push([row['_id'],row[key],row]); });
  if (key==='pollName'||key==='username') { (direction==='asc') ? sArr=sArr.sort(sortAscText) : sArr=sArr.sort(sortDescText); }
  else { (direction==='asc') ? sArr=sArr.sort(sortAscNum) : sArr=sArr.sort(sortDescNum); }
  return sArr;
}

export {SortData, AppName, HeaderMessage};
