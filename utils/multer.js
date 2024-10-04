const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Set storage for Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';

    // Check if the directory exists
    fs.access(uploadDir, (error) => {
      if (error) {
        // Directory does not exist, create it
        fs.mkdir(uploadDir, { recursive: true }, (err) => {
          if (err) {
            return cb(err); // Pass the error to the callback
          }
          cb(null, uploadDir); // If successful, pass the directory to the callback
        });
      } else {
        // Directory exists
        cb(null, uploadDir);
      }
    });
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

// Initialize upload
const upload = multer({ storage: storage });

module.exports = upload;
