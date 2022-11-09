require('dotenv').config()
const nodemailer = require('nodemailer')
const Settings = require('./agentLogic/settings')
const Util = require('./util')

let currentSMTP = {}

async function emailService() {
  currentSMTP = await Settings.getSMTP()

  const decryptedPassword = Util.decrypt(
    currentSMTP.dataValues.value.auth.pass,
    currentSMTP.dataValues.value.IV,
  )

  const transporter = nodemailer.createTransport({
    host: currentSMTP.dataValues.value.host,
    // (eldersonar) We enforce port 587 for TLS connection
    port:
      currentSMTP.dataValues.value.port === 587
        ? currentSMTP.dataValues.value.port
        : 587,
    // (eldersonar) We enforce TLS connection. False for TLS
    secure: currentSMTP.dataValues.value.encryption === 'tls' ? false : false,
    auth: {
      user: currentSMTP.dataValues.value.auth.mailUsername
        ? currentSMTP.dataValues.value.auth.mailUsername
        : currentSMTP.dataValues.value.auth.email,
      pass: decryptedPassword,
    },
    tls: {
      // (eldersonar) Change to "false" to not fail on invalid certs
      rejectUnauthorized: true,
    },
  })

  return transporter
}

const sendMail = async (message) => {
  const transporter = await emailService()

  return new Promise((resolve, reject) => {
    transporter.sendMail(message, (error, info) => {
      if (error) {
        console.log('Error occurred')
        console.log(error.message)
        reject('error')
      } else {
        console.log('Message sent successfully!')
        console.log(nodemailer.getTestMessageUrl(info))
        resolve(true)
      }
      // Only needed when using pooled connections
      transporter.close()
    })
  })
}

module.exports = {
  emailService,
  sendMail,
}

// These show the capabilities of an email message

// Message object
// let message = {
//     // Comma separated list of recipients
//     to: 'Nodemailer <example@nodemailer.com>',

//     // Subject of the message
//     subject: 'Nodemailer is unicode friendly ✔' + Date.now(),

//     // plaintext body
//     text: 'Hello to myself!',

//     // HTML body
//     html: `<p><b>Hello</b> to myself <img src="cid:note@example.com"/></p>
//     <p>Here's a nyan cat for you as an embedded attachment:<br/><img src="cid:nyan@example.com"/></p>`,

//     // AMP4EMAIL
//     amp: `<!doctype html>
//     <html ⚡4email>
//       <head>
//         <meta charset="utf-8">
//         <style amp4email-boilerplate>body{visibility:hidden}</style>
//         <script async src="https://cdn.ampproject.org/v0.js"></script>
//         <script async custom-element="amp-anim" src="https://cdn.ampproject.org/v0/amp-anim-0.1.js"></script>
//       </head>
//       <body>
//         <p><b>Hello</b> to myself <amp-img src="https://cldup.com/P0b1bUmEet.png" width="16" height="16"/></p>
//         <p>No embedded image attachments in AMP, so here's a linked nyan cat instead:<br/>
//           <amp-anim src="https://cldup.com/D72zpdwI-i.gif" width="500" height="350"/></p>
//       </body>
//     </html>`,

//     // An array of attachments
//     attachments: [
//         // String attachment
//         {
//             filename: 'notes.txt',
//             content: 'Some notes about this e-mail',
//             contentType: 'text/plain' // optional, would be detected from the filename
//         },

//         // Binary Buffer attachment
//         {
//             filename: 'image.png',
//             content: Buffer.from(
//                 'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQAQMAAAAlPW0iAAAABlBMVEUAAAD/' +
//                     '//+l2Z/dAAAAM0lEQVR4nGP4/5/h/1+G/58ZDrAz3D/McH8yw83NDDeNGe4U' +
//                     'g9C9zwz3gVLMDA/A6P9/AFGGFyjOXZtQAAAAAElFTkSuQmCC',
//                 'base64'
//             ),

//             cid: 'note@example.com' // should be as unique as possible
//         },

//         // File Stream attachment
//         {
//             filename: 'nyan cat ✔.gif',
//             path: __dirname + '/assets/nyan.gif',
//             cid: 'nyan@example.com' // should be as unique as possible
//         }
//     ],

//     list: {
//         // List-Help: <mailto:admin@example.com?subject=help>
//         help: 'admin@example.com?subject=help',

//         // List-Unsubscribe: <http://example.com> (Comment)
//         unsubscribe: [
//             {
//                 url: 'http://example.com/unsubscribe',
//                 comment: 'A short note about this url'
//             },
//             'unsubscribe@example.com'
//         ],

//         // List-ID: "comment" <example.com>
//         id: {
//             url: 'mylist.example.com',
//             comment: 'This is my awesome list'
//         }
//     }
// }
