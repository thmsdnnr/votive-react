import React, { Component } from 'react';
import Chart from 'chart.js';
import TinyG from 'tinygradient';
import G from './pollColors';

export default class PollPreview extends Component {
  constructor(props) {
    super(props);
    this.graphData=this.graphData.bind(this);
    this.state={'loading':true};
  }

  randNum(min, max) { return Math.floor(Math.random()*(max-min))+min; }

  randomVoteData(pName, choices) {
    let votes = {};
    let totalVotes=0;
    choices=choices.filter(e=>e.length);
    for (var i=0;i<choices.length;i++) {
      votes[choices[i]] = this.randNum(20,100); //0 to 100 votes
    }
    return {'pollName':pName, 'votes':votes};
  }

  componentWillMount() {
    if (!this.props.location.state) { //someone called it directly
      this.props.history.goBack();
    }
    this.initialState = this.state;
  }

  componentDidMount() {
    const D=this.props.location.state;
    let stops=G.randGrad();
    document.querySelector('input#lowStop').value=stops[0].color;
    document.querySelector('input#highStop').value=stops[1].color;
    this.setState({pollData:this.randomVoteData(D.pollName,D.choices.split(/\n/)),colorStops:stops},()=>this.graphData(stops));
  }

  componentWillUnmount() { this.setState({myChart:null, pollData:null}); }

  graphData(stops) {
    if (!this.state.pollData) { return false; }
    if (!this.state.myChart) { this.setState({update:false}); }
    var ctx = document.querySelector('canvas.chart');
    const votes=this.state.pollData.votes;
    let keys = Object.keys(votes);
    this.setState({'candidates':keys});
    let gradient = TinyG(stops);
    let colors=gradient.rgb(Math.max(stops.length,keys.length));

    Chart.defaults.global.defaultFontFamily='Raleway, sans-serif';
    const truncateKeys = (keyArr) => keyArr.map(e=>e.length>15 ? e.slice(0,12)+'...' : e);
    let values=keys.map(e=>votes[e]);
    keys=truncateKeys(keys);
    if (!this.state.update) {
      let range=Math.max(...values)-Math.min(...values);
      let myChart = new Chart(ctx, {
          type: 'bar',
          data: {
              labels:keys,
              datasets: [{
                  label: '# of Votes',
                  data: values,
                  backgroundColor: colors,
                  borderColor: '#000000',
                  borderWidth: 1
              }]
          },
          options: {
            animation: { duration: 0 },
            legend: { display: false },
              scales: {
                xAxes: [{
                  gridLines: { display: false },
                  ticks: {display: 'ticksOn', stepSize: 1}
                }],
                yAxes: [{
                  gridLines: { display: false },
                  ticks: {display: 'ticksOn',
                          stepSize: Math.floor(range%=10)*5,
                          min: 0,
                          userCallback: function(label, index, labels) {
                              if (Math.floor(label)===label) { return label; }
                          }
                        },
                  }]
              }
          }
        });
      this.setState({myChart:myChart,update:true,loading:false});
    }
    else {
      let newData={datasets:[
          {
          label: '# of Votes',
          data: values,
          backgroundColor: colors,
          borderColor: '#FFFFFF',
          borderWidth: 1
        }],labels:keys};
      let newObj={...this.state.myChart};
      newObj.chart.data=newData;
      this.setState({myChart:newObj},()=>this.state.myChart.chart.update());
      }
  }

  randColors = () => {
    const stops=G.randGrad();
    document.querySelector('input#lowStop').value=stops[0].color;
    document.querySelector('input#highStop').value=stops[1].color;
    this.setState({colorStops:stops},()=>this.graphData(this.state.colorStops));
  }

  handleColorPicker = (e) => {
    this.setState({[e.currentTarget.id]:e.currentTarget.value},()=>{
      let customStops=[{color:this.state.lowStop, pos: 0},{color:this.state.highStop, pos: 1}];
      this.setState({colorStops:customStops},()=>this.graphData(this.state.colorStops));
    });
  }

  submitPreview = (e) => {
    fetch('/add', {
      method: 'POST',
      credentials: 'same-origin',
      body: JSON.stringify({
        choices:this.state.candidates,
        colors:this.state.colorStops,
        ttv:this.props.location.state.ttv||null,
        pollName:this.state.pollData.pollName,
        user:this.props.location.state.user
      }),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    }).then(res=>res.json()).then(d=>{
      sessionStorage.removeItem('votiveNewPoll');
      this.setState(this.initialState,()=>this.props.history.push(`/p/${d}`));
  });
}

  render() {
    return (
        <div className="pageBox">
        <div className="chartBox">
        {!this.state.loading && <span id="pollTitle">{this.state.pollData.pollName}</span>}
        <canvas className="chart mui-panel" id="graph"/>
        </div><br />
        <div id="previewButtonBox">
          <button className='mui-btn mui-btn--raised mui-btn--primary' onClick={this.randColors}>random colors</button><br />
          <input type="color" id="lowStop" onInput={this.handleColorPicker} />
          <input type="color" id="highStop" onInput={this.handleColorPicker} />
          <button id="submitPreview" className='mui-btn mui-btn--raised mui-btn--primary' onClick={this.submitPreview}>All right, submit!</button>
        </div>
        </div>
      );
  }
}
