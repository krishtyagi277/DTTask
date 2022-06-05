const express = require('express');
const mongoDb = require("mongodb");
const MongoClient = require("mongodb").MongoClient;
const config = require("../../config");
const ObjectID = require('mongodb').ObjectID; 
const Constants = require("../../constants");
const uuid = require('uuid');
const url = config.DB_URL;

const router = express.Router();

router.get('/events', function(req, res, next) {
try  {
  const uid = req.query.id;
  const type = req.query.type;
  const limitPerPage = parseInt(req.query.limit);
  const pageNumber = req.query.page;

    if(uid){
        const findEvent = {uid};
        MongoClient.connect(url, function(err, db) {
            if (err) throw err;
            const dbo = db.db("events");
            dbo.collection("event").findOne({},findEvent, function(err, result) {
                if (err) throw err;
                res.status(200).json(result);
                db.close();
            });
        });
    }
    else if(type && limitPerPage && pageNumber){
        const sortByType = {_id:-1}
        
        if(type !== "latest")
        sortByType._id = 1;


        MongoClient.connect(url, function(err, db) {
            if (err) throw err;
            const dbo = db.db("events");
            dbo.collection("event").find().sort(sortByType).skip((pageNumber-1)*limitPerPage).limit(limitPerPage).toArray(function(err, result) {
                if (err) throw err;
                res.status(200).json(result);
                db.close();
            });
        });
    }
    else {
        res.status(200).json([{message:Constants.NO_RECORD_FOUND}]);
    }
} 
catch(err)
{
    console.log(err)
    res.status(500).json([{message:Constants.ERROR}]);
}

});


router.post('/events', function(req, res, next) {
  const eventObj = req.body;
  try  {
  eventObj.uid = uuid.v4();
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    const dbo = db.db("events");
    dbo.collection("event").insertOne(eventObj, function(err, result) {
      if (err) throw err;
      res.status(200).json({id: eventObj.uid});
      db.close();
    });
  });
} 
catch(err)
{
    console.log(err)
    res.status(500).json({message:Constants.ERROR});
}
  
});


router.put("/events/:id", function(req, res, next){
 
      try {
        const eventIdObj = {'uid':req.params.id}
        const updateEventObj = {$set:req.body}
        MongoClient.connect(url, function(err, db) {
            if (err) throw err;
            const dbo = db.db("events");
            dbo.collection("event").updateOne(eventIdObj,updateEventObj, function(err, result) {
                if (err) throw err;
                res.status(200).json({message:Constants.SUCCESS});
                db.close();
            });
        });

      }
      catch(err)
      {
        console.log(err)
        res.status(500).json({message:Constants.SUCCESS});
      }
});

router.delete("/events/:id", function(req, res, next){
 
    try {
      const eventIdObj = {'uid':req.params.id}
      MongoClient.connect(url, function(err, db) {
          if (err) throw err;
          const dbo = db.db("events");
          dbo.collection("event").deleteOne(eventIdObj, function(err, result) {
              if (err) throw err;
              res.status(200).json({message:Constants.SUCCESS});
              db.close();
          });
      });

    }
    catch(err)
    {
      console.log(err)
      res.status(500).json({message:Constants.ERROR});
    }
});

module.exports = router;