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

const sendUpdateMailService = async function (user) {
  //let myUrl2 = path.join(__dirname, '../images/cis-image.jpeg')
  let myUrl = "https://vast-gray-bandicoot-tux.cyclic.app/user-create-password/" + user._id;
  console.log("myUrl value", myUrl)
  //console.log("user id", user._id)

  const mailOptions = {
    from: 'bmaihlele@gmail.com',
    to: user.email,
    subject: 'Angular Website Testing',
    html: `<div class="container">
      <p>Hello ${user.name},</p>
        <div class="m-5">
          </p>
            We are sending you this email because you requested for a password update. Click on this link to create new password.<br>
            <a href='${myUrl}'>Set a new password</a>
            or
            <p>Copy this link into your browser</p>
            <a href='${myUrl}'>${myUrl}</a>
          </p>
          <p>
            <img src="https://play-lh.googleusercontent.com/WaNZ6_cV1u8s1Z2juOYGFURAUvBYZCwwsOp0R7TtFzmreYP0pvLQMblPmzK5vMGQKhQ" alt="cis image">
          </p>

        </div>
        <div class="m-5">
          <p>
            If you did not intiate this request, please contact us immediately at
            <a href="mailto:bmaihlele@gmail.com">bmaihlele@gmail.com</a><br>

            Thank You,<br>
            The Blogger Team
          </p>
        </div>
      </div>`,
    attachments: [{
      filename: 'photp.jpeg',
      path: path.join(__dirname, '../images/blogger.png'),
      cid: 'photo@cis'
    }]


  }
  return await transporter.sendMail(mailOptions);
}

module.exports.sendUpdateMailService = sendUpdateMailService;

