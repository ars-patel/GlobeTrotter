# Email templates (Nodemailer)

Transactional HTML + plain-text templates live here.

| Template | Files | Used by |
|---|---|---|
| Password reset | `password-reset.html` + `password-reset.txt` | `POST /api/auth/forgot-password` |

Placeholders use `{{name}}` and are filled in `src/lib/mail.ts`.

## Deliverability (avoid spam)

Code alone cannot guarantee inbox placement. Also configure:

1. **SMTP_FROM** must use the same mailbox/domain as **SMTP_USER**
2. Prefer sending from a real domain with **SPF + DKIM + DMARC** DNS records
3. Always send **multipart** (HTML + text) — we do
4. Keep subjects calm; avoid spammy ALL-CAPS / “FREE!!!” wording
5. Links must point to your real app URL (`NEXT_PUBLIC_APP_URL`), not shorteners
6. For Gmail SMTP, use an App Password and a verified Google account

Restart the Next.js server after changing `.env`.
