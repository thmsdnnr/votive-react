const getExpiryText = (time) => {
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

const formatTime = (secs, precision) => {
  if (Number.isNaN(secs)) { return `never`; }
  else if (secs<86400&&secs>3600) { return `${(secs/(60*60)).toFixed(precision)} hrs`; }
  else if (secs>86400) { return `${(secs/86400).toFixed(precision)} days`; }
  else if (secs<3600&&secs>120) { return `${(secs/60).toFixed(precision)} mins`; }
  else if (secs<120&&secs>60) { return `${(secs/60).toFixed(precision)} mins`; }
  else { return `${secs.toFixed(precision)} secs`; }
}

const toasterFormat = (time) => {
  const secs=getSecondsAgo(time);
  if (secs<5) { return 'just now'; }
  else { return `${formatTime(secs,1)} ago`; }
}

const getSecondsAhead = (time) => ((Date.parse(time)-Date.now())/1000);
const getSecondsAgo = (time) => Date.parse(time) ? (Date.now()-Date.parse(time))/1000 : null;

module.exports = { getExpiryText, toasterFormat, formatTime, getSecondsAgo, getSecondsAhead };
