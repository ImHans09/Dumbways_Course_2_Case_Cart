import multer from "multer";
import path from "node:path";
import fs from "node:fs";

const uploadPath = path.join(process.cwd(), "public", "uploads");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
  }
});
const MAX_SIZE = 2 * 1024 * 1024;
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: MAX_SIZE,
  },
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/jpg"];

    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Only .jpeg, .jpg and .png files are allowed"));
    }

    cb(null, true);
  },
});