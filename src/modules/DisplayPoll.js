import React, { Component } from 'react';
import {Link} from 'react-router-dom';
import Chart from 'chart.js';
import TinyG from 'tinygradient';
import {formatTime as fmt, getSecondsAhead as secondsLeft } from './TimeUtils';
import {LoadPoll} from './DbUtils';

export default class DisplayPoll extends Component {
  constructor(props) {
    super(props);
    this.state={limitedVotes:false, pollData:null,invalid:null,voted:false,loading:true};
    this.voteOnPoll=this.voteOnPoll.bind(this);
    this.graphData=this.graphData.bind(this);
  }

  widthChange = (mq) => mq.matches ? this.setState({windowBig:true}) : this.setState({windowBig:false});

  updateHandler = (update) => {
    if (update.hName===this.state.pollData.hName) {
      let newData=this.state.pollData;
      let newVotes=newData.votes;
      newVotes[`${update.vote}`]+=1;
      this.setState(Object.assign(this.state.pollData,newData,{loading:true, update:true}),()=>this.graphData(function(){
        this.setState({loading:false,update:true})
      }));
    }
  };

  componentDidMount() {
    this.props.updateVotes(this.updateHandler);
    if (!this.props.isPreview) { this.loadPollData(); }
    const mq = window.matchMedia( "(min-width: 500px)" );
    mq.addListener(this.widthChange);
    mq.matches ? this.setState({windowBig:true}) : this.setState({windowBig:false});
  }

  loadPollData(pollName) {
    const reqPoll=pollName ? pollName : this.props.match.params.pollName;
    LoadPoll(reqPoll).then((d)=>{
      let spaceName=d.hName.replace(/-/g,' ');
      let tweetHref, expiresIn;
      const tURL=window.location.origin+"/p/"+d.hName;
      if (d.expiresOn===''||d.expiresOn===null) { tweetHref=`https://twitter.com/intent/tweet?url=${tURL}&text=${spaceName}: Vote now with VOTIVE!`; }
      else {
        let expiresIn=secondsLeft(d.expiresOn);
        if (expiresIn>0) {
          tweetHref=`https://twitter.com/intent/tweet?url=${tURL}&text=${spaceName}! Vote in the next ${fmt(expiresIn,1)} with VOTIVE!`;
        } else { tweetHref=`https://twitter.com/intent/tweet?url=${tURL}&text=The results are in for ${spaceName}. VOTIVE!`; }
      }
      this.setState({pollData:d, expiresIn:expiresIn, tweetHref:tweetHref},this.graphData);
    }).catch(err=>{
      this.setState({invalid:true,errorMsg:err});
    });
  }

  voteOnPoll(e) {
      e.preventDefault();
      if (this.state.voted||this.state.warning) {
        this.setState({msg:'You already voted on this!'});
        return false;
      }
    this.setState({voted:true});
      const choiceBox=document.querySelector('div#voteChoices');
      fetch('/vote', {
        method: 'POST',
        credentials: 'same-origin',
        body: JSON.stringify({hName:this.state.pollData.hName, vote:choiceBox.children[0].value}),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
      }).then(res=>res.json()).then(data=>{
        if (data.msg) { this.setState({warning:true, msg:data.msg}); }
        else { this.setState({pollData:data,voted:true},()=>this.graphData(function(){
          this.setState({loading:false,update:true});
        }));
      }
      });
    }

  customSelect(e) {
    const music=document.querySelector('div.mui-select__menu');
    const cBox=document.querySelector('div.chartBox');
    music.style.top=0;
    const choicesBeforeScroll=4;
    music.style.height=`${choicesBeforeScroll*21}px`;
  }

  generateDropdownOptions(choices) {
    const truncateKey = (key) => key.length>15 ? key.slice(0,30)+'...' : key;
    return (
      <div id="voteBox">
        <div className="mui-select" id="voteChoices">
          <select id="mySelect" onClick={this.customSelect}>
            {choices.map((choice,idx)=><option key={idx} value={choice}>{truncateKey(choice)}</option>)}
          </select>
        </div><br />
        <div id="voteButton"><button id="vote" className="mui-btn mui-btn--raised mui-btn--primary" onClick={this.voteOnPoll}>vote</button></div>
      </div>
    );
  }

  graphData(cType='bar') {
    if (!this.state.pollData) { return false; }
    if (!this.state.myChart) { this.setState({update:false}); }
    var ctx = document.querySelector('canvas.chart');
    const votes=this.state.pollData.votes;
    let keys = Object.keys(votes);
    this.setState({'candidates':keys});
    let stops=this.state.pollData.colors;
    let gradient = TinyG(stops);
    let colors=gradient.rgb(Math.max(stops.length,keys.length));
    Chart.defaults.global.defaultFontFamily='Raleway, sans-serif';
    const truncateKeys = (keyArr) => keyArr.map(e=>e.length>15 ? e.slice(0,12)+'...' : e);
    let values=keys.map(e=>votes[e]);
    keys=truncateKeys(keys);
    if (!this.state.update) {
      let myChart = new Chart(ctx, {
          type: cType,
          data: {
              labels:keys,
              datasets: [{
                  label: '# votes',
                  data: values,
                  backgroundColor: colors,
                  borderColor: '#000000',
                  borderWidth: 1
              }]
          },
          options: {
            tooltips: {
              backgroundColor: 'rgba(255,255,255,1)',
              borderColor: '#000000',
              position: 'nearest',
              borderWidth: 1,
              titleFontColor: '#000000',
              bodyFontColor: '#000000',
              displayColors: false,
              caretSize: 10,
              xPadding: 10,
              yPadding: 10
            },
            animation: { duration: 0 },
            legend: { display: false },
              scales: {
                xAxes: [{
                  gridLines: { display: false },
                  ticks: { autoSkip: false }
                }],
                yAxes: [{
                  gridLines: { display: false },
                  ticks: {display: 'ticksOn',
                          autoSkip: true,
                          maxTicksLimit: 10,
                          min: 0,
                          userCallback: function(label, index, labels) {
                              if (Math.floor(label)===label) { return label; }
                          }
                        },
                  }]
              }
          }
        });
      this.setState({myChart:myChart,update:true},()=>{
        this.spinOut(()=>{document.querySelector('canvas#graph').style.display='inline'}, 170);
      });
    }
    else {
      this.setState({loading:true});
      let newData={datasets:[
          {
          label: '# votes',
          data: values,
          backgroundColor: colors,
          borderColor: '#000000',
          borderWidth: 1
        }],labels:keys};
      let newObj={...this.state.myChart};
      newObj.chart.data=newData;
      this.setState({myChart:newObj},()=>{
        this.state.myChart.chart.update();
        this.setState({loading:false});
      });
    }
  }

  componentWillReceiveProps(nextProps) {
    const currentPollName=this.props.location.pathname.split('/')[2];
    const nextPollName=nextProps.location.pathname.split('/')[2];
    if (currentPollName!==nextPollName) { this.loadPollData(nextPollName); }
    else { return false; }
  }

  spinOut = (cb,ms) => setTimeout(()=>{this.setState({loading:false}); cb();},ms);

  render() {
    let expired;
    let display = this.state.invalid ? (<h2>This poll does not exist.</h2>) :
     (<canvas className="chart mui-panel" id="graph" style={{display:'none'}}/>);
    let dropdown=(this.state.candidates) ? this.generateDropdownOptions(this.state.candidates) : null;
    let twitterBox=(this.state.tweetHref) ? (<div id="socialNib"><a href={this.state.tweetHref} data-size="small" title="Tweet this poll!"><i className="fa fa-twitter fa-2x" aria-hidden="true"></i></a></div>) : '';
    let expiryText,expiryTime,timeRemaining,tags;
    if (this.state.pollData) {
      expiryTime=this.state.pollData.expiresOn;
      tags=this.state.pollData.tags;
    }
    if (expiryTime) {
      timeRemaining=secondsLeft(expiryTime);
      expiryText = timeRemaining>0 ? `...ends in ${fmt(timeRemaining,1)}` : 'this poll has ended!';
      if (timeRemaining<=0) { expired=true; }
    }
    return(
      <div id="nothing">
      {this.state.loading&&!this.state.invalid && <div className="loader" />}
        {!this.state.invalid &&
          <div>
          <div className="chartBox">
          <span id="pollTitle"><h2>{this.props.match.params.pollName.replace(/-/g,' ')}</h2></span><br /><div id="socialBox">{twitterBox}</div>
          {display}
          {this.state.msg && <div id="warning">{this.state.msg}</div>}
          </div>
          <div id="pollInfo"><div id="expiresOn">{expiryText}</div> {tags && <div id="pollTagBox">{tags.map((e,idx)=><div id="tag" key={idx}><Link to={'/t/'+e} key={idx}>#{e}</Link></div>)}</div>}</div>
          </div>
        }
        {this.state.invalid && <div id="warning">{display}</div>}
        {!expired && dropdown}
      </div>
    );
  }
}
