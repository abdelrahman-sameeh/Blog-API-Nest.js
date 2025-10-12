import * as fs from "fs"
import { extname } from "path";



export function getDestinationByMimeType(req, file, cb) {
  let folder = 'uploads/others';

  if (file.mimetype.startsWith('image/')) {
    folder = 'uploads/images';
  } else if (file.mimetype.startsWith('video/')) {
    folder = 'uploads/videos';
  }

  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
  }

  cb(null, folder);
}

export function generateUniqueFilename(req, file, cb) {
  const uniqueSuffix = Date.now() + '_' + Math.round(Math.random() * 1e9);
  const ext = extname(file.originalname);
  let filename = file.originalname.split(ext)[0]
  filename = filename
    .replace(/[^a-zA-Z0-9_ ]/g, '')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')   
    .toLowerCase();
  filename += `_${uniqueSuffix}${ext}`;
  cb(null, filename)
}