const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const Article = require("../models/articleModel");
const Admin = require("../models/adminModel");
const mailService = require("../service/mailService");
const verifyService = require("../service/verifyService");
const forgetService = require("../service/forgetService");
const mailAdminService = require("../service/adminMailService");
const { isObjectIdOrHexString, default: mongoose } = require("mongoose");
const { json } = require("body-parser");


//const path = require("path");
const saltRounds = 10;



const RazorPay = require('razorpay')


const razorpay = new RazorPay({
  
  // Replace with your key_id
  key_id: 'rzp_test_sBmn8RcscOMhqe',

  // Replace with your key_secret
  key_secret: 'M6v9giz8eKihuWL4b9Yejodj'

});

router.post('/orders', async (req, res) => {
  console.log("body: ", req.body)
  const options = {
      amount: req.body.amount,
      currency: 'INR',
      receipt: shortid.generate(), //any unique id
      payment_capture: 1 //optional
  }
  try {
      const response = await razorpay.orders.create(options)
      res.json({
          order_id: response.id,
          currency: response.currency,
          amount: response.amount
      })
  } catch (error) {
      console.log(error);
      res.status(400).send('Unable to create order');
  }
})





router.post(
  "/register",
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email address is required")
    .isEmail()
    .withMessage("Enter a valid email addres"),
  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password field is required")
    .isStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minSymbols: 1,
    })
    .withMessage(
      "Password must be greater than 8 and contain at least one uppercase letter, one lowercase letter, and one number"
    ),

  (req, res) => {
    let createUser = req.body;
    // console.log("register", req.body)
    const errors = validationResult(req);
    function alphanumericString(str) {
      return /[`\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/.test(str);
    }
    if (!errors.isEmpty()) {
      res.send(errors);
    } else if (alphanumericString(createUser.name)) {
      // let obj = {
      //   value: createUser.name,
      //   msg: "Name should not contain number & special character",
      //   param: "name",
      //   location: "body",
      // };
      // errors.errors.push(obj);
      // res.send(errors.array());
      res.send({ message: "Only characters are allowed" });
    } else {
      bcrypt.hash(createUser.password, saltRounds, (err, hash) => {
        if (err) {
          res.send({ success: false, error: err });
        } else {
          //let oneTimePassword = Math.floor(100000 + Math.random() * 900000);
          //console.log(typeof oneTimePassword, oneTimePassword);
          const newUser = new User({
            name: createUser.name,
            email: createUser.email,
            password: hash,
            //mobile: createUser.mobile,
            //token: userToken,
            //otp: oneTimePassword,
          });
          console.log("newUser Data", newUser);
          newUser.save(function (err2, result2) {
            if (err2) {
              res.send(err2);
            } else {
              let sendMail = mailService.sendMailUser(newUser);
              res.send({ success: true, registered: result2});
            }
          });
        }
      });
    }
  }
);


router.post(
  "/admin-register",
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email address is required")
    .isEmail()
    .withMessage("Enter a valid email addres"),
  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password field is required")
    .isStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minSymbols: 1,
    })
    .withMessage(
      "Password must be greater than 8 and contain at least one uppercase letter, one lowercase letter, and one number"
    ),

  (req, res) => {
    let createAdmin = req.body;
    const errors = validationResult(req);
    function alphanumericString(str) {
      return /[`\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/.test(str);
    }
    if (!errors.isEmpty()) {
      res.send(errors);
    } else if (alphanumericString(createAdmin.name)) {
      res.send({ message: "Only characters are allowed" });
    } else {
      bcrypt.hash(createAdmin.password, saltRounds, (err, hash) => {
        if (err) {
          res.send({ success: false, error: err });
        } else {

          const newAdmin = new Admin({
            name: createAdmin.name,
            email: createAdmin.email,
            password: hash,

          });
          console.log("newAdmin Data", newAdmin);
          newAdmin.save(function (err2, result2) {
            if (err2) {
              res.send(err2);
            } else {
              let sendMail = mailService.sendMailUser(newAdmin);
              res.send(result2);
            }
          });
        }
      });
    }
  }
);



router.get("/article", (req, res) => {
  // console.log('data', req.body)
  //Article.find({},{author_name: 1, title: 1, posts: 1, date: 1, subscribers: 1}, (err, result) => {
  Article.find({visibility: 'public'}).sort({$natural:-1}).limit(10).populate('postedBy')
  .then(result=> res.send({success: true, postData: result}))
  .catch(error=> res.send(error));
  // res.send('ok')

});

// router.get("/authors", (req, res) => {
//   // let authorData = req.body;
//   Article.distinct('myUser', (err, result) => {
//     if(err) {
//       res.send(err)
//     } else {
//       User.find()
//     }
//   }).populate('myUser')
//   .then(result=> res.send(result))
//   .catch(error=> res.send(error))
// });

router.get("/authors", (req, res) => {
  // let authorData = req.body;
  User.find({isAuthor: true}, (err, result) => {
    if (err) {
      res.send({ success: false, error: err });
    } else {
      res.send({ success: true, authorData: result });
    }
    // console.log("result", result)
  }
  )
});

router.get("/author-posts/:id", (req, res) => {
  let authorData = req.params;
  console.log("authorData", authorData)
  //console.log("authorData id", authorData.id)
  //Article.findOne({_id: authorData._id}, {author_name: 1, title: 1, posts: 1, date: 1, subscribers: 1} ,(err, result) => {
  Article.find(
    { myUser : authorData.id }
    // (err, result) => {
    //   if (err) {
    //     res.send(err);
    //   } else {
    //     console.log("post", result)
    //     res.send(result);
    //   }
    // }
  ).populate('postedBy')
  .then(result=> res.send(result))
  .catch(error=> res.send(error))
});

router.get("/read-post/:id", (req, res) => {
  let postData = req.params;
  Article.find(
    { _id: postData.id }
  ).populate('postedBy')
  .then(result=> res.send(result))
  .catch(error=> res.send(error))
});

// router.get("/count-post-viewer/:id", (req, res) => {
//   let updateData = req.params;
//   Article.find(
//     { _id: updateData.id }, (err, result) => {
//       if (err) {
//         res.send({ success: false, error: err })
//       } else {
//         console.log("find result", result);
//         Article.updateOne(
//           { _id: updateData.id },
//           { $set: { view: result.view + 1 } },
//           (err2, result2) => {
//             if (err2) {
//               res.send({ success: false, error: err2 });
//             } else {
//               console.log("updated result", result2);
//               res.send({ success: true, data: result2});
//             }
//           }
//         );
//       }

//     }
//   ).populate('postedBy')
//   .then(result3=> res.send(result3))
//   .catch(error3=> res.send(error3))
// });

router.get("/count-post-viewer/:id", (req, res) => {
  let updateData = req.params;
  Article.findOne(
    { _id: updateData.id }
  ).populate('postedBy')
  .then(result=> {
    console.log("result : ", result)
    console.log(typeof result.views)
    // var count = parseInt(result.view) + 1;
    Article.updateOne(
      { _id: updateData.id },
      { $set: { views: result.views + 1 } },
      (error2, result2) => {
        if (error2) {
          console.log("error2 : ", error2)
          res.send({ success: false, error: error2 });
        } else {
          console.log("updated result", result2);
          res.send({ success: true, data: result2});
        }
      }
    );
    
  } )
  .catch(error=> res.send(error))
});

router.get("/author-profile/:id", (req, res) => {
  let authorData = req.params;
  User.findOne(
    { author_id: authorData.id },
    (err, result) => {
      if (err) {
        res.send(err);
      } else {
        console.log("post", result)
        res.send(result);
      }
    }
  )
  // .populate('postedBy')
  // .then(result=> res.send(result))
  // .catch(error=> res.send(error))
});

router.post("/getUser/post", (req, res) => {
  let authToken = JSON.parse(req.headers.authorization);
  jwt.verify(authToken, "myUserToken", (err, result) => {
    if(err) {
      res.send(err)
    } else {
      let myId = myUser._id;
      Article.find({myId: result._id}, (err2, result2) => {
        if(err2) {
          res.send(err2)
        } else {
          res.send(result2)
        }
      } )
    }
  } )
})

router.post(
  "/login",
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email field is required")
    .isEmail()
    .withMessage("Enter a valid email address"),
  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password field is required")
    .isStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minSymbols: 1,
    })
    .withMessage(
      "Password must be greater than 8 and contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.send({ success: false, errror: errors });
    } else {
      let userAuth = req.body;
      User.findOne(
        //{ $and: [{ email: userAuth.email }, { status: true }] },
        { email: userAuth.email },
        (err, result) => {
          if (err) {
            res.send({ success: false, error: err });
          } else if (result == null) {
            res.send({
              success: false,
              notExist: true,
              flag: 1,
              message: "User does not exist",
              //data: result,
            });
          } else if (result.status == false) {
            res.send({
              success: false,
              status: true,
              flag: 0,
              message: "Please verify your email",
              data: result,
            });
          } else {
            bcrypt.compare(
              userAuth.password,
              result.password,
              (err2, result2) => {
                if (err2) {
                  res.send({ success: false, error: err2 });
                } else if (!result2) {
                  res.send({
                    success: false,
                    flag: 2,
                    mismatch: true,
                    error: "Incorrect password",
                  });
                } else {
                  let userToken = jwt.sign(
                    { _id: result._id, role: "user" },
                    "myUserToken"
                  );
                  User.updateOne(
                    { _id: result._id },
                    { $set: { token: userToken } },
                    (err3, result3) => {
                      if (err3) {
                        res.send({ success: false, error: err3 });
                      } else {
                        res.send({
                          log_success: true,
                          data: result3,
                          token: userToken,
                          name: result.name
                        });
                      }
                    }
                  );
                }
              }
            );
          }
        }
      );
    }
  }
);


router.post(
  "/admin-login",
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email field is required")
    .isEmail()
    .withMessage("Enter a valid email address"),
  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password field is required")
    .isStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minSymbols: 1,
    })
    .withMessage(
      "Password must be greater than 8 and contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.send({ success: false, errror: errors });
    } else {
      let adminAuth = req.body;
      Admin.findOne(
        //{ $and: [{ email: userAuth.email }, { status: true }] },
        { email: adminAuth.email },
        (err, result) => {
          if (err) {
            res.send({ success: false, error: err });
          } else if (result == null) {
            res.send({
              success: false,
              notExist: true,
              flag: 1,
              message: "User does not exist",
              //data: result,
            });
          } else {
            bcrypt.compare(
              adminAuth.password,
              result.password,
              (err2, result2) => {
                if (err2) {
                  res.send({ success: false, error: err2 });
                } else if (!result2) {
                  res.send({
                    success: false,
                    flag: 2,
                    mismatch: true,
                    error: "Incorrect password",
                  });
                } else {
                  let adminToken = jwt.sign(
                    { _id: result._id, role: "admin" },
                    "myAdminToken"
                  );
                  console.log("token", adminToken)
                  Admin.updateOne(
                    { _id: result._id },
                    { $set: { token: adminToken } },
                    (err3, result3) => {
                      if (err3) {
                        res.send({ success: false, error: err3 });
                      } else {
                        res.send({
                          log_success: true,
                          data: result3,
                          token: adminToken,
                          name: result.name
                        });
                      }
                    }
                  );
                }
              }
            );
          }
        }
      );
    }
  }
);


router.post(
  "/admin/login",
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email field is required")
    .isEmail()
    .withMessage("Enter a valid email address"),
  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password field is required")
    .isStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minSymbols: 1,
    })
    .withMessage(
      "Password must be greater than 8 and contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.send({ success: false, error: errors });
    } else {
      let adminAuth = req.body;
      console.log("adminAuth", adminAuth.email);
      Admin.findOne(
        //{ $and: [{ email: userAuth.email }, { status: true }] },
        { email: adminAuth.email },
        (err, result) => {
          if (err) {
            res.send(err);
          } else if (result != null) {
            console.log("find admin result", result);
            bcrypt.compare(
              adminAuth.password,
              result.password,
              (err2, result2) => {
                if (err2) {
                  res.send(err2);
                } else if (!result2) {
                  res.send({
                    success: false,
                    flag: 2,
                    error: "Incorrect password",
                  });
                } else {
                  let adminToken = jwt.sign(
                    { _id: result._id, role: "admin" },
                    "myAdminToken"
                  );
                  Admin.updateOne(
                    { _id: result._id },
                    { $set: { token: adminToken } },
                    (err3, result3) => {
                      if (err3) {
                        res.send(err3);
                      } else {
                        res.send({
                          success: true,
                          data: result3,
                          token: adminToken,
                          name: result.name
                        });
                      }
                    }
                  );
                }
              }
            );
          } else {
            res.send({
              success: false,
              flag: 1,
              message: "User does not exist",
              data: result,
            });
          }
        }
      );
    }
  }
);

router.get("/register-user/verification", (req, res) => {
  let userEmail = req.body;
  //let authToken = JSON.parse(req.headers.authorization)
  User.findOne({ email: userEmail.email }, (err, result) => {
    if (err) {
      res.send(err);
    } else if (result == null) {
      res.send({ success: false, notExist: true, message: "User does not exist" });
    } else {
      // let userOtp = Math.floor(100000 + Math.random() * 900000);
      // let userToken = jwt.sign({ email: result.email }, "CIS");
      let sendMail = verifyService.sendVerifyEmailService(result);
      if (sendMail) {
        res.send({
          success: true,
          verified: true,
          message: "Email send successfully!",
          data: result,
          mailResponse: sendMail,
        });
      } else {
        res.send({
          success: false,
          message: "Email does not send",
          data: result,
          mailResponse: sendMail,
        });
      }
    }
  });
});

router.get("/email-verification/:id", (req, res) => {
  let userData = req.params;
  //let myStatus = false;
  User.findOne({ _id: userData.id }, (err, result) => {
    console.log("result : " , result)
    if (err) {
      res.send({ success: false, error: err });
    } else if (result ==  null) {
      res.send({ success: false, error: 'NOT_FOUND_ERR'});
    } else if (result.status == true) {
      res.send({ success: true, already: true, message: "Email address already verified", data: result });
    } else {
      console.log("user id", userData.id);
      User.updateOne(
        { _id: userData.id },
        { $set: { status: true } },
        (err2, result2) => {
          if (err2) {
            res.send({ success: false, error: err2 });
          } else {
            //myStatus = true;
            console.log("result verify", result);
            res.send({ success: true, data: result, status: true });
          }
        }
      );
    }
  });
});

// router.get("/user-email-verification/:id", (req, res) => {
//   let userData = req.params;
//   let myStatus = false;
//   User.findOne({ _id: userData.id }, (err, result) => {
//     if (err) {
//       res.send({ success: false, error: err });
//     } else if (result.status == true) {
//       res.send({ success: true, message: "Email address already verified", data: result });
//     } else {
//       console.log("user id", userData.id);
//       User.updateOne(
//         { _id: userData.id },
//         { $set: { status: true } },
//         (err2, result2) => {
//           if (err2) {
//             res.send({ success: false, error: err2 });
//           } else {
//             myStatus = true;
//             console.log("result verify", result);
//             res.send({ success: true, data: result, status: myStatus });
//           }
//         }
//       );
//     }
//   });
// });

router.post("/forget-password", (req, res) => {
  let userEmail = req.body;
  User.findOne({ email: userEmail.email }, (err, result) => {
    if (err) {
      res.send({ success: false, error: err });
    } else if (result == null) {
      res.send({
        success: false,
        notExist: true,
        message: "User does not exits",
        data: result,
      });
    } else {
      let sendMail = forgetService.sendForgetMailService(result);
      if (sendMail) {
        res.send({
          success: true,
          message: "Email send successfully!",
          data: result,
          mailResponse: sendMail,
        });
      } else {
        res.send({
          success: false,
          message: "Email does not send",
          data: result,
          mailResponse: sendMail,
        });
      }
    }
  });
});

router.post("/create-password/:id", (req, res) => {
  let userInfo = req.params;
  let userPass = req.body;
  User.findOne({ _id: userInfo.id }, (err, result) => {
    if (err) {
      res.send({ success: false, error: err });
    } else {
      bcrypt.hash(userPass.password, saltRounds, (err2, hash) => {
        if (err2) {
          res.send({ success: false, error: err2 });
        } else {
          User.updateOne(
            { email: result.email },
            { $set: { password: hash } },
            (err3, result3) => {
              if (err3) {
                res.send({
                  success: false,
                  message: "Data does not update",
                  error: err3,
                });
              } else {
                res.send({
                  success: true,
                  message: "Data updated successfully!",
                  //data: result3,
                });
              }
            }
          );
        }
      });
    }
  });
});

router.get("/verify", (req, res) => {
  let authToken = req.headers.token; // for postman
  console.log("authToken: ", authToken)
  //let authToken = JSON.parse(req.headers.authorization);
  jwt.verify(authToken, "myUserToken", (err, result) => {
    if (err) {
      console.log("err: ", err)
      res.send({ success: false });
    } else {
      console.log("result: ", result)
      res.send(result);
    }
  });
});

router.get("/check-user-subcribe/:id", (req, res) => {
  let author_id = req.params.id;
  let sbcr = false;
  console.log("author_id: ", author_id)
  // let authToken = req.headers.token; // for postman
  let userToken = JSON.parse(req.headers.authorization);
  jwt.verify(userToken, "myUserToken", (err, result) => {
    if (err) {
      res.send({ success: false, error: err});
    } else {
      // console.log("result: ", result)
      if (result._id == author_id ) {
        res.send({success: false, message: "You cannot subcribe yourself."})
      } else {
        User.findOne({_id: result._id}, (err2, result2) => {
          if (err2) {
            res.send({ success: false, error: err2});
          } else {
            console.log("checking subscribes: ", result2)
            result2.subscribes.forEach(element => {
              // for (let element = 0; element< result2.subcribes.len; i++) {
              console.log("element: ", element)
              console.log(author_id == element)
              if(author_id == element) {
                sbcr = true;
                // let index = result.indexOf(author_id);
                // subcribers: result.subcribers.splice(index, 1)}
                User.updateOne({_id: result._id}, {$pull: {subscribes: author_id}}, (err3, result3) => {
                  console.log("calling update 1")
                  if (err3) {
                    res.send({ success: false, error: err3});
                  } else {
                    User.updateOne({_id: mongoose.Types.ObjectId(author_id)}, {$pull: {subscribers: result._id}}, (err4, result4) => {
                      if (err4) {
                        res.send({ success: false, error: err4});
                      } else {
                        res.send({ success: true, subscribe: false, data: result2 });
                      }
                    })
                    // res.send({ success: true, subcribe: false, data: result3});
                  }
                })
              }
            }
            );
            if (sbcr == false) {
              User.updateOne({_id: result._id}, {$push: {subscribes: author_id}}, (err5, result5) => {
                console.log("calling update 2")
                if (err5) {
                  res.send({ success: false, error: err5});
                } else {
                  User.updateOne({_id: mongoose.Types.ObjectId(author_id)}, {$push: {subscribers: result._id}}, (err6, result6) => {
                    console.log("Inside author update")
                    if (err6) {
                      res.send({ success: false, error: err6});
                    } else {
                      res.send({ success: true, subscribe: true, data: result2 });
                    }
                  })
                  // res.send({ success: true, subcribe: true, data: result5});
                }
              })
            }
          }
        })
      }
      // res.send(result);
    }
  });
});


router.get("/check-user-friend/:id", (req, res) => {
  let friend_id = req.params.id;
  let friend = false;
  let send_request = false;
  console.log("friend_id: ", friend_id)
  // let authToken = req.headers.token; // for postman
  let userToken = JSON.parse(req.headers.authorization);
  jwt.verify(userToken, "myUserToken", (err, result) => {
    if (err) {
      res.send({ success: false, error: err});
    } else {
      User.findOne({_id: result._id}, (err2, result2) => {
        if (err2) {
          res.send({ success: false, error: err2});
        } else {
          console.log("checking friends: ", result2)
          result2.friends.forEach(element => {
            console.log("element: ", element)
            console.log(friend_id == element)
            if(friend_id == element) {
              friend = true;
              User.updateOne({_id: result._id}, {$pull: {friends: friend_id}}, (err3, result3) => {
                console.log("calling update 1")
                if (err3) {
                  res.send({ success: false, error: err3});
                } else {
                  User.updateOne({_id: mongoose.Types.ObjectId(friend_id)}, {$pull: {friends: result._id}}, (err4, result4) => {
                    if (err4) {
                      res.send({ success: false, error: err4});
                    } else {
                      res.send({ success: true, friend: false, data: result2 });
                    }
                  })
                  // res.send({ success: true, friend: false, data: result3});
                }
              })
            }
          });
          if (friend == false) {
            result2.send_requests.forEach(element => {
              if (friend_id == element) {
                send_request = true;
                User.updateOne({_id: result._id}, {$pull: {send_requests : friend_id}}, (err5, result5) => {
                  console.log("calling update 2")
                  if (err5) {
                    res.send({ success: false, error: err5});
                  } else {
                    User.updateOne({_id: mongoose.Types.ObjectId(friend_id)}, {$pull: {pending_requests: result._id}}, (err6, result6) => {
                      console.log("Inside author update")
                      if (err6) {
                        res.send({ success: false, error: err6});
                      } else {
                        res.send({ success: true, send_request: false, data: result2 });
                      }
                    })
                    // res.send({ success: true, friend: true, data: result4});
                  }
                })
              }
            })
          }
          if (send_request == false) {
            User.updateOne({_id: result._id}, {$push: {send_requests : friend_id}}, (err7, result7) => {
              console.log("calling update 2")
              if (err7) {
                res.send({ success: false, error: err7});
              } else {
                User.updateOne({_id: mongoose.Types.ObjectId(friend_id)}, {$push: {pending_requests: result._id}}, (err8, result8) => {
                  if (err8) {
                    res.send({ success: false, error: err8});
                  } else {
                    console.log("send friend request")
                    res.send({ success: true, friend: true, data: result2 });
                  }
                })
                // res.send({ success: true, friend: true, data: result4});
              }
            })
          }
        }
      })
      // res.send(result);
    }
  });
});


router.get("/confirm-request/:id", (req, res) => {
  let friend_id = req.params.id;
  console.log("friend_id: ", friend_id)
  // let authToken = req.headers.token; // for postman
  let userToken = JSON.parse(req.headers.authorization);
  jwt.verify(userToken, "myUserToken", (err, result) => {
    if (err) {
      res.send({ success: false, error: err});
    } else {
      User.findOne({_id: result._id}, (err2, result2) => {
        if (err2) {
          res.send({ success: false, error: err2});
        } else {
          console.log("checking friends: ", result2)
          result2.pending_requests.forEach(element => {
            console.log("element: ", element)
            console.log(friend_id == element)
            if(friend_id == element) {
              friend = true;
              User.updateOne({_id: result._id}, { $push: {friends: friend_id}, $pull: {pending_requests: friend_id} }, (err3, result3) => {
                console.log("calling update 1")
                if (err3) {
                  res.send({ success: false, error: err3});
                } else {
                  User.updateOne({_id: friend_id}, { $push: {friends: result._id}, $pull: {send_requests: result._id} }, (err4, result4) => {
                    console.log("calling update 2")
                    if (err4) {
                      res.send({ success: false, error: err4});
                    } else {
                      res.send({ success: true, friend: false, data: result2 });
                    }
                  })
                  // res.send({ success: true, friend: false, data: result3});
                }
              })
            }
          })
          if (friend == false) {
            res.send({ success: false, error: "NOt_FOUND_ERR"});
          }
        }
      })
      // res.send(result);
    }
  });
});


router.get('/dashboard', (req, res) => {
  let userToken = JSON.parse(req.headers.authorization);
  jwt.verify(userToken, 'myUserToken', (err, result) => {
    if (err) {
      res.send({ success: false, error: err});
    } else {
      User.findOne({_id: result._id}, (err2, result2) => {
        if (err2) {
          res.send({ success: false, error: err2});
        } else {
          console.log("friends: ", result2.friends.length)
          Article.find({postedBy: result._id}, (err3, result3) => {
            if (err3) {
              res.send({ success: false, error: err2});
            } else {
              console.log("result2: ", result2)
              console.log("result3: ", result3.length)
              res.send({ success: true, data: {
                friends: result2.friends.length, subscribes: result2.subscribes.length,
                subscribers: result2.subscribers.length, send_requests: result2.send_requests.length,
                pending_requests: result2.pending_requests.length, posts: result3.length
              }});
            }
          })

        }
      })
    }
  })
})

router.get('/view-friends-list', (req, res) => {
  let friendsData = [];
  // let userToken = req.headers.token;
  let userToken = JSON.parse(req.headers.authorization);
  console.log("userToken: ", userToken)
  jwt.verify(userToken, 'myUserToken', (err, result) => {
    if (err) {
      res.send({ success: false, error: err});
    } else {
      User.findOne({ _id: result._id}, (err2, result2) => {
        if (err2) {
          res.send({success: false, error: err2})
        } else {
          console.log("result: ", result2)
          console.log("friends: ", result2.friends.length)
          // res.send({success: true, friend: result2})
          if (result2.friends.length != 0) {
            result2.friends.forEach(friend => {
              // console.log("friend list: ", friend)
              User.findOne({_id: friend}, (err3, result3) => {
                if (err3) {
                  res.send({success: false, error: err3})
                } else {
                  // console.log(`result3: ${count} `, result3)
                  friendsData.push(result3)
                  // console.log(`friendData: ${count}`, friendData)
                  if (friendsData.length == result2.friends.length ) {
                    res.send({success: true, friends: friendsData})
                  }
                }
              })
            })
          } else {
            res.send({success: false, error: "NO_FRIEND_FOUND"})
          }
        }
      }) 
    }
  })
})


router.get('/view-pending-requests', (req, res) => {
  let pending_requestsData = [];
  let userToken = req.headers.token;
  // let userToken = JSON.parse(req.headers.authorization);
  console.log("userToken: ", userToken)
  jwt.verify(userToken, 'myUserToken', (err, result) => {
    if (err) {
      res.send({ success: false, error: err});
    } else {
      User.findOne({ _id: result._id}, (err2, result2) => {
        if (err2) {
          res.send({success: false, error: err2})
        } else {
          console.log("pending_requests: ", result2.pending_requests.length)
          // res.send({success: true, friend: result2})
          result2.pending_requests.forEach(pending_request => {
            // console.log("friend list: ", friend)
            User.findOne({_id: pending_request}, (err3, result3) => {
              if (err3) {
                res.send({success: false, error: err3})
              } else {
                // console.log(`result3: ${count} `, result3)
                pending_requestsData.push(result3)
                // console.log(`friendData: ${count}`, friendData)
                if (pending_requestsData.length == result2.pending_requests.length ) {
                  res.send({success: true, pending_requests: pending_requestsData})
                }
              }
            })
          })
        }
      }) 
    }
  })
})

router.get('/view-send-requests', (req, res) => {
  let send_requestsData = [];
  let userToken = req.headers.token;
  // let userToken = JSON.parse(req.headers.authorization);
  console.log("userToken: ", userToken)
  jwt.verify(userToken, 'myUserToken', (err, result) => {
    if (err) {
      res.send({ success: false, error: err});
    } else {
      User.findOne({ _id: result._id}, (err2, result2) => {
        if (err2) {
          res.send({success: false, error: err2})
        } else {
          console.log("send_requests: ", result2.send_requests.length)
          // res.send({success: true, friend: result2})
          result2.send_requests.forEach(send_request => {
            // console.log("friend list: ", friend)
            User.findOne({_id: send_request}, (err3, result3) => {
              if (err3) {
                res.send({success: false, error: err3})
              } else {
                // console.log(`result3: ${count} `, result3)
                send_requestsData.push(result3)
                // console.log(`friendData: ${count}`, friendData)
                if (send_requestsData.length == result2.pending_requests.length ) {
                  res.send({success: true, send_requests: send_requestsData})
                }
              }
            })
          })
        }
      }) 
    }
  })
})

router.get('/view-subscribes', (req, res) => {
  let subscribesData = [];
  let userToken = req.headers.token;
  // let userToken = JSON.parse(req.headers.authorization);
  console.log("userToken: ", userToken)
  jwt.verify(userToken, 'myUserToken', (err, result) => {
    if (err) {
      res.send({ success: false, error: err});
    } else {
      User.findOne({ _id: result._id}, (err2, result2) => {
        if (err2) {
          res.send({success: false, error: err2})
        } else {
          console.log("subscribes: ", result2.subscribes.length)
          // res.send({success: true, friend: result2})
          result2.subscribes.forEach(subscribe => {
            // console.log("friend list: ", friend)
            User.findOne({_id: subscribe}, (err3, result3) => {
              if (err3) {
                res.send({success: false, error: err3})
              } else {
                // console.log(`result3: ${count} `, result3)
                subscribesData.push(result3)
                // console.log(`friendData: ${count}`, friendData)
                if (subscribesData.length == result2.subscribes.length ) {
                  res.send({success: true, subscribes: subscribesData})
                }
              }
            })
          })
        }
      }) 
    }
  })
})

router.get('/view-subscribers', (req, res) => {
  let subscribesrData = [];
  let userToken = req.headers.token;
  // let userToken = JSON.parse(req.headers.authorization);
  console.log("userToken: ", userToken)
  jwt.verify(userToken, 'myUserToken', (err, result) => {
    if (err) {
      res.send({ success: false, error: err});
    } else {
      User.findOne({ _id: result._id}, (err2, result2) => {
        if (err2) {
          res.send({success: false, error: err2})
        } else {
          console.log("subscribers: ", result2.subscribers.length)
          // res.send({success: true, friend: result2})
          result2.subscribers.forEach(subscriber => {
            // console.log("friend list: ", friend)
            User.findOne({_id: subscriber}, (err3, result3) => {
              if (err3) {
                res.send({success: false, error: err3})
              } else {
                // console.log(`result3: ${count} `, result3)
                subscribersData.push(result3)
                // console.log(`friendData: ${count}`, friendData)
                if (subscribersData.length == result2.subscribers.length ) {
                  res.send({success: true, subscribers: subscribersData})
                }
              }
            })
          })
        }
      }) 
    }
  })
})

router.get('/view-posts', (req, res) => {
  let userToken = req.headers.token;
  // let userToken = JSON.parse(req.headers.authorization);
  console.log("userToken: ", userToken)
  jwt.verify(userToken, 'myUserToken', (err, result) => {
    if (err) {
      res.send({ success: false, error: err});
    } else {
      console.log("_id: ", result._id)
      Article.findOne({ postedBy: result._id}, (err2, result2) => {
        if (err2) {
          res.send({success: false, error: err2})
        } else {
          res.send({success: true, posts: result2})
        }
      }) 
    }
  })
})


router.get("/like-post/:id", (req, res) => {
  let post_id = req.params.id;
  // let userToken = req.headers.token; // for postman
  let userToken = JSON.parse(req.headers.authorization);
  jwt.verify(userToken, "myUserToken", (err, result) => {
    if (err) {
      res.send({ success: false, error: err});
    } else {
      // console.log("result: ", result)
      Article.findOne({_id: post_id}, (err2, result2) => {
        if (err2) {
          res.send({ success: false, error: err2});
        } else {
          console.log("Article: ", result2)
          console.log("like: ", result2.likedBy.includes(result._id))
          console.log("dislike", result2.dislikedBy.includes(result._id))
          if (result2.likedBy.includes(result._id)) {
            Article.updateOne({_id: post_id}, {$pull: {likedBy: result._id}, $set: {likes: (result2.likes - 1)}}, (err3, result3) => {
              if (err3) {
                res.send({ success: false, error: err3});
              } else {
                // if (result2.dislikes.includes(result._id)) {
                //   Article.updateOne({_id: post_id}, {$pull: {dislikedBy: result._id}, count}, (err4, result4) => {
                //     if (err4) {
                //       res.send({ success: false, error: err4});
                //     } else {
                //       res.send({ success: true, like: false, likeCount: (result2.likes.length - 1), dislikeCount: (result2.dislikes.length - 1)});
                //     }
                //   })

                // } else {
                //   res.send({ success: true, like: false, likeCount: (result2.likes.length - 1), dislikeCount: result2.dislikes.length - 1});
                // }
                res.send({ success: true, like: false, likeCount: (result2.likes - 1), dislikeCount: result2.dislikes});
              }
            })
          } else {
            Article.updateOne({_id: post_id}, {$push: {likedBy: result._id},  $set: {likes: (result2.likes + 1)}}, (err4, result4) => {
              if (err4) {
                res.send({ success: false, error: err4});
              } else {
                if (result2.dislikedBy.includes(result._id)) {
                  Article.updateOne({_id: post_id}, {$pull: {dislikedBy: result._id},  $set: {dislikes: (result2.dislikes - 1)}}, (err5, result5) => {
                    if (err5) {
                      res.send({ success: false, error: err5});
                    } else {
                      res.send({ success: true, like: true, likeCount: (result2.likes + 1), dislikeCount: (result2.dislikes - 1)});
                    }
                  })

                } else {
                  res.send({ success: true, like: true, likeCount: (result2.likes + 1), dislikeCount: (result2.dislikes)});
                }
              }
            })
          }
        }
      })

      // res.send(result);
    }
  });
});


router.get("/dislike-post/:id", (req, res) => {
  let post_id = req.params.id;
  // let userToken = req.headers.token; // for postman
  let userToken = JSON.parse(req.headers.authorization);
  jwt.verify(userToken, "myUserToken", (err, result) => {
    if (err) {
      res.send({ success: false, error: err});
    } else {
      // console.log("result: ", result)
      Article.findOne({_id: post_id}, (err2, result2) => {
        if (err2) {
          res.send({ success: false, error: err2});
        } else {
          console.log("Article: ", result2)
          console.log("like: ", result2.likedBy.includes(result._id))
          console.log("dislike", result2.dislikedBy.includes(result._id))
          if (result2.dislikedBy.includes(result._id)) {
            Article.updateOne({_id: post_id}, {$pull: {dislikedBy: result._id}, $set: {dislikes: (result2.dislikes - 1)}}, (err3, result3) => {
              if (err3) {
                res.send({ success: false, error: err3});
              } else {
                // if (result2.dislikes.includes(result._id)) {
                //   Article.updateOne({_id: post_id}, {$pull: {dislikedBy: result._id}, count}, (err4, result4) => {
                //     if (err4) {
                //       res.send({ success: false, error: err4});
                //     } else {
                //       res.send({ success: true, like: false, likeCount: (result2.likes.length - 1), dislikeCount: (result2.dislikes.length - 1)});
                //     }
                //   })

                // } else {
                //   res.send({ success: true, like: false, likeCount: (result2.likes.length - 1), dislikeCount: result2.dislikes.length - 1});
                // }
                res.send({ success: true, dislike: false, likeCount: result2.likes, dislikeCount: (result2.dislikes - 1)});
              }
            })
          } else {
            Article.updateOne({_id: post_id}, {$push: {dislikedBy: result._id}, $set: {dislikes: (result2.dislikes + 1)}}, (err4, result4) => {
              if (err4) {
                res.send({ success: false, error: err4});
              } else {
                if (result2.likedBy.includes(result._id)) {
                  Article.updateOne({_id: post_id}, {$pull: {likedBy: result._id}, $set: {likes: (result2.likes - 1)}}, (err5, result5) => {
                    if (err5) {
                      res.send({ success: false, error: err5});
                    } else {
                      res.send({ success: true, dislike: true, likeCount: (result2.likes - 1), dislikeCount: (result2.dislikes + 1)});
                    }
                  })

                } else {
                  res.send({ success: true, dislike: true, likeCount: result2.likes, dislikeCount: (result2.dislikes  + 1)});
                }
              }
            })
          }
        }
      })

      // res.send(result);
    }
  });
});


router.get('/share-post/:id', (req, res) => {
  let post_id = req.params.id;
  let shareFriends = [];
  // let userToken = req.headers.token; // for postman
  let userToken = JSON.parse(req.headers.authorization);
  jwt.verify(userToken, 'myUserToken', (err, result) => {
    if (err) {
      res.send({success: false, error: err})
    } else {
      User.findOne({_id: result._id}, (err2, result2) => {
        if (err2) {
          res.send({success: false, error: err2})
        } else {
          console.log("no of friends: ", result2.friends.length)
          if (result2.friends.length == 0) {
            res.send({success: false, error: "NO_FRIEND_FOUND"})
          } else {
            result2.friends.forEach(friend => {
              // console.log("friend: ", friend)
              User.findOne({_id: friend}, {name: 1, _id: 1}, (err3, result3) => {
                if (err3) {
                  res.send({success: false, error: err3})
                } else {
                  // console.log("result3: ", result3)
                  shareFriends.push(result3)
                  // res.send({success: true, data: result3})
                  // console.log("shareFriends: ", shareFriends)
                  if (result2.friends.length == shareFriends.length) {
                    // console.log("shareFriends: ", shareFriends)
                    res.send({success: true, shareFriends: shareFriends})
                  }
                }
              })
              // console.log("shareFriends.length: ", shareFriends.length)
              
            })
          }
        }
      })
    }
  })
})


module.exports = router;
