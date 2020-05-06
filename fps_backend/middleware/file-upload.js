const multer = require('multer');
const uuid = require('uuid/v1');

const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpg'
};

const fileUpload = multer({
  limits: 500000, /* the unit is byte */
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/images');
    },
    filename: (req, file, cb) => {
      const ext = MIME_TYPE_MAP[file.mimetype];
      cb(null, `${uuid() }.${ ext}`);
    }
  }),
  fileFilter: (req, file, cb) => {
    // Old ecma version allows the syntax: !!MIME_TYPE_MAP[file.mimetype]
    const isValid = Boolean(MIME_TYPE_MAP[file.mimetype]);
    let error = isValid ? null : new Error('Invalid mime type!');
    cb(error, isValid);
  }
});

module.exports = fileUpload;
