const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const Article = require("../models/articleModel");
const Admin = require("../models/adminModel");
const bcrypt = require("bcrypt");
const updateService = require("../service/updateService");
const { body, validationResult } = require("express-validator");
const saltRounds = 10;
//const mailService = require("../service/mailService");
const mailAdminService = require("../service/adminMailService")


router.post(
  "/register-admin",
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
    let authAdmin = JSON.parse(req.headers.authorization);
    jwt.verify(authAdmin, "CIS", (err3, result3) => {
      if (err3) {
         res.send(err3);
      } else {
        let createAdmin = req.body;
        const errors = validationResult(req);
        function alphanumericString(str) {
          return /[`\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/.test(str);
        }
        if (!errors.isEmpty()) {
          res.send({ success: false, error: errors });
        } else if (alphanumericString(createAdmin.name)) {
          // let obj = {
          //   value: createUser.name,
          //   msg: "Name should not contain number & special character",
          //   param: "name",
          //   location: "body",
          // };
          // errors.errors.push(obj);
          // res.send(errors.array());
          res.send({ success: false, message: "Only characters are allowed" });
        } else {
          bcrypt.hash(createAdmin.password, saltRounds, (err, hash) => {
            if (err) {
              res.send({ success: false, error: err });
            } else {
              //let oneTimePassword = Math.floor(100000 + Math.random() * 900000);
              //console.log(typeof oneTimePassword, oneTimePassword);
              const newAdmin = new Admin({
                name: createAdmin.name,
                email: createAdmin.email,
                password: hash,
                //mobile: createUser.mobile,
                //token: userToken,
                //otp: oneTimePassword,
              });
              //console.log("newUser Data", newUser);
              newAdmin.save(function (err2, result2) {
                if (err2) {
                  res.send(err2);
                } else {
                  //console.log("newUser result", result2)
                  let mailAdminStatus = mailAdminService.sendMailAdmin(createAdmin);
                  //console.log("mailStatus", mailStatus);
                  //res.send({success: "true"})
                  console.log("newAdmin result", result2);
                  if (mailAdminStatus) {
                    res.send({
                      success: true,
                      message: "Registerd & Email Send",
                      mailInfo: mailAdminStatus,
                      data: result2,
                    });
                  } else {
                    res.send({
                      success: true,
                      message: "Registered But Email Not Send",
                      mailInfo: mailAdminStatus,
                      //status : result2.status,
                      data: result2,
                    });
                  }
                }
              });
            }
          });
        }
      }
    });
  }
);

module.exports = router;
