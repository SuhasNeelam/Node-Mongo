const express = require("express");
const app = express();
const bodyParser = require("body-parser");


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

  })


app.get("/", (req, res) => {
  res.sendFile(
    "/Users/asus/OneDrive/Desktop/All_Web/Proj/preFS/hosp" +
      "/index.html"
  );
});
app.post('/hospitals', (req, res) => {
  hospCollection.insertOne(req.body)
  .then(result => {
    console.log(result.result);
    res.redirect('/');
  })
  .catch(error => console.error(error))
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

app.listen(3000, function () {
  console.log("listening on 3000");
});