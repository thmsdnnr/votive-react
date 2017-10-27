import React from 'react';
import ReactDOM from 'react-dom';
import registerServiceWorker from './registerServiceWorker';

// modules or "pages"
import App from './App';

ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
