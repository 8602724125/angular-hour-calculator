const express = require('express')
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/userModel')
const Article = require('../models/articleModel')
const bcrypt = require('bcrypt')
const updateService = require("../service/updateService")
const saltRounds = 10;
const path = require('path')
const fs = require('fs');


// var p1 = path.join(__dirname + '/../' + '/images')
// console.log('path', p1)
// var imgStr = fs.readFileSync(path.join(__dirname + '/../' + '/images/photo.jpeg'), (err, result) => {
//   if(err) {
//     console.log('err', err)
//   } else {
//     console.log('result', result)
//   }
// })
// console.log('imgStr', imgStr)

// const imageToBase64 = require('image-to-base64');
// var p1 = path.join(__dirname + '/../' + '/images')
// console.log('path', p1)
// imageToBase64(path.join(__dirname + '/../' + '/images/photo.jpeg')) // insert image url here.
//     .then( (response) => {
//           console.log('response',response);  // the response will be the string base64.
//       }
//     )
//     .catch(
//         (error) => {
//             console.log('error',error);
//         }
//     )

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


// router.put(
//   "/user/update",
//   body("name").trim().notEmpty().withMessage("Name field is required"),
//   //body("email").trim(),
//   // body("mobile")
//   //   .trim()
//   //   .notEmpty()
//   //   .withMessage("Mobile field is required")
//   //   .isLength({ min: 10, max: 10 })
//   //   .withMessage("Mobile number must be 10 digits")
//   //   .isMobilePhone()
//   //   .withMessage("Enter a valid mobile number"),
//   // body("password")
//   //   .trim()
//   //   .notEmpty()
//   //   .withMessage("Password fied is required")
//   //   .isStrongPassword({
//   //     minLength: 8,
//   //     minLowercase: 1,
//   //     minUppercase: 1,
//   //     minSymbols: 1,
//   //   })
//   //   .withMessage(
//   //     "Password must be greater than 8 digits and contain at least one lowercase letter, one uppercase letter and one number"
//   //   ),

//   (req, res) => {
//     let updateUserDetails = req.body;
//     const errors = validationResult(req);
//     function alphanumericString(str) {
//       return /[`\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/.test(str);
//     }
//     if (!errors.isEmpty()) {
//       return res.send(errors.array());
//     } else if (alphanumericString(updateUserDetails.name)) {
//       let obj = {
//         value: updateUserDetails.name,
//         msg: "Name should not contain number & special character",
//         param: "name",
//         location: "body",
//       };
//     } else {
//       j(updateUserDetails.password, saltRounds, (err, hash) => {
//         if (err) {
//           res.send({ success: false, error: err });
//         } else {
//           User.updateOne(
//             { email: updateUserDetails.email },
//             {
//               $set: {
//                 name: updateUserDetails.name,
//                 //mobile: updateUserDetails.mobile,
//                 //password: hash,
//               },
//             },
//             (err2, result2) => {
//               if (err2) {
//                 res.send({ success: false, error: err2 });
//               } else {
//                 res.send({ success: true, data: result2 });
//               }
//             }
//           );
//         }
//       });
//     }
//   }
// );


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

router.get("/subscription", (req, res) => {
  let authToken = JSON.parse(req.headers.authorization);
  jwt.verify(authToken, "myUserToken", (err, result) => {
    if(err) {
      res.send({success: false, error: err})
    } else {
      User.findOne({_id: result._id}, (err, result) => {
        if(err) {
          res.send({success: false, error: err})
        } else {
          res.send({success: false, data: result})
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

router.put("/author/update/:id", (req, res) => {
  let author = req.params;
  let updateData = req.body;
  let adminAuth = JSON.parse(req.headers.authorization);
  jwt.verify(adminAuth, "myUserToken", (err, result) => {
    if(err) {
      res.send({success: false, error: err})
    } else {
      Article.updateOne({ _id: author.id }, {$set: {subcription: updateData.subcription}}, (err2, result2) => {
        if (err2) {
          res.send({ success: false, error: err2 });
        } else {
          res.send({ success: true, data: result2 });
        }
      });
    }
  })
});

router.delete("/user/delete/:id", (req, res) => {
  let deleteUser = req.params;
  let adminAuth = JSON.parse(req.headers.authorization);
  jwt.verify(adminAuth, "myUserToken", (err, result) => {
    if(err) {
      res.send({success: false, error: err})
    } else {
      User.deleteOne({ _id: deleteUser.id }, (err2, result2) => {
        if (err2) {
          res.send({ success: false, error: err2 });
        } else {
          res.send({ success: true, data: result2 });
        }
      });
    }
  });
});

// router.post("/mypost", (req, res) => {
//   //let authToken = JSON.parse(req.headers.authorization);
//   let authToken = req.headers.token;
//   jwt.verify(authToken, "myUserToken", (err, result) => {
//     if(err) {
//       res.send(err)
//     } else {
//       //let myId = myUser._id;
//       Article.find({_myUser: result._id}).populate('myUser')
//       .then(result=> res.send(result))
//       .catch(error=> res.send(error))
//     }
//   } )
// })

// router.get("/mypost", (req, res) => {
//   //let authToken = JSON.parse(req.headers.authorization);
//   let authToken = req.headers.token;
//   jwt.verify(authToken, "myUserToken", (err, result) => {
//     if(err) {
//       res.send(err)
//     } else {
//       //let myId = myUser._id;
//       Article.find({_myUser: result._id}, (err2, result2) => {
//         if(err2) {
//           res.send(err2)
//         } else {
//           res.send(result2)
//         }
//       })
//     }
//   } )
// })



module.exports = router