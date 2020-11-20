const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const posts = require('./initialData');
 
 
// Set express APP
const app = express();

// Middleware 
app.use(cors());
app.use(bodyParser.json());



// Rate Limiting api calls
let apiCalls = 0;
let cachedTime;
let cachedData;

// Routes
app.get('/api/posts', (req, res) =>{
    apiCalls++;
    if(!cachedTime || Date.now() - cachedTime > 30 * 1000){
        let mx = (req.query.max && req.query.max <= 20)? req.query.max : 10;
        cachedTime = Date.now();
        cachedData = posts.slice(0, parseInt(mx))
        apiCalls = 1;
        res.status(200);
        res.json(cachedData);
    } else{
        if(apiCalls > 5){
            res.status(429);
            res.json({message: "Exceed Number of API Calls"});
        } else{
            let mx = (req.query.max && req.query.max <= 20)? req.query.max : 10;
            res.status(200);
            res.json(cachedData.slice(0, Math.min(cachedData.length, parseInt(mx))));
        }
    }
})


app.get('*', (req, res) =>{
    res.status(404);
    res.send("PAGE NOT FOUND - 404");
})


// Listen At port
app.listen(3000, () => {
    console.log('Listening At Port 3000');
    app.emit('appStarted');
});
module.exports = app;
