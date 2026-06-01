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
      <p style="font-size:16px;color:#333">感谢你的注册！请复制下方链接到浏览器地址栏打开以验证你的邮箱：</p>
      <div style="margin:16px 0;padding:12px 16px;background:#f5f5f4;border-radius:8px;border:1px solid #e7e5e4">
        <p style="font-size:13px;color:#1c1917;word-break:break-all;margin:0;font-family:monospace">${verifyUrl}</p>
      </div>
      <p style="font-size:14px;color:#333;margin-top:16px">📋 <strong>操作步骤：</strong>复制上面的链接 → 打开浏览器 → 粘贴到地址栏 → 回车</p>
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
