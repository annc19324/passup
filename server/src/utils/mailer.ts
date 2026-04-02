import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'annc19324@gmail.com',
        pass: 'okuw iaoe prun xzdx'
    }
});

export const sendOTP = async (email: string, otp: string) => {
    const mailOptions = {
        from: 'PassUp Support <annc19324@gmail.com>',
        to: email,
        subject: 'Mã xác thực quên mật khẩu - PassUp',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #f1f5f9; border-radius: 1.5rem; padding: 40px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);">
                <h1 style="color: #2563eb; font-size: 24px; font-weight: 900; margin-bottom: 20px;">PassUp</h1>
                <p style="color: #475569; font-size: 16px; line-height: 1.6;">Chào bạn,</p>
                <p style="color: #475569; font-size: 16px; line-height: 1.6;">Chúng tôi nhận được yêu cầu khôi phục mật khẩu cho tài khoản liên kết với email này. Dưới đây là mã xác thực của bạn:</p>
                <div style="background: #eff6ff; border: 2px dashed #3b82f6; border-radius: 1rem; padding: 20px; text-align: center; margin: 30px 0;">
                    <span style="font-size: 32px; font-weight: 900; color: #1e40af; letter-spacing: 5px;">${otp}</span>
                </div>
                <p style="color: #64748b; font-size: 14px; line-height: 1.6;">Mã này có hiệu lực trong vòng 5 phút. Nếu bạn không yêu cầu hành động này, vui lòng bỏ qua email này.</p>
                <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 30px 0;">
                <p style="color: #94a3b8; font-size: 12px; text-align: center;">© 2024 PassUp. Đồ cũ nhưng giá trị mới.</p>
            </div>
        `
    };

    return transporter.sendMail(mailOptions);
};
