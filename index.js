const express = require("express");
const config =  require("./config");
const MongoClient = require('mongodb').MongoClient;
const url = config.DB_URL;
const app = express();

const v3 = require("./routes/v3/app.js");

app.use(
    express.urlencoded({
      extended: true
    })
  )
  
app.use(express.json())

MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("events");
    dbo.createCollection("event", function(err, res) {
      if (err) {console.log("colllection already created"); return;};
      console.log("Collection created!");
      db.close();
    });
});

app.use("/api/v3/app", v3);


app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

// listener
app.listen(config.PORT, config.HOST, () =>{
    console.log(`App listening on http://${config.HOST}:${config.PORT}`);
}).on('error', err=>{
    if(err.errno === 'EADDRINUSE') {
        console.log(`----- Port ${config.PORT} is busy, trying with port another port`);
        
    } else {
        console.log(err);
    }
})


