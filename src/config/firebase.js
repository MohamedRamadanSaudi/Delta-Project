const admin = require('firebase-admin');
const serviceAccount = require('./firebaseServiceAccount.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://delta-project-delta.firebaseio.com"
});

module.exports = admin;