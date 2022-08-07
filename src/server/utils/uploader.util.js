import multer from "multer";

const memoryStorage = multer.memoryStorage({
  destination: function (req, file, cb) {
    cb(null, __dirname + "/upload");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const uploader = multer({
  storage: memoryStorage,
  fileFilter: function (req, file, callback) {
    callback(null, true);
  },
});

export default uploader;
