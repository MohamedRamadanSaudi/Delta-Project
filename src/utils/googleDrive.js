const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Decode the Base64 encoded service account credentials
const GOOGLE_DRIVE_API_KEY = JSON.parse(Buffer.from(process.env.GOOGLE_DRIVE_API_KEY, 'base64').toString('utf8'));

const SCOPES = ['https://www.googleapis.com/auth/drive'];
async function authorize() {
  const jwtClient = new google.auth.JWT(
    GOOGLE_DRIVE_API_KEY.client_email,
    null,
    GOOGLE_DRIVE_API_KEY.private_key,
    SCOPES
  );

  await jwtClient.authorize();

  return jwtClient;
}

const uploadFile = async (filePath) => {
  try {
    const authClient = await authorize();
    const drive = google.drive({ version: 'v3', auth: authClient });

    const fileMetaData = {
      name: path.basename(filePath),
      parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
    };

    const media = {
      mimeType: 'application/pdf',
      body: fs.createReadStream(filePath),
    };

    const response = await drive.files.create({
      resource: fileMetaData,
      media: media,
      fields: 'id',
    });

    return response.data;
  } catch (error) {
    console.log('Error uploading file:', error.message);
    throw error;
  }
};

const deleteFile = async (fileId) => {
  const authClient = await authorize();
  const drive = google.drive({ version: 'v3', auth: authClient });

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
  const authClient = await authorize();
  const drive = google.drive({ version: 'v3', auth: authClient });

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
