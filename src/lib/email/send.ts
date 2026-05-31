import nodemailer from "nodemailer";

// 创建邮件传输器（复用连接）
let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || "smtp.gmail.com",
      port: parseInt(process.env.EMAIL_PORT || "587", 10),
      secure: false, // 587 端口用 STARTTLS
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
  return transporter;
}

interface SendVerificationEmailParams {
  to: string;
  token: string;
  appUrl: string;
}

export async function sendVerificationEmail({
  to,
  token,
  appUrl,
}: SendVerificationEmailParams): Promise<void> {
  const verifyUrl = `${appUrl}/api/auth/verify?token=${token}`;

  const html = `
    <div style="max-width:480px;margin:0 auto;padding:24px;font-family:system-ui,-apple-system,sans-serif">
      <h2 style="color:#10b981;margin-bottom:16px">🧠 成长第二大脑</h2>
      <p style="font-size:16px;color:#333">感谢你的注册！请点击下方按钮验证你的邮箱地址：</p>
      <a href="${verifyUrl}" style="display:inline-block;padding:12px 24px;background:#10b981;color:#fff;border-radius:8px;text-decoration:none;font-size:14px;margin:16px 0">验证邮箱</a>
      <p style="font-size:12px;color:#999;margin-top:16px">或者复制以下链接到浏览器打开：</p>
      <p style="font-size:12px;color:#999;word-break:break-all">${verifyUrl}</p>
      <p style="font-size:12px;color:#999;margin-top:24px">此链接 10 分钟内有效。如果你没有注册此账号，请忽略此邮件。</p>
    </div>
  `;

  // 检查是否配置了 SMTP
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log("═══════════════════════════════════════════");
    console.log("📧 [DEV] 验证邮件（SMTP 未配置，仅打印）");
    console.log(`   收件人: ${to}`);
    console.log(`   验证链接: ${verifyUrl}`);
    console.log("═══════════════════════════════════════════");
    return;
  }

  const transport = getTransporter();
  await transport.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to,
    subject: "验证你的邮箱 — 成长第二大脑",
    html,
  });
}
