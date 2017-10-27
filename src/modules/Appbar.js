import React, { Component } from 'react';

export default class AppBar extends Component {
  render(){
    return(
    <div className="mui-container-fluid">
      <table id="headTable">
        <tr className="mui--appbar-height">
          <td className="mui--text-title"><span id="appName">Votive</span></td>
          <td align="right" id="links">
            <ul className="mui-list--inline mui--text-body2">
              <li><span id="link" className="link--active">About</span></li>
              <li><span id="link">Pricing</span></li>
              <li><span id="link">Login</span></li>
            </ul>
          </td>
        </tr>
      </table>
  </div>
  );
}
}
