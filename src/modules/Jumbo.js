import React, { Component } from 'react';

export default class Jumbo extends Component {
  render() {
    return (
      <div>
      {!this.props.auth && <div id="header"><div id="tagName">VOTIVE</div></div>}
      </div>
    );
  }
}
