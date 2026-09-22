const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'rsscwe4n',
  api_key: process.env.CLOUDINARY_API_KEY || '314274751836185',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'Ykz_lV7eTWZ0viQgzo8Cp-hg1JE',
  secure: true
});

module.exports = cloudinary;
