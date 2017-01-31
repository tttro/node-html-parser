const express = require('express');
const app = express();

const createRouter = require('./router');

// Port
const port = 3000;

 // Initialize routes
const router = createRouter();

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use('/api', router);

app.listen(port, function(){
    console.log('Run at port:'+ port);
});





