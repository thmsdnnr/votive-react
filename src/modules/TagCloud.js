import React, { Component } from 'react';
import {Link} from 'react-router-dom';

export default class TagCloud extends Component {
  constructor(props) {
    super(props);
    this.state={tags:null};
  }
  componentDidMount() {
    fetch('/m', {
      method:'POST',
      credentials: 'same-origin',
      body:JSON.stringify({type:'tags',numTags:50}),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    }).then(d=>d.json()).then((tags)=>this.setState({tags}));
  }

  randomRGB = () => `rgba(${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},0.03)`;

  render() {
    let cloud;
    if (this.state&&this.state.tags&&this.state.tags.length) {
      const tagArr=this.state.tags.map(e=>[e._id, e.count]);
      let max=tagArr[0][1];
      let min=tagArr[tagArr.length-1][1];
      const biggest=36;
      const smallest=14;
      cloud=tagArr.map(e=>{
        let v=Math.round(biggest*(e[1]/max));
        v=Math.max(smallest,v);
        return (<Link to={`/t/${e[0]}`} key={e[0]+e[1]}><div id="cloud-el" key={e[0]+e[1]} style={{backgroundColor: `${this.randomRGB()}`, fontSize:`${v}px`}}>{'#'+e[0]}<span id="ct" key={e[0]+e[1]}>[{e[1]}]</span></div></Link>);
      });
    }
    return(<div id="tagCloud">{cloud}</div>);
  }
}
