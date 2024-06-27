// const { google } = require('googleapis');
// const fs = require('fs');
// const path = require('path');
// require('dotenv').config();

// // Decode the Base64 encoded service account credentials
// const GOOGLE_DRIVE_ACCOUNT = JSON.parse(Buffer.from(process.env.GOOGLE_DRIVE_ACCOUNT, 'base64').toString('utf8'));

// // Destructure and validate the necessary fields
// const { client_id, client_secret } = GOOGLE_DRIVE_ACCOUNT.web;
// if (!client_id || !client_secret) {
//   throw new Error("Invalid Google Drive service account configuration");
// }

// // Manually set the redirect URI
// const REDIRECT_URI = 'YOUR_REDIRECT_URI';  // Replace with your actual redirect URI

// const CLIENT_ID = client_id;
// const CLIENT_SECRET = client_secret;
// const REFRESH_TOKEN = process.env.GOOGLE_DRIVE_REFRESH_TOKEN;

// const oauth2Client = new google.auth.OAuth2(
//   CLIENT_ID,
//   CLIENT_SECRET,
//   REDIRECT_URI
// );

// oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

// const drive = google.drive({
//   version: 'v3',
//   auth: oauth2Client
// });

// const uploadFile = async (filePath) => {
//   try {
//     const response = await drive.files.create({
//       requestBody: {
//         name: path.basename(filePath),
//         mimeType: 'application/pdf',
//       },
//       media: {
//         mimeType: 'application/pdf',
//         body: fs.createReadStream(filePath),
//       },
//     });

//     return response.data;
//   } catch (error) {
//     console.log('Error uploading file:', error.message);
//     throw error;
//   }
// };

// const deleteFile = async (fileId) => {
//   try {
//     await drive.files.delete({
//       fileId,
//     });
//   } catch (error) {
//     console.log('Error deleting file:', error.message);
//     throw error;
//   }
// };

// const getFile = async (fileId) => {
//   try {
//     const response = await drive.files.get({
//       fileId,
//       alt: 'media',
//     }, { responseType: 'stream' });

//     return response.data;
//   } catch (error) {
//     console.log('Error getting file:', error.message);
//     throw error;
//   }
// };

// module.exports = { uploadFile, deleteFile, getFile };
