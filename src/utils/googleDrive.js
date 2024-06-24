const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const CLIENT_ID = 'YOUR_CLIENT_ID';
const CLIENT_SECRET = 'YOUR_CLIENT_SECRET';
const REDIRECT_URI = 'YOUR_REDIRECT_URI';
const REFRESH_TOKEN = 'YOUR_REFRESH_TOKEN';

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const drive = google.drive({
  version: 'v3',
  auth: oauth2Client
});

const uploadFile = async (filePath) => {
  try {
    const response = await drive.files.create({
      requestBody: {
        name: path.basename(filePath),
        mimeType: 'application/pdf',
      },
      media: {
        mimeType: 'application/pdf',
        body: fs.createReadStream(filePath),
      },
    });

    return response.data;
  } catch (error) {
    console.log('Error uploading file:', error.message);
    throw error;
  }
};

const deleteFile = async (fileId) => {
  try {
    await drive.files.delete({
      fileId,
    });
  } catch (error) {
    console.log('Error deleting file:', error.message);
    throw error;
  }
};

const getFile = async (fileId) => {
  try {
    const response = await drive.files.get({
      fileId,
      alt: 'media',
    }, { responseType: 'stream' });

    return response.data;
  } catch (error) {
    console.log('Error getting file:', error.message);
    throw error;
  }
};

module.exports = { uploadFile, deleteFile, getFile };
