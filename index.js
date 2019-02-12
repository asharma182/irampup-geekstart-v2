const express = require('express')
const app = express()
const port = 3000
const path = require('path');
const router = express.Router();

// var service = require('./assets/js/service');
// var url = service.pythonMainUrl1();


app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });
// app.use(express.static(__dirname + 'assets/'));
app.use(express.static(__dirname + '/assets'));
// app.use('/assets', express.static('assets'))


// app.get('/index', (req, res) => res.sendFile(path.join(__dirname+'/index.html')));
// app.get('/home', (req, res) => res.sendFile(path.join(__dirname+'/home.html')));
// app.get('/modules', (req, res) => res.sendFile(path.join(__dirname+'/modules.html')));
// app.get('/gorealtime', (req, res) => res.sendFile(path.join(__dirname+'/goRealTime.html')));
// app.get('/speedtest', (req, res) => res.sendFile(path.join(__dirname+'/speedtest.html')));
// app.get('/softskill', (req, res) => res.sendFile(path.join(__dirname+'/softskill.html')));
// app.get('/startPreparation', (req, res) => res.sendFile(path.join(__dirname+'/startpreparation.html')));
// app.get('/posturecontrol', (req, res) => res.sendFile(path.join(__dirname+'/posturecontrol.html')));

app.get('/',function(req,res) {
    res.sendFile(path.join(__dirname+'/index.html'));
  });

app.get('/signup',function(req,res) {
    res.sendFile(path.join(__dirname+ '/src' + '/signup.html'));
  });


app.get('/home',function(req,res) {
    res.sendFile(path.join(__dirname+ '/src' + '/home.html'));
  });

app.listen(port, () => console.log(`Example app listening on port ${port}!`))


