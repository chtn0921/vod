var mongoose = require('mongoose');
var express = require('express');
var router = express.Router();
var passport = require('passport');
var jwt = require('express-jwt');

var History = mongoose.model('History');
var User = mongoose.model('User');

var auth = jwt({secret: 'SECRET', userProperty: 'payload'});

/* GET Index page. */
router.get('/', function(req, res) {
  console.log("app step render root");
  res.render('index');
});

/* GET Home page. */
router.get('/home', function(req, res) {
  console.log("app step render home");
  res.render('index');
});

/* GET History page. */
router.get('/history', function(req, res) {
  console.log("app render history");
  res.render('index');
});

router.get('/myhistory/', auth, function(req, res, next) {
  History.findOne({"user":req.payload._id}, function(err, hdata){
    if(err){
      conole.log('err in find user history:  ',err);
      return next(err); 
    }
    console.log('history data : ', hdata); //this shows the correct user id
    res.json(hdata.user_history);     
  });
});

router.post('/history/', auth, function(req, res, next) {
  console.log("history req.body: ",req.body);
  console.log("history req.payload: ",req.payload);  
  History.findOne({"user":req.payload._id}, function(err, hdata){
    if(err){ 
      conole.log('err in find user history:  ',err);
      return next(err); 
    }    
    console.log('history data : ', hdata); //this shows the correct user id
    if(hdata){      
      if(hdata.user_history.indexOf(req.body.id) == -1){
        //update schema
        console.log('save to history data : ',hdata);
        hdata.user_history.push(req.body.id);
        hdata.save();        
      }
      res.json(hdata);
    } else {
      //save new data to schema
      console.log('create history data : ');
      var history = new History();    
      history.user = req.payload._id;
      history.user_history = [req.body.id];
      var promise = history.save(); 
      promise.then(
        function(history){
          res.json(history);    
        } , function(error) {
          if(err){ 
            console.log("Error :: ",err);
            return next(err); 
          }
        }    
      );
    }
  });
});

router.post('/register', function(req, res, next){
  if(!req.body.username || !req.body.password){
    return res.status(400).json({message: 'Please fill out all fields'});
  }

  User.findOne({"username":req.body.username}, function(err, udata){
    if(err){ 
      conole.log('err in check username:  ',err);
      return next(err); 
    }    
    console.log('history data : ', udata); //this shows the correct user id
    if(udata){      
      return res.status(400).json({message: 'A User already exist with this username, please try something diffrent.'});  
    } else {
        var user = new User();
        user.username = req.body.username;
        user.setPassword(req.body.password)
        user.save(function (err){
          if(err){ return next(err); }
          return res.json({token: user.generateJWT()})
        });
    }
  });  
});

router.get('/login', function(req, res, next){
  console.log("login step render index");
  res.render('index');
});

router.post('/login', function(req, res, next){
  if(!req.body.username || !req.body.password){
    return res.status(400).json({message: 'Please fill out all fields'});
  }

console.log('calling passport)');
  passport.authenticate('local', function(err, user, info){
    if(err){ 
      return next(err); 
    }

    if(user){
      var new_token = user.generateJWT();
      console.log("new_token genrated by user : ", new_token);
      return res.json({token: new_token});
    } else {
      return res.status(401).json(info);
    }
  })(req, res, next);
});

module.exports = router;