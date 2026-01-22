import * as z from 'zod';

const ContactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  subject: z.string().min(3),
  message: z.string().min(10),
});

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const parsed = ContactSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: 'Invalid request', errors: parsed.error.flatten() });
    }

    const { name, email, subject, message } = parsed.data;

    // Placeholder: integrate email service here (e.g., Nodemailer/Resend)
    console.log('Contact form submission:', { name, email, subject, message });

    return res.status(200).json({ ok: true, message: 'Message received. Thank you!' });
  } catch (err) {
    console.error('Contact API error:', err);
    return res.status(500).json({ message: 'Failed to submit message' });
  }
}
