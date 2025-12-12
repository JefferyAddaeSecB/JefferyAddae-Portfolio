/// <reference types="node" />
import * as nodemailer from "nodemailer"
import dotenv from "dotenv"
dotenv.config()

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      EMAIL_USER?: string
      EMAIL_PASSWORD?: string
      NODE_ENV?: string
      PORT?: string
      ADMIN_EMAIL?: string
      FROM_EMAIL?: string
    }
  }
}

interface EmailError {
  code: string
  command: string
  response: string
  responseCode: number
  message: string
}

let transporter: nodemailer.Transporter | null = null

const createTransporter = (): nodemailer.Transporter | null => {
  const emailUser = process.env.EMAIL_USER
  const emailPass = process.env.EMAIL_PASSWORD

  console.log("[Email Debug] Creating transporter with:", { emailUser, hasPassword: !!emailPass })

  if (!emailUser || !emailPass) {
    console.warn("[Email Debug] Missing EMAIL_USER or EMAIL_PASSWORD - SMTP disabled")
    return null
  }

  try {
    // Build explicit SMTP options (prefer env vars, fallback to Gmail)
    const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
    const portEnv = process.env.EMAIL_PORT;
    const secureEnv = process.env.EMAIL_SECURE;
    const secure = secureEnv ? secureEnv === 'true' : false; // default to false (STARTTLS on 587)
    const port = portEnv ? Number(portEnv) : (secure ? 465 : 587);

    const connectionTimeout = Number(process.env.EMAIL_CONNECTION_TIMEOUT || '15000');
    const greetingTimeout = Number(process.env.EMAIL_GREETING_TIMEOUT || '15000');
    const socketTimeout = Number(process.env.EMAIL_SOCKET_TIMEOUT || '15000');

    const transporterLocal = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user: emailUser,
        pass: emailPass,
      },
      connectionTimeout,
      greetingTimeout,
      socketTimeout,
      tls: {
        // In production keep rejectUnauthorized true; can be toggled if necessary via env
        rejectUnauthorized: process.env.EMAIL_TLS_REJECT_UNAUTHORIZED !== 'false',
      },
    });

    console.log('[Email Debug] Transporter created successfully', { host, port, secure, connectionTimeout, greetingTimeout, socketTimeout });

    // Verify SMTP connectivity asynchronously and log result
    transporterLocal.verify()
      .then(() => console.log('[Email Debug] SMTP verify: connection OK'))
      .catch((err) => console.error('[Email Debug] SMTP verify failed:', err));

    return transporterLocal;
  } catch (err) {
    console.error("[Email Debug] Error creating transporter:", err)
    return null
  }
}

const getTransporter = () => {
  if (transporter === null) {
    transporter = createTransporter()
  }
  return transporter
}

// Create an alternate transporter (commonly port 465 + secure) for fallback attempts
const createAltTransporter = (emailUser: string, emailPass: string) => {
  try {
    const host = process.env.EMAIL_HOST || 'smtp.gmail.com'
    const port = Number(process.env.EMAIL_ALT_PORT || '465')
    const secure = true

    const connectionTimeout = Number(process.env.EMAIL_CONNECTION_TIMEOUT || '30000')
    const greetingTimeout = Number(process.env.EMAIL_GREETING_TIMEOUT || '30000')
    const socketTimeout = Number(process.env.EMAIL_SOCKET_TIMEOUT || '30000')

    const alt = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user: emailUser, pass: emailPass },
      connectionTimeout,
      greetingTimeout,
      socketTimeout,
      tls: { rejectUnauthorized: process.env.EMAIL_TLS_REJECT_UNAUTHORIZED !== 'false' },
    })

    alt.verify()
      .then(() => console.log('[Email Debug] Alt SMTP verify: connection OK'))
      .catch((err) => console.error('[Email Debug] Alt SMTP verify failed:', err))

    return alt
  } catch (err) {
    console.error('[Email Debug] Error creating alt transporter:', err)
    return null
  }
}

// Try to send using the given transporter; on certain network errors attempt a single fallback using port 465/secure
const sendWithFallback = async (transporterLocal: nodemailer.Transporter, mailOptions: any) => {
  try {
    return await transporterLocal.sendMail(mailOptions as any)
  } catch (err) {
    console.error('[Email Debug] sendMail error, checking fallback possibility:', err)
    const e = err as any
    const shouldFallback = e && (e.code === 'ETIMEDOUT' || e.code === 'ECONNREFUSED' || e.command === 'CONN')
    if (!shouldFallback) throw err

    const emailUser = process.env.EMAIL_USER
    const emailPass = process.env.EMAIL_PASSWORD
    if (!emailUser || !emailPass) throw err

    console.log('[Email Debug] Attempting fallback SMTP (secure port 465)')
    const alt = createAltTransporter(emailUser, emailPass)
    if (!alt) throw err

    try {
      const altInfo = await alt.sendMail(mailOptions as any)
      console.log('[Email Debug] Fallback sendMail succeeded', { messageId: (altInfo as any).messageId, accepted: (altInfo as any).accepted, rejected: (altInfo as any).rejected })
      return altInfo
    } catch (err2) {
      console.error('[Email Debug] Fallback sendMail failed:', err2)
      throw err2
    }
  }
}

// SendGrid removed: project uses Nodemailer (SMTP) only

const validateEmail = (email: string): boolean => {
  return Boolean(email && email.includes("@") && email.includes("."))
}

const ensureEmailConfig = () => {
  const from = process.env.FROM_EMAIL || process.env.EMAIL_USER;
  const admin = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;

  if (!from || !validateEmail(from)) {
    throw new Error("Email sender not configured. Set EMAIL_USER (and EMAIL_PASSWORD) to a valid email address.");
  }
  if (!admin || !validateEmail(admin)) {
    throw new Error("Admin email not configured. Set ADMIN_EMAIL or EMAIL_USER to a valid email address.");
  }

  return { from, admin };
};

const emailTemplate = (data: { name: string; email: string; subject: string; message: string }, isReply = false) => {
  const { name, email, subject, message } = data
  const logoUrl = "https://i.ibb.co/xtLj3nB3/photo-2025-11-04-23-34-45.jpg"
  const heroImage = "https://images.unsplash.com/photo-1557821552-17105176677c?w=600&h=300&fit=crop" // Professional tech background
  const year = new Date().getFullYear()

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>${isReply ? "Reply from DELLYKNOWSTECH" : "New Contact Form Message"}</title>
        <link href="https://fonts.googleapis.com/css?family=Inter:400,500,600,700&display=swap" rel="stylesheet">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            background: linear-gradient(135deg, #f0f4f8 0%, #f9fafb 100%);
            margin: 0;
            padding: 20px;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            color: #1a202c;
          }
          .email-wrapper {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 16px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
            overflow: hidden;
          }
          .hero-section {
            background: linear-gradient(135deg, #1a202c 0%, #2d3748 100%);
            position: relative;
            overflow: hidden;
            height: 280px;
            display: flex;
            align-items: flex-end;
            padding: 0;
          }
          .hero-section::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('${heroImage}') center/cover;
            opacity: 0.25;
            z-index: 1;
          }
          .hero-content {
            position: relative;
            z-index: 2;
            width: 100%;
            padding: 48px 32px 32px;
            text-align: center;
          }
          .profile-badge {
            width: 100px;
            height: 100px;
            margin: 0 auto 16px;
            border-radius: 16px;
            border: 4px solid #ffffff;
            background: #ffffff;
            object-fit: cover;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
            display: block;
          }
          .hero-title {
            font-size: 1.875rem;
            font-weight: 700;
            margin: 16px 0 8px 0;
            color: #ffffff;
            letter-spacing: -0.5px;
            line-height: 1.2;
          }
          .hero-subtitle {
            font-size: 0.95rem;
            color: #cbd5e1;
            margin: 0;
            font-weight: 500;
            letter-spacing: 0.3px;
          }
          .content-section {
            padding: 48px 32px;
          }
          .greeting {
            font-size: 1.1rem;
            margin: 0 0 24px 0;
            color: #1a202c;
            font-weight: 600;
            line-height: 1.4;
          }
          .promo-banner {
            background: linear-gradient(135deg, #fef3c7 0%, #fef08a 100%);
            border: 1px solid #fcd34d;
            border-radius: 12px;
            padding: 24px;
            margin: 32px 0;
            text-align: center;
          }
          .promo-banner img {
            width: 100%;
            max-height: 180px;
            border-radius: 8px;
            margin-bottom: 16px;
            display: block;
            object-fit: cover;
          }
          .promo-label {
            font-size: 0.8rem;
            font-weight: 700;
            color: #d97706;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 8px;
            display: block;
          }
          .promo-title {
            font-size: 1rem;
            font-weight: 600;
            color: #1a202c;
            margin: 8px 0;
          }
          .promo-subtitle {
            font-size: 0.9rem;
            color: #64748b;
            margin: 8px 0 16px 0;
          }
          .message-container {
            background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
            border: 1px solid #dcfce7;
            border-radius: 12px;
            padding: 28px;
            margin: 24px 0;
          }
          .message-header {
            font-weight: 700;
            color: #1a202c;
            font-size: 0.85rem;
            margin: 0 0 12px 0;
            text-transform: uppercase;
            letter-spacing: 0.6px;
            display: block;
          }
          .message-text {
            font-size: 0.95rem;
            line-height: 1.7;
            color: #475569;
            white-space: pre-line;
            margin: 0;
            font-weight: 500;
          }
          .info-box {
            background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
            border: 1px solid #dcfce7;
            border-radius: 12px;
            padding: 20px 24px;
            margin-top: 24px;
            font-size: 0.9rem;
            color: #166534;
          }
          .info-label {
            font-weight: 700;
            display: block;
            margin-bottom: 4px;
          }
          .divider {
            height: 1px;
            background: linear-gradient(to right, transparent, #e2e8f0, transparent);
            margin: 20px 0;
          }
          .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #1a202c 0%, #2d3748 100%);
            color: #ffffff;
            padding: 12px 32px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            font-size: 0.95rem;
            margin: 24px 0;
            transition: all 0.3s ease;
          }
          .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(26, 32, 44, 0.3);
          }
          .footer-section {
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            border-top: 1px solid #e2e8f0;
            padding: 32px;
            text-align: center;
          }
          .footer-text {
            color: #64748b;
            font-size: 0.85rem;
            line-height: 1.6;
            margin: 0 0 16px 0;
          }
          .social-links {
            margin: 16px 0 0 0;
            font-size: 0.85rem;
          }
          .social-links a {
            color: #1a202c;
            text-decoration: none;
            margin: 0 12px;
            font-weight: 500;
            transition: color 0.3s ease;
          }
          .social-links a:hover {
            color: #7c3aed;
          }
          @media (max-width: 600px) {
            .email-wrapper {
              border-radius: 8px;
              margin: 0;
            }
            .hero-section {
              height: 240px;
            }
            .hero-content {
              padding: 32px 20px 24px;
            }
            .profile-badge {
              width: 80px;
              height: 80px;
            }
            .hero-title {
              font-size: 1.5rem;
            }
            .content-section {
              padding: 32px 20px;
            }
            .message-container {
              padding: 20px;
            }
            .promo-banner {
              padding: 16px;
              margin: 20px 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="email-wrapper">
          <!-- Hero Section -->
          <div class="hero-section">
            <div class="hero-content">
              <img src="${logoUrl}" alt="DELLYKNOWSTECH" class="profile-badge" />
              <h1 class="hero-title">DELLYKNOWSTECH</h1>
              <p class="hero-subtitle">Know Tech . Grow Smart</p>
            </div>
          </div>

          <!-- Main Content -->
          <div class="content-section">
            <p class="greeting">${isReply ? `Hello ${name},` : "You have a new message!"}</p>

            <!-- Message Content -->
            <div class="message-container">
              <span class="message-header">Subject</span>
              <p class="message-text">${subject.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
              <div class="divider"></div>
              <span class="message-header">Your Message</span>
              <p class="message-text">${message.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
            </div>

            <!-- Contact Info -->
            <div class="info-box">
              <span class="info-label">From</span>
              ${name} &lt;${email}&gt;
            </div>
          </div>

          <!-- Footer -->
          <div class="footer-section">
            <p class="footer-text">
              &copy; ${year} DELLYKNOWSTECH. All rights reserved.<br>
              <span style="color: #94a3b8; font-size: 0.8rem;">Know Tech . Grow Smart</span>
            </p>
            <div class="social-links">
              <a href="https://www.youtube.com/@dellyknowstech">YouTube</a>
              <a href="https://github.com/JefferyAddaeSecB">GitHub</a>
              <a href="https://www.linkedin.com/in/jeffery-addae-297214398/">LinkedIn</a>
            </div>
          </div>
        </div>
      </body>
    </html>
  `
}

const replyTemplate = (data: { name: string; email: string }) => {
  const logoUrl = "https://i.ibb.co/xtLj3nB3/photo-2025-11-04-23-34-45.jpg"
  const heroImage = "https://images.unsplash.com/photo-1557821552-17105176677c?w=600&h=300&fit=crop"
  const flyerImage =
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Blue%20and%20White%20Modern%20Website%20Development%20Facebook%20Post-lsEUFEbXFazXowcHL2u719ZW9zEA7d.png" // Added flyer image URL
  const year = new Date().getFullYear()

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>Thank you for contacting DELLYKNOWSTECH</title>
        <link href="https://fonts.googleapis.com/css?family=Inter:400,500,600,700&display=swap" rel="stylesheet">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            background: linear-gradient(135deg, #f0f4f8 0%, #f9fafb 100%);
            margin: 0;
            padding: 20px;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            color: #1a202c;
          }
          .email-wrapper {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 16px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
            overflow: hidden;
          }
          .hero-section {
            background: linear-gradient(135deg, #1a202c 0%, #2d3748 100%);
            position: relative;
            overflow: hidden;
            height: 280px;
            display: flex;
            align-items: flex-end;
            padding: 0;
          }
          .hero-section::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('${heroImage}') center/cover;
            opacity: 0.25;
            z-index: 1;
          }
          .hero-content {
            position: relative;
            z-index: 2;
            width: 100%;
            padding: 48px 32px 32px;
            text-align: center;
          }
          .profile-badge {
            width: 100px;
            height: 100px;
            margin: 0 auto 16px;
            border-radius: 16px;
            border: 4px solid #ffffff;
            background: #ffffff;
            object-fit: cover;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
            display: block;
          }
          .hero-title {
            font-size: 1.875rem;
            font-weight: 700;
            margin: 16px 0 8px 0;
            color: #ffffff;
            letter-spacing: -0.5px;
            line-height: 1.2;
          }
          .hero-subtitle {
            font-size: 0.95rem;
            color: #cbd5e1;
            margin: 0;
            font-weight: 500;
            letter-spacing: 0.3px;
          }
          .content-section {
            padding: 48px 32px;
          }
          .greeting {
            font-size: 1.1rem;
            margin: 0 0 24px 0;
            color: #1a202c;
            font-weight: 600;
            line-height: 1.4;
          }
          .promo-banner {
            background: linear-gradient(135deg, #eff6ff 0%, #f0f9ff 100%);
            border: 2px solid #3b82f6;
            border-radius: 12px;
            padding: 24px;
            margin: 32px 0;
            text-align: center;
          }
          .promo-banner img {
            width: 100%;
            max-height: 280px;
            border-radius: 8px;
            margin-bottom: 16px;
            display: block;
            object-fit: cover;
            border: 1px solid #e5e7eb;
          }
          .promo-label {
            font-size: 0.8rem;
            font-weight: 700;
            color: #1e40af;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 8px;
            display: block;
          }
          .promo-title {
            font-size: 1.1rem;
            font-weight: 700;
            color: #1a202c;
            margin: 8px 0;
          }
          .promo-subtitle {
            font-size: 0.9rem;
            color: #64748b;
            margin: 8px 0 16px 0;
            line-height: 1.5;
          }
          .download-link {
            display: inline-block;
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            color: #ffffff;
            padding: 12px 32px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            font-size: 0.95rem;
            margin: 12px 8px 0 8px;
            transition: all 0.3s ease;
            border: none;
            cursor: pointer;
          }
          .download-link:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
          }
          .message-container {
            background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
            border: 1px solid #dcfce7;
            border-radius: 12px;
            padding: 28px;
            margin: 24px 0;
          }
          .message-text {
            font-size: 0.95rem;
            line-height: 1.7;
            color: #166534;
            margin: 0;
          }
          .message-text a {
            color: #15803d;
            font-weight: 600;
            text-decoration: none;
            transition: color 0.3s ease;
          }
          .message-text a:hover {
            color: #166534;
            text-decoration: underline;
          }
          .highlight {
            font-weight: 700;
            color: #1a202c;
          }
          .footer-section {
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            border-top: 1px solid #e2e8f0;
            padding: 32px;
            text-align: center;
          }
          .footer-text {
            color: #64748b;
            font-size: 0.85rem;
            line-height: 1.6;
            margin: 0 0 16px 0;
          }
          .social-links {
            margin: 16px 0 0 0;
            font-size: 0.85rem;
          }
          .social-links a {
            color: #1a202c;
            text-decoration: none;
            margin: 0 12px;
            font-weight: 500;
            transition: color 0.3s ease;
          }
          .social-links a:hover {
            color: #7c3aed;
          }
          @media (max-width: 600px) {
            .email-wrapper {
              border-radius: 8px;
              margin: 0;
            }
            .hero-section {
              height: 240px;
            }
            .hero-content {
              padding: 32px 20px 24px;
            }
            .profile-badge {
              width: 80px;
              height: 80px;
            }
            .hero-title {
              font-size: 1.5rem;
            }
            .content-section {
              padding: 32px 20px;
            }
            .message-container {
              padding: 20px;
            }
            .promo-banner {
              padding: 16px;
              margin: 20px 0;
            }
            .download-link {
              display: block;
              margin: 12px 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="email-wrapper">
          <!-- Hero Section -->
          <div class="hero-section">
            <div class="hero-content">
              <img src="${logoUrl}" alt="DELLYKNOWSTECH" class="profile-badge" />
              <h1 class="hero-title">DELLYKNOWSTECH</h1>
              <p class="hero-subtitle">Know Tech . Grow Smart</p>
            </div>
          </div>

          <!-- Main Content -->
          <div class="content-section">
            <p class="greeting">Hi ${data.name},</p>

            <div class="message-container">
              <p class="message-text">
                Thank you for reaching out! I've received your message and appreciate you taking the time to connect.<br><br>
                I'll get back to you as soon as possible with a thoughtful response.<br><br>
                In the meantime, feel free to explore my latest tech content on <a href="https://www.youtube.com/@dellyknowstech">YouTube</a> or check out my projects on <a href="https://github.com">GitHub</a>.<br><br>
                <span class="highlight">Best regards,<br>DELLYKNOWSTECH</span>
              </p>
            </div>

            <!-- Updated promotional banner with actual flyer image and download link -->
            <div class="promo-banner">
              <span class="promo-label">Discover Our Services</span>
              <img src="${flyerImage}" alt="DellyKnowsTech - Website Development Services" />
              <p class="promo-title">Professional Website Development</p>
              <p class="promo-subtitle">
                At DellyKnowsTech, we specialize in creating responsive, user-friendly, and visually engaging websites that drive results. From mobile responsiveness to fast, secure hosting and custom design — we've got you covered.
              </p>
              <a href="${flyerImage}" download="DellyKnowsTech-Services-Flyer.png" class="download-link">Download Flyer</a>
              <a href="https://www.youtube.com/@dellyknowstech" class="download-link" style="background: linear-gradient(135deg, #1a202c 0%, #2d3748 100%);">Subscribe on YouTube</a>
            </div>
          </div>

          <!-- Footer -->
          <div class="footer-section">
            <p class="footer-text">
              &copy; ${year} DELLYKNOWSTECH. All rights reserved.
            </p>
            <div class="social-links">
              <a href="https://www.youtube.com/@dellyknowstech">YouTube</a>
              <a href="https://github.com/JefferyAddaeSecB">GitHub</a>
              <a href="https://www.linkedin.com/in/jeffery-addae-297214398/">LinkedIn</a>
            </div>
          </div>
        </div>
      </body>
    </html>
  `
}

export const sendTestEmail = async () => {
  try {
    const { admin } = ensureEmailConfig();

    console.log("Sending test email to:", admin)

    // Nodemailer (SMTP) only
    const transporterLocal = getTransporter()
    if (!transporterLocal) {
      console.warn("[Email Debug] sendTestEmail skipped because transporter is not configured")
      return { success: false, emailSkipped: true } as const
    }

    const info = await sendWithFallback(transporterLocal, {
      from: {
        name: "Portfolio Contact Form",
        address: admin,
      },
      to: admin,
      subject: "Test Email from Portfolio",
      html: emailTemplate({
        name: "Test User",
        email: admin,
        subject: "Test Email",
        message:
          "This is a test email from your portfolio contact form. If you're receiving this, the email service is working correctly.",
      }),
    })

    console.log('[Email Debug] sendTestEmail sendMail info:', { messageId: (info as any).messageId, accepted: (info as any).accepted, rejected: (info as any).rejected })

    return { success: true, info: { messageId: (info as any).messageId, accepted: (info as any).accepted, rejected: (info as any).rejected } }
  } catch (error) {
    console.error("Error sending test email:", error)
    const emailError = error as EmailError
    return { success: false, emailError: emailError.response || emailError.message } as const
  }
}

export const sendContactEmail = async (data: { name: string; email: string; subject: string; message: string }) => {
  try {
    const { from, admin } = ensureEmailConfig();

    // Nodemailer-only: send via SMTP transport (with fallback)
    const transporterLocal = getTransporter()

    if (!transporterLocal) {
      console.warn("[Email Debug] sendContactEmail: transporter not available, skipping email sends")
      return { success: false, emailError: "Email transport not configured. Set EMAIL_USER and EMAIL_PASSWORD." } as const
    }

    const adminMailOptions = {
      from,
      to: admin,
      subject: data.subject,
      html: emailTemplate(data),
    }
    console.log("[Email Debug] Sending admin notification:", adminMailOptions)
    const adminInfo = await sendWithFallback(transporterLocal, adminMailOptions)
    console.log('[Email Debug] admin sendMail info:', { messageId: (adminInfo as any).messageId, accepted: (adminInfo as any).accepted, rejected: (adminInfo as any).rejected })

    const userMailOptions = {
      from,
      to: data.email,
      subject: "Thank you for contacting DELLYKNOWSTECH!",
      html: replyTemplate({ name: data.name, email: data.email }),
    }
    console.log('[Email Debug] Sending user feedback:', userMailOptions)
    const userInfo = await sendWithFallback(transporterLocal, userMailOptions)
    console.log('[Email Debug] user sendMail info:', { messageId: (userInfo as any).messageId, accepted: (userInfo as any).accepted, rejected: (userInfo as any).rejected })

    return { success: true, info: { admin: { messageId: (adminInfo as any).messageId, accepted: (adminInfo as any).accepted, rejected: (adminInfo as any).rejected }, user: { messageId: (userInfo as any).messageId, accepted: (userInfo as any).accepted, rejected: (userInfo as any).rejected } } }
  } catch (err) {
    console.error("[Email Debug] Error sending email:", err)
    console.error("[Email Debug] Continuing without failing the contact endpoint")
    return { success: false, emailError: err instanceof Error ? err.message : String(err) } as const
  }
}
