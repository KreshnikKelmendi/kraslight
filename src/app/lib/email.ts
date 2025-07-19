import nodemailer from 'nodemailer';
import type { Order, OrderItem } from '../types/order';

// Helper function to get the correct image URL for emails
function getEmailImageUrl(imagePath: string, productName: string): string {
  // If we have a site URL configured, use it
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return `${process.env.NEXT_PUBLIC_SITE_URL}${imagePath}`;
  }
  
  // For development or when no site URL is configured, use a placeholder
  const encodedName = encodeURIComponent(productName.substring(0, 15));
  return `https://via.placeholder.com/100x100/667eea/ffffff?text=${encodedName}`;
}

// Send confirmation email to customer
export async function sendOrderConfirmationToCustomer(order: Order) {
  try {
    console.log('Sending confirmation email to customer:', order.email);
    
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;
    
    if (!emailUser || !emailPass) {
      throw new Error('EMAIL_USER and EMAIL_PASS environment variables are required');
    }
    
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });

    // Prepare order details for the email
    const itemsList = order.items.map((item: OrderItem) => {
      const imageUrl = getEmailImageUrl(item.image || '', item.name);
      
      return `
        <tr>
          <td style="padding: 15px; border-bottom: 1px solid #eee;">
            <table style="width: 100%;">
              <tr>
                <td style="width: 80px; vertical-align: top;">
                  <img src="${imageUrl}" alt="${item.name}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 6px; border: 1px solid #ddd; background-color: #f8f9fa;">
                </td>
                <td style="padding-left: 15px; vertical-align: top;">
                  <h3 style="margin: 0 0 5px 0; color: #2c3e50; font-size: 16px;">${item.name}</h3>
                  <p style="margin: 0 0 5px 0; color: #666; font-size: 14px;">
                    <strong>Brand:</strong> ${item.brand || 'N/A'} | 
                    <strong>Size:</strong> ${item.size || 'N/A'} | 
                    <strong>Category:</strong> ${item.category || 'N/A'}
                  </p>
                  <p style="margin: 0 0 5px 0; color: #666; font-size: 14px;">
                    <strong>Quantity:</strong> ${item.quantity} | 
                    <strong>Price:</strong> ${item.price}€
                  </p>
                  <p style="margin: 0; color: #e74c3c; font-weight: bold; font-size: 16px;">
                    Total: ${(item.price * item.quantity).toFixed(2)}€
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      `;
    }).join('');

    const mailOptions = {
      from: `"Kraslight" <${emailUser}>`,
      to: order.email,
      replyTo: emailUser,
      subject: `Konfirmimi i porosisë suaj - Kraslight`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Konfirmimi i Porosisë - Kraslight</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f9fa;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: white; font-size: 24px; font-weight: 300;">KRASLIGHT</h1>
              <p style="margin: 10px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px;">Faleminderit për porosinë tuaj!</p>
            </div>

            <!-- Success Message -->
            <div style="padding: 30px;">
              <div style="background-color: #d4edda; border-left: 4px solid #28a745; padding: 20px; margin-bottom: 25px;">
                <h2 style="margin: 0 0 10px 0; color: #155724; font-size: 20px;">Porosia u konfirmua me sukses!</h2>
                <p style="margin: 0; color: #155724; font-size: 14px;">
                  Përshëndetje ${order.firstName}! Porosia juaj u pranua dhe po procesohet.
                </p>
              </div>

              <!-- Order Info -->
              <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
                <h3 style="margin: 0 0 15px 0; color: #2c3e50; font-size: 16px;">Detajet e Porosisë</h3>
                <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                  <tr>
                    <td style="padding: 8px 0; color: #666; width: 40%;"><strong>Numri i Porosisë:</strong></td>
                    <td style="padding: 8px 0; color: #2c3e50; font-weight: bold;">#${order._id.toString().slice(-8)}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;"><strong>Data e Porosisë:</strong></td>
                    <td style="padding: 8px 0; color: #2c3e50;">${new Date().toLocaleDateString('sq-AL')} ${new Date().toLocaleTimeString('sq-AL')}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;"><strong>Statusi:</strong></td>
                    <td style="padding: 8px 0; color: #e74c3c; font-weight: bold;">Në pritje</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;"><strong>Metoda e pagesës:</strong></td>
                    <td style="padding: 8px 0; color: #2c3e50;">${order.paymentMethod === 'cash' ? 'Kesh' : 'Kartelë'}</td>
                  </tr>
                </table>
              </div>

              <!-- Shipping Info -->
              <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
                <h3 style="margin: 0 0 15px 0; color: #2c3e50; font-size: 16px;">Adresa e Dërgimit</h3>
                <p style="margin: 0 0 10px 0; color: #2c3e50; font-size: 14px;">
                  <strong>${order.firstName} ${order.lastName}</strong>
                </p>
                <p style="margin: 0 0 5px 0; color: #666; font-size: 14px;">
                  ${order.address}
                </p>
                <p style="margin: 0 0 5px 0; color: #666; font-size: 14px;">
                  ${order.city ? `${order.city}, ` : ''}${order.country} ${order.postalCode}
                </p>
                <p style="margin: 0; color: #666; font-size: 14px;">
                  Email: ${order.email} | Telefon: ${order.phone}
                </p>
              </div>

              <!-- Products -->
              <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
                <h3 style="margin: 0 0 15px 0; color: #2c3e50; font-size: 16px;">Produktet e Porosisë</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  ${itemsList}
                </table>
              </div>

              <!-- Order Summary -->
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; padding: 20px; text-align: center;">
                <h3 style="margin: 0 0 15px 0; color: white; font-size: 16px;">Totali i Porosisë</h3>
                <div style="background-color: rgba(255, 255, 255, 0.1); border-radius: 6px; padding: 15px;">
                  <p style="margin: 0; color: white; font-size: 20px; font-weight: bold;">
                    ${order.total.toFixed(2)}€
                  </p>
                </div>
              </div>

              <!-- Next Steps -->
              <div style="background-color: #e3f2fd; border-left: 4px solid #2196f3; padding: 20px; margin-bottom: 25px;">
                <h3 style="margin: 0 0 15px 0; color: #1565c0; font-size: 16px;">Hapat e Ardhshëm</h3>
                <ul style="margin: 0; padding-left: 20px; color: #1565c0; font-size: 14px;">
                  <li style="margin-bottom: 8px;">Po procesojmë porosinë tuaj</li>
                  <li style="margin-bottom: 8px;">Do t'ju kontaktojmë për konfirmimin final</li>
                  <li style="margin-bottom: 8px;">Dërgesa do të bëhet brenda 2-3 ditësh pune</li>
                  <li style="margin-bottom: 0;">Do t'ju dërgojmë një email kur porosia të dërgohet</li>
                </ul>
              </div>

              <!-- Contact Info -->
              <div style="background-color: #fff3e0; border-left: 4px solid #ff9800; padding: 20px; text-align: center;">
                <h3 style="margin: 0 0 10px 0; color: #e65100; font-size: 16px;">Na Kontaktoni</h3>
                <p style="margin: 0; color: #e65100; font-size: 14px;">
                  Nëse keni pyetje, na kontaktoni në: <strong>info@kraslight.com</strong>
                </p>
              </div>

            </div>

            <!-- Footer -->
            <div style="background-color: #2c3e50; padding: 20px; text-align: center;">
              <p style="margin: 0; color: rgba(255, 255, 255, 0.8); font-size: 12px;">
                © 2024 Kraslight. Të gjitha të drejtat e rezervuara.
              </p>
              <p style="margin: 5px 0 0 0; color: rgba(255, 255, 255, 0.6); font-size: 11px;">
                Faleminderit që zgjodhët Kraslight!
              </p>
            </div>

          </div>
        </body>
        </html>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Confirmation email sent to customer successfully:', result.messageId);
    
    return result;
  } catch (error) {
    console.error('Error sending confirmation email to customer:', error);
    throw error;
  }
}

export async function sendOrderNotification(order: Order) {
  try {
    console.log('Starting email notification process...');
    
    // Use only environment variables
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;
    
    // Check if environment variables are set
    if (!emailUser || !emailPass) {
      throw new Error('EMAIL_USER and EMAIL_PASS environment variables are required');
    }
    
    console.log('Email configuration:', { 
      emailUser, 
      emailPass: '***',
      hasEnvVars: true,
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'Not configured'
    });
    
    // Create a transporter using Gmail service
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });

    // Verify the transporter configuration
    console.log('Verifying Gmail connection...');
    await transporter.verify();
    console.log('Gmail connection verified successfully');

    // Prepare order details for the email
    const itemsList = order.items.map((item: OrderItem) => {
      const imageUrl = getEmailImageUrl(item.image || '', item.name);
      
      console.log('Product image debug:', {
        productName: item.name,
        originalImagePath: item.image,
        finalImageUrl: imageUrl
      });
      
      return `
        <tr>
          <td style="padding: 15px; border-bottom: 1px solid #eee;">
            <table style="width: 100%;">
              <tr>
                <td style="width: 80px; vertical-align: top;">
                  <img src="${imageUrl}" alt="${item.name}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 6px; border: 1px solid #ddd; background-color: #f8f9fa;">
                </td>
                <td style="padding-left: 15px; vertical-align: top;">
                  <h3 style="margin: 0 0 5px 0; color: #2c3e50; font-size: 16px;">${item.name}</h3>
                  <p style="margin: 0 0 5px 0; color: #666; font-size: 14px;">
                    <strong>Brand:</strong> ${item.brand || 'N/A'} | 
                    <strong>Size:</strong> ${item.size || 'N/A'} | 
                    <strong>Category:</strong> ${item.category || 'N/A'}
                  </p>
                  <p style="margin: 0 0 5px 0; color: #666; font-size: 14px;">
                    <strong>Quantity:</strong> ${item.quantity} | 
                    <strong>Price:</strong> ${item.price}€
                  </p>
                  <p style="margin: 0; color: #e74c3c; font-weight: bold; font-size: 16px;">
                    Total: ${(item.price * item.quantity).toFixed(2)}€
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      `;
    }).join('');

    const mailOptions = {
      from: `"Kraslight - Admin" <${emailUser}>`,
      to: 'kreshnik.kelmendi1994@gmail.com',
      subject: `Njoftim: Porosi e re nga ${order.firstName} ${order.lastName} - Kraslight`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Njoftim Admin - Porosi e re</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f9fa;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%); padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: white; font-size: 24px; font-weight: 300;">KRASLIGHT</h1>
              <p style="margin: 10px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px;">Njoftim për porosi të re</p>
            </div>

            <!-- Main Content -->
            <div style="padding: 30px;">
              <div style="background-color: #e8f4fd; border-left: 4px solid #3498db; padding: 20px; margin-bottom: 25px;">
                <h2 style="margin: 0 0 10px 0; color: #2c3e50; font-size: 20px;">Porosi e re u pranua</h2>
                <p style="margin: 0; color: #34495e; font-size: 14px;">
                  Një porosi e re ka arritur dhe kërkon vëmendjen tuaj.
                </p>
              </div>

              <!-- Order Info -->
              <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
                <h3 style="margin: 0 0 15px 0; color: #2c3e50; font-size: 16px;">Informacionet e Porosisë</h3>
                <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                  <tr>
                    <td style="padding: 8px 0; color: #666; width: 40%;"><strong>Numri i Porosisë:</strong></td>
                    <td style="padding: 8px 0; color: #2c3e50;">#${order._id.toString().slice(-8)}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;"><strong>Data:</strong></td>
                    <td style="padding: 8px 0; color: #2c3e50;">${new Date().toLocaleDateString('sq-AL')} ${new Date().toLocaleTimeString('sq-AL')}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;"><strong>Statusi:</strong></td>
                    <td style="padding: 8px 0; color: #e74c3c; font-weight: bold;">Në pritje</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;"><strong>Totali:</strong></td>
                    <td style="padding: 8px 0; color: #2c3e50; font-weight: bold;">${order.total.toFixed(2)}€</td>
                  </tr>
                </table>
              </div>

              <!-- Customer Info -->
              <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
                <h3 style="margin: 0 0 15px 0; color: #2c3e50; font-size: 16px;">Informacionet e Klientit</h3>
                <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                  <tr>
                    <td style="padding: 8px 0; color: #666; width: 40%;"><strong>Emri i plotë:</strong></td>
                    <td style="padding: 8px 0; color: #2c3e50;">${order.firstName} ${order.lastName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;"><strong>Email:</strong></td>
                    <td style="padding: 8px 0; color: #2c3e50;">${order.email}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;"><strong>Telefoni:</strong></td>
                    <td style="padding: 8px 0; color: #2c3e50;">${order.phone}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;"><strong>Adresa:</strong></td>
                    <td style="padding: 8px 0; color: #2c3e50;">${order.address}, ${order.city || ''}, ${order.country}, ${order.postalCode}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;"><strong>Metoda e pagesës:</strong></td>
                    <td style="padding: 8px 0; color: #2c3e50;">${order.paymentMethod === 'cash' ? 'Kesh' : 'Kartelë'}</td>
                  </tr>
                  ${order.notes ? `
                  <tr>
                    <td style="padding: 8px 0; color: #666;"><strong>Shënime:</strong></td>
                    <td style="padding: 8px 0; color: #2c3e50; font-style: italic;">${order.notes}</td>
                  </tr>
                  ` : ''}
                </table>
              </div>

              <!-- Products -->
              <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
                <h3 style="margin: 0 0 15px 0; color: #2c3e50; font-size: 16px;">Produktet e Porosisë</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  ${itemsList}
                </table>
              </div>

              <!-- Order Summary -->
              <div style="background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%); border-radius: 8px; padding: 20px; text-align: center;">
                <h3 style="margin: 0 0 15px 0; color: white; font-size: 16px;">Përmbledhje e Porosisë</h3>
                <div style="background-color: rgba(255, 255, 255, 0.1); border-radius: 6px; padding: 15px;">
                  <p style="margin: 0; color: white; font-size: 20px; font-weight: bold;">
                    Totali: ${order.total.toFixed(2)}€
                  </p>
                </div>
              </div>

            </div>

            <!-- Footer -->
            <div style="background-color: #2c3e50; padding: 20px; text-align: center;">
              <p style="margin: 0; color: rgba(255, 255, 255, 0.8); font-size: 12px;">
                © 2024 Kraslight. Të gjitha të drejtat e rezervuara.
              </p>
              <p style="margin: 5px 0 0 0; color: rgba(255, 255, 255, 0.6); font-size: 11px;">
                Ky email u dërgua automatikisht nga sistemi i porosive për administratorët.
              </p>
            </div>

          </div>
        </body>
        </html>
      `,
    };

    console.log('Sending email...');
    console.log('Mail options:', { 
      from: mailOptions.from, 
      to: mailOptions.to, 
      subject: mailOptions.subject 
    });

    // Send the email
    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    
    return result;
  } catch (error) {
    console.error('Error sending email notification:', error);
    
    // More detailed error logging
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
      
      // Check for specific Gmail errors
      if (error.message.includes('Invalid login')) {
        console.error('GMAIL ERROR: Invalid login credentials. Please check your email and app password.');
      } else if (error.message.includes('Username and Password not accepted')) {
        console.error('GMAIL ERROR: Username and password not accepted. App password may be expired or incorrect.');
      } else if (error.message.includes('Less secure app access')) {
        console.error('GMAIL ERROR: Less secure app access is required or app password is needed.');
      }
    }
    
    throw error;
  }
}

// Send order status update email to customer
export async function sendOrderStatusUpdateEmail(order: Order, oldStatus: string, newStatus: string) {
  try {
    console.log('=== STATUS UPDATE EMAIL FUNCTION START ===');
    console.log('Function parameters:', {
      orderEmail: order.email,
      orderId: order._id,
      oldStatus,
      newStatus
    });
    console.log('Sending order status update email to customer:', order.email);
    
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;
    
    if (!emailUser || !emailPass) {
      throw new Error('EMAIL_USER and EMAIL_PASS environment variables are required');
    }
    
    console.log('Environment variables check:', {
      EMAIL_USER: emailUser,
      EMAIL_PASS: emailPass ? '***' : 'NOT SET'
    });
    
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });

    // Get status information
    const getStatusInfo = (status: string) => {
      switch (status) {
        case 'pending':
          return { label: 'Në pritje', emoji: '⏳', color: '#f59e0b' };
        case 'processing':
          return { label: 'Po procesohet', emoji: '🔄', color: '#3b82f6' };
        case 'shipped':
          return { label: 'U dërgua', emoji: '📦', color: '#10b981' };
        case 'delivered':
          return { label: 'U dorëzua', emoji: '✅', color: '#059669' };
        case 'cancelled':
          return { label: 'U anulua', emoji: '❌', color: '#dc2626' };
        default:
          return { label: status, emoji: '📋', color: '#6b7280' };
      }
    };

    const oldStatusInfo = getStatusInfo(oldStatus);
    const newStatusInfo = getStatusInfo(newStatus);

    const mailOptions = {
      from: `"Kraslight" <${emailUser}>`,
      to: order.email,
      replyTo: emailUser,
      subject: `Përditësimi i statusit të porosisë - Kraslight`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Përditësimi i Statusit - Kraslight</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f9fa;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: white; font-size: 24px; font-weight: 300;">KRASLIGHT</h1>
              <p style="margin: 10px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px;">Përditësimi i statusit të porosisë</p>
            </div>

            <!-- Status Update -->
            <div style="padding: 30px;">
              <div style="background-color: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 20px; margin-bottom: 25px;">
                <h2 style="margin: 0 0 10px 0; color: #0369a1; font-size: 20px;">Statusi u përditësua!</h2>
                <p style="margin: 0; color: #0369a1; font-size: 14px;">
                  Përshëndetje ${order.firstName}! Statusi i porosisë suaj ka ndryshuar.
                </p>
              </div>

              <!-- Status Change -->
              <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
                <h3 style="margin: 0 0 15px 0; color: #2c3e50; font-size: 16px;">Ndryshimi i Statusit</h3>
                <div style="display: flex; align-items: center; justify-content: space-between; background-color: white; border-radius: 6px; padding: 15px; margin-bottom: 15px;">
                  <div style="text-align: center; flex: 1;">
                    <p style="margin: 0 0 5px 0; color: #666; font-size: 12px;">Statusi i mëparshëm</p>
                    <p style="margin: 0; color: ${oldStatusInfo.color}; font-weight: bold; font-size: 14px;">${oldStatusInfo.label}</p>
                  </div>
                  <div style="font-size: 18px; color: #666; margin: 0 20px;">→</div>
                  <div style="text-align: center; flex: 1;">
                    <p style="margin: 0 0 5px 0; color: #666; font-size: 12px;">Statusi i ri</p>
                    <p style="margin: 0; color: ${newStatusInfo.color}; font-weight: bold; font-size: 14px;">${newStatusInfo.label}</p>
                  </div>
                </div>
              </div>

              <!-- Order Info -->
              <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
                <h3 style="margin: 0 0 15px 0; color: #2c3e50; font-size: 16px;">Detajet e Porosisë</h3>
                <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                  <tr>
                    <td style="padding: 8px 0; color: #666; width: 40%;"><strong>Numri i Porosisë:</strong></td>
                    <td style="padding: 8px 0; color: #2c3e50; font-weight: bold;">#${order._id.toString().slice(-8)}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;"><strong>Data e Porosisë:</strong></td>
                    <td style="padding: 8px 0; color: #2c3e50;">${new Date(order.createdAt).toLocaleDateString('sq-AL')}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;"><strong>Totali:</strong></td>
                    <td style="padding: 8px 0; color: #2c3e50; font-weight: bold;">${order.total.toFixed(2)}€</td>
                  </tr>
                </table>
              </div>

              <!-- Status Specific Message -->
              <div style="background-color: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 20px; margin-bottom: 25px;">
                <h3 style="margin: 0 0 15px 0; color: #0369a1; font-size: 16px;">Çfarë do të ndodhë tani?</h3>
                ${newStatus === 'processing' ? `
                  <ul style="margin: 0; padding-left: 20px; color: #0369a1; font-size: 14px;">
                    <li style="margin-bottom: 8px;">Po procesojmë porosinë tuaj</li>
                    <li style="margin-bottom: 8px;">Po përgatisim produktet për dërgim</li>
                    <li style="margin-bottom: 0;">Do t'ju njoftojmë kur të dërgohet</li>
                  </ul>
                ` : newStatus === 'shipped' ? `
                  <ul style="margin: 0; padding-left: 20px; color: #0369a1; font-size: 14px;">
                    <li style="margin-bottom: 8px;">Porosia juaj u dërgua me postë</li>
                    <li style="margin-bottom: 8px;">Do të arrijë brenda 2-3 ditësh pune</li>
                    <li style="margin-bottom: 0;">Kur të arrijë, do t'ju kontaktojmë</li>
                  </ul>
                ` : newStatus === 'delivered' ? `
                  <ul style="margin: 0; padding-left: 20px; color: #0369a1; font-size: 14px;">
                    <li style="margin-bottom: 8px;">Porosia juaj u dorëzua me sukses!</li>
                    <li style="margin-bottom: 8px;">Faleminderit që zgjodhët Kraslight</li>
                    <li style="margin-bottom: 0;">Shpresojmë të ju shërbejmë përsëri</li>
                  </ul>
                ` : newStatus === 'cancelled' ? `
                  <ul style="margin: 0; padding-left: 20px; color: #0369a1; font-size: 14px;">
                    <li style="margin-bottom: 8px;">Porosia juaj u anulua</li>
                    <li style="margin-bottom: 8px;">Nëse keni pyetje, na kontaktoni</li>
                    <li style="margin-bottom: 0;">Shpresojmë të ju shërbejmë në të ardhmen</li>
                  </ul>
                ` : `
                  <p style="margin: 0; color: #0369a1; font-size: 14px;">
                    Statusi i porosisë suaj u përditësua. Do t'ju njoftojmë për ndryshimet e mëtejshme.
                  </p>
                `}
              </div>

              <!-- Contact Info -->
              <div style="background-color: #fff3e0; border-left: 4px solid #ff9800; padding: 20px; text-align: center;">
                <h3 style="margin: 0 0 10px 0; color: #e65100; font-size: 16px;">Na Kontaktoni</h3>
                <p style="margin: 0; color: #e65100; font-size: 14px;">
                  Nëse keni pyetje, na kontaktoni në: <strong>info@kraslight.com</strong>
                </p>
              </div>

            </div>

            <!-- Footer -->
            <div style="background-color: #2c3e50; padding: 20px; text-align: center;">
              <p style="margin: 0; color: rgba(255, 255, 255, 0.8); font-size: 12px;">
                © Kraslight. Të gjitha të drejtat e rezervuara.
              </p>
              <p style="margin: 5px 0 0 0; color: rgba(255, 255, 255, 0.6); font-size: 11px;">
                Ky email u dërgua automatikisht për të ju informuar për statusin e porosisë.
              </p>
            </div>

          </div>
        </body>
        </html>
      `,
    };

    console.log('=== STATUS UPDATE EMAIL DETAILS ===');
    console.log('From:', mailOptions.from);
    console.log('To:', mailOptions.to);
    console.log('Subject:', mailOptions.subject);
    console.log('Customer email from order:', order.email);
    console.log('EMAIL_USER env var:', emailUser);
    console.log('=====================================');

    const result = await transporter.sendMail(mailOptions);
    console.log('Status update email sent to customer successfully:', result.messageId);
    
    return result;
  } catch (error) {
    console.error('Error sending status update email to customer:', error);
    throw error;
  }
}

// Send email to subscribers
export async function sendEmailToSubscribers(email: string, subject: string, message: string, htmlContent?: string) {
  try {
    console.log('Sending email to subscriber:', email);
    
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;
    
    if (!emailUser || !emailPass) {
      throw new Error('EMAIL_USER and EMAIL_PASS environment variables are required');
    }
    
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });

    const mailOptions = {
      from: `"Kraslight" <${emailUser}>`,
      to: email,
      replyTo: emailUser,
      subject: subject,
      html: htmlContent || `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Kraslight Newsletter</title>
          <style>
            body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #ffffff; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
            .header { text-align: center; padding: 40px 20px; border-bottom: 2px solid #f3f4f6; }
            .logo { font-size: 28px; font-weight: 700; color: #1f2937; margin-bottom: 8px; }
            .subtitle { color: #6b7280; font-size: 14px; margin: 0; }
            .content { padding: 40px 20px; }
            .message { color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 40px; white-space: pre-wrap; }
            .section-title { font-size: 24px; font-weight: 600; color: #1f2937; margin-bottom: 20px; text-align: center; }
            .offers-section { background-color: #f9fafb; border-radius: 12px; padding: 30px; margin-bottom: 40px; text-align: center; }
            .offers-title { font-size: 20px; font-weight: 600; color: #1f2937; margin-bottom: 15px; }
            .offers-text { color: #6b7280; font-size: 16px; line-height: 1.5; }
            .cta-section { text-align: center; margin-bottom: 40px; }
            .cta-button { display: inline-block; background-color: #1f2937; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; transition: background-color 0.3s; }
            .cta-button:hover { background-color: #374151; }
            .contact-section { border-top: 1px solid #e5e7eb; padding-top: 30px; text-align: center; }
            .contact-title { font-size: 18px; font-weight: 600; color: #1f2937; margin-bottom: 15px; }
            .contact-info { color: #6b7280; font-size: 14px; line-height: 1.6; }
            .footer { background-color: #f9fafb; padding: 30px 20px; text-align: center; }
            .footer-text { color: #6b7280; font-size: 12px; margin-bottom: 8px; }
            .unsubscribe-link { color: #9ca3af; text-decoration: none; font-size: 12px; }
            .unsubscribe-link:hover { text-decoration: underline; }
            @media (max-width: 600px) {
              .content { padding: 30px 15px; }
              .header { padding: 30px 15px; }
              .offers-section { padding: 20px; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <!-- Header -->
            <div class="header">
              <div class="logo">KRASLIGHT</div>
              <p class="subtitle">Përditësimet e fundit dhe ofertat ekskluzive</p>
            </div>

            <!-- Content -->
            <div class="content">
              <!-- Main Message -->
              <div class="message">
                ${message}
              </div>

              <!-- Exclusive Offers Section -->
              <div class="offers-section">
                <h2 class="offers-title">🎁 Oferta Ekskluzive</h2>
                <p class="offers-text">
                  Si abonues i newsletter-it tonë, ju keni qasje në ofertat më të mira dhe përditësimet e fundit për koleksionet tona të reja. 
                  Mos humbisni mundësinë për të parë trendet më të fundit dhe ofertat speciale që krijojmë vetëm për ju.
                </p>
              </div>

              <!-- Call to Action -->
              <div class="cta-section">
                <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://kraslight.com'}" class="cta-button">
                  Shiko Koleksionin Tani
                </a>
              </div>

              <!-- Contact Information -->
              <div class="contact-section">
                <h3 class="contact-title">Na Kontaktoni</h3>
                <div class="contact-info">
                  <strong>Email:</strong> info@kraslight.com<br>
                  <strong>Telefon:</strong> 049 666 678<br>
                  <strong>Adresa:</strong> Rruga Tirana C4/3 & Prishtina MALL, Prishtinë, Kosovë
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="footer">
              <p class="footer-text">© 2024 Kraslight. Të gjitha të drejtat e rezervuara.</p>
              <p class="footer-text">Ky email u dërgua për shkak se jeni abonuar në newsletter-in tonë.</p>
              <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://kraslight.com'}/unsubscribe?email=${email}" class="unsubscribe-link">
                Çabonohu nga newsletter-i
              </a>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent to subscriber successfully:', result.messageId);
    
    return result;
  } catch (error) {
    console.error('Error sending email to subscriber:', error);
    throw error;
  }
} 