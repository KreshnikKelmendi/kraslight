// Env vars (set in .env.local and Vercel):
// EMAIL_USER=noreplyattachment@gmail.com
// EMAIL_PASS=your-gmail-app-password (no spaces)
// ADMIN_EMAIL=kreshnik.kelmendi1994@gmail.com
// NEXT_PUBLIC_SITE_URL=https://your-domain.com

import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import type { Order, OrderItem } from '../types/order';
import { cartItemLineTotal, formatEuroPrice } from '@/app/lib/images';

const BRAND_GREEN = '#0a9945';

function getEmailConfig() {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;
  const adminEmail = process.env.ADMIN_EMAIL || 'kreshnik.kelmendi1994@gmail.com';

  if (!emailUser || !emailPass) {
    throw new Error('EMAIL_USER and EMAIL_PASS environment variables are required');
  }

  return { emailUser, emailPass, adminEmail };
}

function createTransporter(): Transporter {
  const { emailUser, emailPass } = getEmailConfig();

  // Windows dev / antivirus proxies sometimes inject self-signed certs into SMTP TLS.
  // Keep strict verification in production (Vercel); relax locally so emails can send.
  const rejectUnauthorized = process.env.NODE_ENV === 'production';

  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: { user: emailUser, pass: emailPass },
    tls: { rejectUnauthorized },
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getEmailImageUrl(imagePath: string): string {
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://kraslight.vercel.app';
  if (!imagePath) {
    return `${siteUrl.replace(/\/$/, '')}/images/placeholder.svg`;
  }

  return `${siteUrl.replace(/\/$/, '')}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
}

function orderShortId(order: Order): string {
  return order._id.slice(-8).toUpperCase();
}

function formatPayment(method: string): string {
  return method === 'cash' ? 'Kesh' : method === 'card' ? 'Kartelë' : method;
}

function formatMoney(amount?: number | null): string {
  return formatEuroPrice(amount) ?? '—';
}

function formatOrderTotal(amount?: number | null): string {
  if (typeof amount === 'number' && !Number.isNaN(amount)) {
    return `€${amount.toFixed(2)}`;
  }
  return '—';
}

function formatOrderDate(order: Order): string {
  const date = order.createdAt ? new Date(order.createdAt) : new Date();
  return date.toLocaleString('sq-AL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function renderProductRows(items: OrderItem[]): string {
  return items
    .map((item) => {
      const imageUrl = getEmailImageUrl(item.image || '');
      const unitPrice = formatMoney(item.price);
      const lineTotal = formatMoney(cartItemLineTotal(item) || undefined);

      return `
        <tr>
          <td style="padding:10px 8px;border-bottom:1px solid #eee;vertical-align:top;width:70px;">
            <img src="${imageUrl}" alt="" width="60" height="60" style="display:block;object-fit:cover;border:1px solid #e5e7eb;background:#fafafa;" />
          </td>
          <td style="padding:10px 8px;border-bottom:1px solid #eee;vertical-align:top;font-size:13px;color:#171717;line-height:1.5;">
            <strong>${escapeHtml(item.name)}</strong><br />
            <span style="color:#525252;">Barkod: ${escapeHtml(item.barcode || '—')}</span><br />
            ${item.brand ? `<span style="color:#525252;">Brendi: ${escapeHtml(item.brand)}</span><br />` : ''}
            ${item.size ? `<span style="color:#525252;">Madhësia: ${escapeHtml(item.size)}</span><br />` : ''}
            <span style="color:#525252;">Sasia: ${item.quantity} · ${unitPrice}</span>
          </td>
          <td style="padding:10px 8px;border-bottom:1px solid #eee;vertical-align:top;text-align:right;font-size:13px;font-weight:600;color:#171717;white-space:nowrap;">
            ${lineTotal}
          </td>
        </tr>
      `;
    })
    .join('');
}

function renderSimpleEmail(title: string, intro: string, content: string): string {
  return `
    <!DOCTYPE html>
    <html lang="sq">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${escapeHtml(title)}</title>
      </head>
      <body style="margin:0;padding:24px 12px;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif;color:#171717;">
        <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;">
          <div style="background:${BRAND_GREEN};padding:16px 20px;">
            <div style="color:#ffffff;font-size:18px;font-weight:700;letter-spacing:0.08em;">KRASLIGHT</div>
            <div style="color:rgba(255,255,255,0.9);font-size:13px;margin-top:4px;">${escapeHtml(title)}</div>
          </div>
          <div style="padding:20px;">
            <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#404040;">${intro}</p>
            ${content}
          </div>
          <div style="padding:14px 20px;border-top:1px solid #eee;background:#fafafa;font-size:11px;color:#737373;text-align:center;">
            Kraslight · www.kraslight.com
          </div>
        </div>
      </body>
    </html>
  `;
}

function renderOrderSummaryBlock(order: Order, options?: { showCustomer?: boolean }): string {
  const showCustomer = options?.showCustomer !== false;

  return `
    <table style="width:100%;border-collapse:collapse;margin-bottom:16px;font-size:13px;">
      <tr>
        <td style="padding:6px 0;color:#737373;width:38%;">Nr. porosisë</td>
        <td style="padding:6px 0;color:#171717;font-weight:600;">#${orderShortId(order)}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;color:#737373;">Data</td>
        <td style="padding:6px 0;color:#171717;">${formatOrderDate(order)}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;color:#737373;">Pagesa</td>
        <td style="padding:6px 0;color:#171717;">${formatPayment(order.paymentMethod)}</td>
      </tr>
      ${
        showCustomer
          ? `
      <tr>
        <td style="padding:6px 0;color:#737373;">Klienti</td>
        <td style="padding:6px 0;color:#171717;">${escapeHtml(order.firstName)} ${escapeHtml(order.lastName)}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;color:#737373;">Telefon</td>
        <td style="padding:6px 0;color:#171717;">${escapeHtml(order.phone)}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;color:#737373;">Email</td>
        <td style="padding:6px 0;color:#171717;">${escapeHtml(order.email)}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;color:#737373;vertical-align:top;">Adresa</td>
        <td style="padding:6px 0;color:#171717;line-height:1.5;">
          ${escapeHtml(order.address)}${order.city ? `, ${escapeHtml(order.city)}` : ''}<br />
          ${escapeHtml(order.country)} ${escapeHtml(order.postalCode)}
        </td>
      </tr>
      `
          : ''
      }
      ${
        order.notes
          ? `
      <tr>
        <td style="padding:6px 0;color:#737373;vertical-align:top;">Shënim</td>
        <td style="padding:6px 0;color:#171717;">${escapeHtml(order.notes)}</td>
      </tr>
      `
          : ''
      }
    </table>

    <div style="font-size:13px;font-weight:700;color:#171717;margin:0 0 8px;">Produktet</div>
    <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
      ${renderProductRows(order.items)}
    </table>

    <div style="padding:12px 14px;background:#f5f5f5;border:1px solid #e5e7eb;text-align:right;">
      <span style="font-size:13px;color:#525252;margin-right:8px;">Totali</span>
      <strong style="font-size:18px;color:#171717;">${formatOrderTotal(order.total)}</strong>
    </div>
  `;
}

export async function sendOrderConfirmationToCustomer(order: Order) {
  const { emailUser } = getEmailConfig();
  const transporter = createTransporter();

  const html = renderSimpleEmail(
    'Konfirmim porosie',
    `Përshëndetje ${escapeHtml(order.firstName)}, faleminderit për porosinë. Më poshtë gjeni detajet e porosisë suaj.`,
    renderOrderSummaryBlock(order, { showCustomer: false })
  );

  const result = await transporter.sendMail({
    from: `"Kraslight" <${emailUser}>`,
    to: order.email,
    replyTo: emailUser,
    subject: `Porosia #${orderShortId(order)} u pranua - Kraslight`,
    html,
  });

  return result;
}

export async function sendOrderNotification(order: Order) {
  const { emailUser, adminEmail } = getEmailConfig();
  const transporter = createTransporter();

  const html = renderSimpleEmail(
    'Porosi e re',
    `Ka ardhur një porosi e re nga ${escapeHtml(order.firstName)} ${escapeHtml(order.lastName)}.`,
    renderOrderSummaryBlock(order)
  );

  const result = await transporter.sendMail({
    from: `"Kraslight" <${emailUser}>`,
    to: adminEmail,
    replyTo: order.email,
    subject: `Porosi e re #${orderShortId(order)} - ${order.firstName} ${order.lastName}`,
    html,
  });

  return result;
}

export async function sendOrderStatusUpdateEmail(
  order: Order,
  oldStatus: string,
  newStatus: string
) {
  const { emailUser } = getEmailConfig();
  const transporter = createTransporter();

  const statusLabel: Record<string, string> = {
    pending: 'Në pritje',
    delivered: 'U dorëzua',
    completed: 'U dorëzua',
    cancelled: 'U anulua',
  };

  const content = `
    <table style="width:100%;border-collapse:collapse;margin-bottom:16px;font-size:13px;">
      <tr>
        <td style="padding:6px 0;color:#737373;width:38%;">Nr. porosisë</td>
        <td style="padding:6px 0;color:#171717;font-weight:600;">#${orderShortId(order)}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;color:#737373;">Statusi i ri</td>
        <td style="padding:6px 0;color:${BRAND_GREEN};font-weight:700;">${statusLabel[newStatus] || escapeHtml(newStatus)}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;color:#737373;">Statusi i mëparshëm</td>
        <td style="padding:6px 0;color:#171717;">${statusLabel[oldStatus] || escapeHtml(oldStatus)}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;color:#737373;">Totali</td>
        <td style="padding:6px 0;color:#171717;font-weight:600;">${formatOrderTotal(order.total)}</td>
      </tr>
    </table>
    ${renderProductRows(order.items)}
  `;

  const html = renderSimpleEmail(
    'Përditësim porosie',
    `Përshëndetje ${escapeHtml(order.firstName)}, statusi i porosisë suaj u përditësua.`,
    content
  );

  const result = await transporter.sendMail({
    from: `"Kraslight" <${emailUser}>`,
    to: order.email,
    replyTo: emailUser,
    subject: `Porosia #${orderShortId(order)} - ${statusLabel[newStatus] || newStatus}`,
    html,
  });

  return result;
}

export async function sendEmailToSubscribers(
  email: string,
  subject: string,
  message: string,
  htmlContent?: string
) {
  const { emailUser } = getEmailConfig();
  const transporter = createTransporter();

  const html =
    htmlContent ||
    renderSimpleEmail(
      'Kraslight',
      message.replace(/\n/g, '<br />'),
      `<p style="margin:0;font-size:13px;color:#525252;">Faleminderit që jeni pjesë e Kraslight.</p>`
    );

  const result = await transporter.sendMail({
    from: `"Kraslight" <${emailUser}>`,
    to: email,
    replyTo: emailUser,
    subject,
    html,
  });

  return result;
}
