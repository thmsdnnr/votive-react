const gS = [
  [{color: '#F1F2B5', pos: 0},{color: '#135058', pos: 1}],
  [{color: '#7b4397', pos: 0},{color: '#dc2430', pos: 1}],
  [{color: '#136a8a', pos: 0},{color: '#267871', pos: 1}],
  [{color: '#ff0084', pos: 0},{color: '#33001b', pos: 1}],
  [{color: '#FFA17F', pos: 0},{color: '#00223E', pos: 1}],
  [{color: '#360033', pos: 0},{color: '#0b8793', pos: 1}],
  [{color: '#948E99', pos: 0},{color: '#2E1437', pos: 1}],
  [{color: '#780206', pos: 0},{color: '#061161', pos: 1}],
  [{color: '#F0C27B', pos: 0},{color: '#4B1248', pos: 1}],
  [{color: '#FF4E50', pos: 0},{color: '#F9D423', pos: 1}],
  [{color: '#FBD3E9', pos: 0},{color: '#BB377D', pos: 1}],
  [{color: '#606c88', pos: 0},{color: '#3f4c6b', pos: 1}],
  [{color: '#C9FFBF', pos: 0},{color: '#FFAFBD', pos: 1}],
  [{color: '#B993D6', pos: 0},{color: '#8CA6DB', pos: 1}],
  [{color: '#c21500', pos: 0},{color: '#ffc500', pos: 1}],
  [{color: '#FC354C', pos: 0},{color: '#0ABFBC', pos: 1}],
  [{color: '#5f2c82', pos: 0},{color: '#49a09d', pos: 1}],
  [{color: '#E55D87', pos: 0},{color: '#5FC3E4', pos: 1}],
  [{color: '#003973', pos: 0},{color: '#E5E5BE', pos: 1}],
  [{color: '#3CA55C', pos: 0},{color: '#B5AC49', pos: 1}],
  [{color: '#CC95C0', pos: 0},{color: '#DBD4B4', pos: 0.5},{color: '#7AA1D2', pos: 1}],
  [{color: '#833ab4', pos: 0},{color: '#fd1d1d', pos: 0.5},{color: '#fcb045', pos: 1}],
  [{color: '#FEAC5E', pos: 0},{color: '#C779D0', pos: 0.5},{color: '#4BC0C8', pos: 1}],
  [{color: '#77A1D3', pos: 0},{color: '#79CBCA', pos: 0.5},{color: '#E684AE', pos: 1}],
  [{color: '#40E0D0', pos: 0},{color: '#FF8C00', pos: 0.5},{color: '#FF0080', pos: 1}]
];

const randGrad = () => gS[Math.floor(Math.random()*(gS.length-1))];

export default { randGrad };
