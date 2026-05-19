const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const multer = require('multer');

const UPLOAD_ROOT = path.join(__dirname, '..', 'uploads');

if (!fs.existsSync(UPLOAD_ROOT)) {
  fs.mkdirSync(UPLOAD_ROOT, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_ROOT),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const id = crypto.randomBytes(16).toString('hex');
    cb(null, `${Date.now()}-${id}${ext}`);
  },
});

const fileFilter = (_req, file, cb) => {
  if (/^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image uploads are allowed'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

const publicUrlFor = (filename) => (filename ? `/uploads/${filename}` : null);

const removePhoto = (urlOrFilename) => {
  if (!urlOrFilename) return;
  const filename = path.basename(urlOrFilename);
  const fullPath = path.join(UPLOAD_ROOT, filename);
  fs.promises.unlink(fullPath).catch(() => {});
};

module.exports = {
  upload,
  publicUrlFor,
  removePhoto,
  UPLOAD_ROOT,
};
