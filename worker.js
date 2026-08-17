export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    try {
      const { name, email, service, message } = await request.json();

      if (!name || !email || !service || !message) {
        return new Response(JSON.stringify({ error: 'Missing fields' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }

      const html = buildEmailHTML({ name, email, service, message });

      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'EndPC Form <onboarding@resend.dev>',
          to: 'kinanbourguiba7@gmail.com',
          subject: `📩 Nouveau message — ${service}`,
          html,
          reply_to: email,
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        return new Response(JSON.stringify({ error: err }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }
  },
};

function buildEmailHTML({ name, email, service, message }) {
  const now = new Date().toLocaleString('fr-MA', { timeZone: 'Africa/Casablanca' });

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#1C1B1F;font-family:'Segoe UI',system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#1C1B1F;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:#93000A;padding:32px 40px;border-radius:16px 16px 0 0;text-align:center;">
              <h1 style="margin:0;font-size:28px;font-weight:700;color:#FFDAD4;letter-spacing:-0.5px;">EndPC</h1>
              <p style="margin:8px 0 0;font-size:14px;color:#FFB3AE;opacity:0.8;">Nouveau message depuis le formulaire</p>
            </td>
          </tr>

          <!-- Service Badge -->
          <tr>
            <td style="background:#211F26;padding:24px 40px 0;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#554155;color:#FFD7F7;padding:6px 16px;border-radius:9999px;font-size:13px;font-weight:500;letter-spacing:0.5px;">
                    ${service}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Client Info -->
          <tr>
            <td style="background:#211F26;padding:24px 40px 0;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:16px;background:#2B2930;border-radius:12px;">
                    <p style="margin:0 0 4px;font-size:11px;color:#938F99;text-transform:uppercase;letter-spacing:1px;">Nom</p>
                    <p style="margin:0;font-size:16px;color:#E6E1E5;font-weight:500;">${name}</p>
                  </td>
                </tr>
                <tr><td style="height:12px;"></td></tr>
                <tr>
                  <td style="padding:16px;background:#2B2930;border-radius:12px;">
                    <p style="margin:0 0 4px;font-size:11px;color:#938F99;text-transform:uppercase;letter-spacing:1px;">Email</p>
                    <p style="margin:0;font-size:16px;color:#FFB3AE;">
                      <a href="mailto:${email}" style="color:#FFB3AE;text-decoration:none;">${email}</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Message -->
          <tr>
            <td style="background:#211F26;padding:24px 40px;">
              <div style="padding:20px;background:#2B2930;border-left:3px solid #FFB3AE;border-radius:0 12px 12px 0;">
                <p style="margin:0 0 8px;font-size:11px;color:#938F99;text-transform:uppercase;letter-spacing:1px;">Message</p>
                <p style="margin:0;font-size:15px;color:#E6E1E5;line-height:1.6;white-space:pre-wrap;">${message}</p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#211F26;padding:0 40px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-top:1px solid #49454F;padding-top:20px;text-align:center;">
                    <p style="margin:0;font-size:12px;color:#49454F;">Envoyé depuis EndPC.ma · ${now}</p>
                    <p style="margin:8px 0 0;font-size:12px;color:#49454F;">
                      Réponds directement à cet email pour contacter ${name}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Bottom Bar -->
          <tr>
            <td style="background:#93000A;padding:16px 40px;border-radius:0 0 16px 16px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#FFDAD4;opacity:0.7;">EndPC — Formattage · Linux · Assemblage PC · Maroc 🇲🇦</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
