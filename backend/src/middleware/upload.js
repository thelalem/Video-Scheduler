import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadDir= "uploads";

if (!fs.existsSync(uploadDir)){
    fs.mkdirSync (uploadDir);
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const filetypes = /mp4|mov|avi|mkv/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Error: File upload only supports the following video filetypes - ' + filetypes));
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
});

export default upload;
