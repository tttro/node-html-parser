const express = require('express');
const app = express();

const createRouter = require('./router');

// Port
const port = 3000;

 // Initialize routes
const router = createRouter();
app.use('/api', router);

app.listen(port, function(){
    console.log('Run at port:'+ port);
});





