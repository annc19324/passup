/**
 * Email validation regex
 */
export const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

/**
 * Phone validation: exactly 10 digits, starts with 0
 */
export const validatePhone = (phone: string): boolean => {
    const re = /^0\d{9}$/;
    return re.test(phone);
};

/**
 * Username validation: min 6 chars, alphanumeric and dot only, no spaces
 */
export const validateUsername = (username: string): boolean => {
    const re = /^[a-z0-9.]{6,}$/i; // 'i' flag for case-insensitive
    return re.test(username) && !username.includes(' ');
};

/**
 * Full name validation: min 2 chars, letters and spaces only, no numbers
 */
export const validateFullName = (name: string): boolean => {
    // Supports Vietnamese characters
    const re = /^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂẾưăạảấầẩẫậắằẳẵặẹẻẽềềểếỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪỬỮỰỲỴÝỶỸửữựỳỵỷỹ\s]{2,}$/;
    return re.test(name);
};

/**
 * Password validation: min 6 chars, uppercase, lowercase, number, special char
 */
export const validatePassword = (password: string): boolean => {
    const minLength = password.length >= 6;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    return minLength && hasUpper && hasLower && hasNumber && hasSpecial;
};

/**
 * General validator for Register Form
 */
export const validateRegister = (data: {
    fullName: string;
    email: string;
    username: string;
    phone: string;
    password: string;
}) => {
    if (!validateFullName(data.fullName)) return "Họ tên phải ít nhất 2 ký tự và không chứa số.";
    if (!validateEmail(data.email)) return "Email không đúng định dạng.";
    if (!validateUsername(data.username)) return "Username phải ít nhất 6 ký tự, chỉ gồm chữ, số, dấu chấm.";
    if (!validatePhone(data.phone)) return "Số điện thoại phải đúng 10 số và bắt đầu bằng số 0.";
    if (!validatePassword(data.password)) return "Mật khẩu ít nhất 6 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt.";
    return null;
};

/**
 * General validator for Login Form
 */
export const validateLogin = (identifier: string, pass: string) => {
    if (!identifier) return "Vui lòng nhập Email, Username hoặc Số điện thoại.";
    if (!pass) return "Vui lòng nhập mật khẩu.";
    return null;
};
