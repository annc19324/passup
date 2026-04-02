import multer from 'multer';
import path from 'path';

// Cấu hình lưu trữ bộ nhớ đệm tạm thời cho Multer (không lưu ra ổ cứng server thật)
const storage = multer.memoryStorage();

// Cấu hình kiểm tra loại tệp tin (chỉ cho phép ảnh)
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg' && ext !== '.webp') {
        cb(new Error('Chỉ chấp nhận các file hình ảnh kích thước nhỏ (JPG, PNG, WEBP)') as any, false);
        return;
    }
    cb(null, true);
};

export const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // Giới hạn kích thước file 5MB mỗi ảnh
    },
    fileFilter: fileFilter
});
