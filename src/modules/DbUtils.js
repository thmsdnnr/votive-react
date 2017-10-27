const LoadPoll = (pollName) => {
  let path=`/p/${pollName}`;
  return new Promise(function(resolve,reject) {
      fetch(path,
      {
        method: 'POST',
        credentials: 'same-origin',
        body: JSON.stringify({pollName})
      }).then(res=>res.json()).then(d=>{
        if (d.err) { reject(d); }
        else if (d) { resolve(d); }
      });
    });
  }

module.exports = {LoadPoll};
