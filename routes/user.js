const express = require('express')
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/userModel')
const bcrypt = require('bcrypt')
const updateService = require("../service/updateService")
const saltRounds = 10;
const path = require('path')
const fs = require('fs');




router.get("/dashboard", (req, res) => {
  let authToken = JSON.parse(req.headers.authorization);
  jwt.verify(authToken, "myUserToken", (err, result) => {
    if (err) {
      res.send({success: false, error: err})
    } else {
      res.send({success: true, data: result})
    }
  })
})

router.get("/profile", (req, res) => {
  let authToken = JSON.parse(req.headers.authorization);
  jwt.verify(authToken, "myUserToken", (err, result) => {
    if(err) {
      res.send({success: false, error: err})
    } else {
      //res.send({success: true, data: result})
      User.findOne({_id: result._id}, (err2, result2) =>{
        if(err2) {
          res.send({success: false, error: err2})
        } else {
          res.send({success: true, data: result2})
        }
      })
    }
  })
})

router.put("/edit-profile", (req, res) => {
  let userData = req.body;
  let authToken = JSON.parse(req.headers.authorization);
  jwt.verify(authToken, "myUserToken", (err, result) => {
    if(err) {
      res.send({success: false, error: err})
    } else {
      //res.send({success: true, data: result})
      User.updateOne({_id: result._id}, {$set: {name: userData.name}})
    }
  })
})





router.post("/update-password/:id", (req, res) => {
  let userData = req.body;
  User.findOne({_id: result._id}, (err2, result2) => {
    if(err2) {
      res.send({success: false, error: err2})
    } else {
      if(userData.password==result2.password) {
        updateService.sendUpdateMailService(result2, (err3, result3) => {
          if(err3) {
            res.send({success: false, error: err3})
          } else {
            res.send({success: true, message: result})
          }
        });
      }
    }
  })
})

router.post("/update-password", (req, res) => {
  let userData = req.body;
  let authToken = JSON.parse(req.headers.authorization);
  jwt.verify(authToken, "myUserToken", (err, result) => {
    if(err) {
      res.send({success: false, error: err})
    } else {
      bcrypt.hash(userData.password, saltRounds, (err2, hash) => {
        if(err1) {
          res.send({success: false, error: err2})
        } else {
          User.updateOne({_id: result._id}, {$set: {password: userData.password}})
        }
      })
    }
  })
})


router.post("/post", (req, res) => {
  let articleData = req.body;
  console.log("Article data", articleData)
  //console.log("articleData", articleData)
  // let authToken = req.headers.token;
  let authToken = JSON.parse(req.headers.authorization);
  console.log("authToken", authToken)
  jwt.verify(authToken, "myUserToken", (err, result) => {
    if(err) {
      console.log("error", err)
      res.send(err)
    } else {
      newPost = new Article({
        // author_name: result2.name,
        // author_email: result2.email,
        // visible: articleData.visible,
        title: articleData.title,
        visibility: articleData.visibility,
        article: articleData.article,
        postedBy: result._id,
      })
      console.log("newPost", newPost)
      newPost.save(function (err2, result2) {
        console.log('newPost', newPost)
        if(err2) {
          res.send(err2)
        } else {
          User.findOne({_id: result._id}, (err3, result3) => {
            if(err3) {
              res.send(err3)
            } else {
              console.log("result3: ", result3)
              if (result3.isAuthor == false || result3.isAuthor == true ) {
                User.updateOne({_id: result._id}, {$set: {isAuthor: true}}, (err4, result4) => {
                  if(err4) {
                    res.send(err4)
                  } else {
                    res.send({success: true, data: result2, data2: result3})
                  }
                })
              } else {
                res.send({success: true, data: result2, data2: result3})
              }
            }
          })
          // res.send({success: true, data: result2})
        }
      })
    }
  })
})







module.exports = router