import express from 'express';
import createRouter from './router';

const app = express();

// Port
const port = 3000;

// Allow CORS
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// Init routes
const router = createRouter();
app.use('/api', router);


app.listen(port, () => {
    console.log('Run at port:' + port);
});





