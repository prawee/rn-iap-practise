const functions = require("firebase-functions");

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions

// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send({hello: "hello", you: request.query.text});
// });

exports.validateIOS = functions.https.onCall((d)=> {
  const data = JSON.stringify({
    "receipt-data": d["receipt-data"],
    "password": d.password,
    "exclude-old-transactions": true,
  });
  console.log(data);
});
