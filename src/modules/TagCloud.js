import React, { Component } from 'react';
import {Link} from 'react-router-dom';

export default class TagCloud extends Component {
  constructor(props) {
    super(props);
  }
  componentDidMount() {
    console.log('mounties');
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
    if (this.state) {
      const tagArr=this.state.tags.slice(1).map(e=>[e._id, e.count]);
      let max=tagArr[0][1];
      let min=tagArr[tagArr.length-1][1];
      const biggest=36;
      const smallest=14;
      cloud=tagArr.map(e=>{
        console.log(e[1],max,biggest);
        let v=Math.round(biggest*(e[1]/max));
        v=Math.max(smallest,v);
        return (<Link to={`/t/${e[0]}`}><div id="cloud-el" style={{backgroundColor: `${this.randomRGB()}`, fontSize:`${v}px`}}>{'#'+e[0]}<span id="ct">[{e[1]}]</span></div></Link>);
      });
    }
    return(<div id="tagCloud">{cloud}</div>);
  }
}
