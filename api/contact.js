// Vercel serverless function: receives a form submission and emails it via
// Resend. Deployed automatically from the /api folder alongside the Vite build.
//
// Required environment variables (set in the Vercel project settings):
//   RESEND_API_KEY    – your Resend API key
//   CONTACT_TO_EMAIL  – the inbox that should receive submissions
//   CONTACT_FROM_EMAIL (optional) – verified sender, e.g.
//     "Heartwood <noreply@heartwoodinvestments.ca>". Falls back to Resend's
//     shared test sender if unset.

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { name, email, company, phone, message, formType } = req.body || {}

  if (!email || !EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'A valid email is required.' })
  }

  const apiKey = process.env.RESEND_API_KEY
  const to = process.env.CONTACT_TO_EMAIL
  const from = process.env.CONTACT_FROM_EMAIL || 'Heartwood <onboarding@resend.dev>'

  if (!apiKey || !to) {
    return res.status(500).json({ error: 'Email service is not configured.' })
  }

  const label = formType === 'contact' ? 'Contact request' : 'Investor enquiry'
  const rows = [
    ['Name', name],
    ['Email', email],
    ['Company', company],
    ['Phone', phone],
    ['Message', message],
  ].filter(([, value]) => value)

  const html = `
    <h2 style="font-family:Arial,sans-serif">${label}</h2>
    <table style="font-family:Arial,sans-serif;border-collapse:collapse">
      ${rows
        .map(
          ([key, value]) =>
            `<tr><td style="padding:4px 12px 4px 0;vertical-align:top"><strong>${escapeHtml(
              key,
            )}</strong></td><td style="padding:4px 0">${escapeHtml(value)}</td></tr>`,
        )
        .join('')}
    </table>
  `

  try {
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: email,
        subject: `${label} — ${name || email}`,
        html,
      }),
    })

    if (!resp.ok) {
      const detail = await resp.text()
      console.error('Resend error:', resp.status, detail)
      return res.status(502).json({ error: 'Could not send your message. Please try again.' })
    }

    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('Contact handler error:', err)
    return res.status(500).json({ error: 'Something went wrong. Please try again.' })
  }
}
