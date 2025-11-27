const nodemailer = require('nodemailer');

// إعداد الناقل باستخدام Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD
  }
});

// دالة الإرسال العامة
const sendEmail = async (to, subject, htmlContent) => {
  try {
    const info = await transporter.sendMail({
      from: `"EShop Team" <${process.env.SMTP_EMAIL}>`,
      to: to,
      subject: subject,
      html: htmlContent,
    });
    console.log('📧 Email sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return false;
  }
};

// 1. إيميل التحقق (Verification Email)
exports.sendVerificationEmail = async (user, token) => {
  const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${token}`;

  const subject = 'تفعيل حسابك في EShop 🔒';
  const html = `
    <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; text-align: center;">
      <h2 style="color: #4F46E5;">تفعيل الحساب</h2>
      <p>مرحباً ${user.name}،</p>
      <p>لإكمال التسجيل والبدء في التسوق، يرجى تأكيد بريدك الإلكتروني بالضغط على الزر أدناه:</p>
      <a href="${verificationUrl}" style="background-color: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0;">تفعيل الحساب</a>
      <p style="color: #888; font-size: 12px;">أو انسخ الرابط التالي: ${verificationUrl}</p>
    </div>
  `;
  return sendEmail(user.email, subject, html);
};

// 2. إيميل الترحيب (Welcome Email)
exports.sendWelcomeEmail = async (user) => {
  const subject = 'مرحباً بك في عائلة EShop! 🚀';
  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <div style="text-align: center; padding-bottom: 20px;">
        <h1 style="color: #4F46E5;">EShop</h1>
      </div>
      <h2 style="color: #333;">أهلاً ${user.name}،</h2>
      <p style="color: #555; line-height: 1.6;">
        شكراً لتسجيلك معنا. نحن سعداء جداً بانضمامك إلينا. حسابك جاهز الآن ويمكنك البدء في استكشاف أفضل العروض.
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.CLIENT_URL}" style="background-color: #4F46E5; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">تصفح المتجر</a>
      </div>
    </div>
  `;
  return sendEmail(user.email, subject, html);
};

// 3. إيميل تأكيد الطلب
exports.sendOrderConfirmationEmail = async (user, order, addressText) => {
  const subject = `تم استلام طلبك #${order.id} ✅`;
  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #10B981;">شكراً لطلبك!</h2>
      <p style="color: #555;">مرحباً ${user.name}، تم استلام طلبك بنجاح وهو قيد المعالجة حالياً.</p>

      <div style="background-color: #f9fafb; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #333;">تفاصيل الطلب #${order.id}</h3>
        <p><strong>المبلغ الإجمالي:</strong> ${order.total_price} ر.س</p>
        <p><strong>تاريخ الطلب:</strong> ${new Date(order.created_at).toLocaleDateString('ar-SA')}</p>
        <p><strong>عنوان الشحن:</strong> ${addressText}</p>
      </div>
    </div>
  `;
  return sendEmail(user.email, subject, html);
};

// 4. إيميل استعادة كلمة المرور (OTP) - الجديد
exports.sendPasswordResetEmail = async (user, resetToken) => {
  const subject = 'استعادة كلمة المرور - EShop 🔒';
  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; text-align: center;">
      <h2 style="color: #DC2626;">استعادة كلمة المرور</h2>
      <p>مرحباً ${user.name}،</p>
      <p>لقد تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك. استخدم الكود التالي لإكمال العملية:</p>

      <div style="background-color: #F3F4F6; padding: 15px; border-radius: 8px; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0; color: #333;">
        ${resetToken}
      </div>

      <p style="color: #666; font-size: 14px;">صلاحية هذا الكود 10 دقائق فقط.</p>
      <p style="color: #888; font-size: 12px;">إذا لم تطلب هذا التغيير، يرجى تجاهل هذه الرسالة.</p>
    </div>
  `;
  return sendEmail(user.email, subject, html);
};