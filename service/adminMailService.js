const path = require('path')
const nodemailer = require('nodemailer')

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 1;
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'bmaihlele@gmail.com',
    pass: 'kwjiouepbzkghozp'
  },
  tls: {
    rejectUnauthorized: false
  }
})

const sendMailAdmin = async function (user) {
  let myUrl2 = path.join(__dirname, '../images/cis-image.jpeg')
  
  const mailOptions = {
    from: 'cishourtheme@gmail.com',
    to: user.email,
    subject: 'CIS Hour Team',
    html: `<div class="container">
      <p>Hello ${user.name},</p>
        <div class="m-5">
          </p>
            You have successfully registered as a Admin in CIS Hour website.
            Username: ${user.email}<br>
            Password: ${user.password}
          </p>
          <p>
            <img src="https://play-lh.googleusercontent.com/WaNZ6_cV1u8s1Z2juOYGFURAUvBYZCwwsOp0R7TtFzmreYP0pvLQMblPmzK5vMGQKhQ" alt="cis image">
          </p>

        </div>
        <div class="m-5">
          <p>
            you are intiate by CIS Hour Team, For any query contact us
            <a href="mailto:bmaihlele@gmail.com">bmaihlele@gmail.com</a><br>

            Thank You,<br>
            The CIS Hour Team
          </p>
        </div>
      </div>`


  }
  return await transporter.sendMail(mailOptions);
}

module.exports.sendMailAdmin = sendMailAdmin;

