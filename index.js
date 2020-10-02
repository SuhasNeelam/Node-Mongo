const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const jwt = require('jsonwebtoken');
const dotenv = require("dotenv");
const Auth = require("./auth");
dotenv.config();

var MongoClient = require("mongodb").MongoClient;
var url = "mongodb://127.0.0.1:27017/hospitalInventory";


app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(express.static('public'))
let hospCollection,ventCollection,db;

MongoClient.connect(url)
  .then(client => {
    db = client.db('hospitalInventory');
    hospCollection = db.collection('hospitals');
    ventCollection = db.collection('ventilators');
    userCollection = db.collection('users');

  });


app.get("/", (req, res) => {
  res.sendFile(
    "/Users/asus/OneDrive/Desktop/All_Web/Proj/preFS/hosp" +
      "/auth.html"
  );
});
app.get("/home", (req, res) => {
  res.render(
    "/Users/asus/OneDrive/Desktop/All_Web/Proj/preFS/hosp" +
    "/views/server.ejs"
  );
});
app.post('/hospitals', Auth.isAdmin, (req, res) => {
  // console.log("post"+req); 
  hospCollection.findOne({hname:req.body.hname})
  .then(result => {
    if(result===null){
      hospCollection.insertOne(req.body)
        .then(result => {
          console.log(result.result);
          res.redirect('/home');
        })
        .catch(error => console.error(error))
    }
    else  
      console.log("Already Exists");
    res.redirect('/home');
  })
  .catch((err) => {
    console.log(err);
  })
});
app.get('/hospitals', (req, res) => {
  db.collection("hospitals").find().toArray()
    .then(results => {
      res.render('index.ejs', { hospitals : results })

    })
    .catch(error => console.error(error))
});

app.delete('/hospitals', (req, res) => {
  hospCollection.deleteOne(
    { hname: req.body.hname }
  )
  .then(result => {
    if (result.deletedCount === 0) {
      return res.json('No hospital to delete');
    }
    res.json(`Deleted Hospital`);
  })
  .catch(error => console.error(error));
});


app.post('/ventilators', Auth.isAdmin, (req, res) => {
 let exists; 
 db.collection("hospitals").findOne({ hname: req.body.hname })
  .then(result => {
    let no = result.hvent;
    hospCollection.updateOne({ hname: req.body.hname }, { $set: { hvent: parseInt(no) + parseInt(req.body.ventno) } })
      .then((obj) => {
        res.redirect('/home');
      })
      .catch((err) => {
        console.log(err);
      })
    ventCollection.insertOne(req.body)
      .then(result => {
        console.log(result.result);
        
        res.redirect('/ventilators');
      })
      .catch(error => console.error(error))
  })
  .catch(err => {
    hospCollection.insertOne({ hname: req.body.hname, hvent: req.body.ventno, haddress: Math.floor(Math.random() * 100) })
      .then(result => {
        console.log(result.result);
      })
      .catch(error => console.error(error))
    ventCollection.insertOne(req.body)
      .then(result => {
        console.log(result.result);
        res.redirect('/home');
      })
      .catch(error => console.error(error))
  });
  
});
app.get('/ventilators', (req, res) => {
  let total = 0;
  db.collection("hospitals").find().toArray()
    .then(results => {
      results.forEach(element => {
        total += parseInt(element.hvent);
      });
      console.log(total);
      res.render('vents.ejs', { ventilators: total })
    })
    .catch(error => console.error(error))
});

app.post('/signup', async (req, res) => {
  
  const { username, password, role } = req.body;
  const user =  await userCollection.findOne({username:username});
  if (user) {
    res.send('User Already Exists');
    res.redirect('/');
  } else {
    db.collection("userCollection").insertOne(req.body)
    .then(result=>{
      // console.log(result);
      console.log("User Succesfully created");
      res.redirect('/');
    })
    .catch(err=>console.log(err));
  }
});
app.post('/login', async (req, res) => {
  const user = await db.collection("userCollection").findOne({username:req.body.username,password:req.body.password});
  console.log(user);
  if (user) {
    const accessTokenSecret = "monkeyddragonhasthehighestbountyinonepiece";
    const accessToken = jwt.sign({ username: user.username, role: user.role }, accessTokenSecret);
    // res.json({
    //   accessToken
    // });
    res.render('server.ejs', { authToken : accessToken });
  } else {
    res.send('Username or password incorrect');
  }
});
app.get('/users',Auth.authenticateJWT, (req,res) => {
  db.collection("userCollection").find().toArray()
  .then(result=>{
    res.json(result);
  })
  .catch(err=>console.log(err));
})
app.listen(3000, function () {
  console.log("listening on 3000");
});
