export function slugify(text: string): string {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .normalize('NFD') // Tách dấu
        .replace(/[\u0300-\u036f]/g, '') // Xóa dấu
        .replace(/[đĐ]/g, 'd')
        .replace(/[^a-z0-9 -]/g, '') // Xóa ký tự lạ
        .replace(/\s+/g, '-') // Thay khoảng trắng bằng -
        .replace(/-+/g, '-'); // Xóa --
}
