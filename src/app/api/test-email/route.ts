import nodemailer from 'nodemailer';

export async function POST() {
  try {
    console.log('=== TESTING EMAIL CONFIGURATION ===');
    
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;
    
    console.log('Environment variables check:', {
      EMAIL_USER: emailUser ? 'SET' : 'NOT SET',
      EMAIL_PASS: emailPass ? 'SET' : 'NOT SET',
      emailUserLength: emailUser?.length || 0,
      emailPassLength: emailPass?.length || 0
    });
    
    // Check if environment variables are set
    if (!emailUser || !emailPass) {
      console.error('❌ EMAIL_USER and EMAIL_PASS environment variables are required');
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'EMAIL_USER and EMAIL_PASS environment variables are required',
        config: {
          EMAIL_USER: emailUser ? 'SET' : 'NOT SET',
          EMAIL_PASS: emailPass ? 'SET' : 'NOT SET'
        }
      }), {
        status: 500,
      });
    }
    
    console.log('✅ Environment variables are set');
    console.log('Email config:', { 
      user: emailUser, 
      pass: '***' 
    });

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });

    // Test connection
    console.log('🔍 Verifying Gmail connection...');
    await transporter.verify();
    console.log('✅ Gmail connection verified successfully!');

    // Send test email
    const mailOptions = {
      from: `"Kraslight Test" <${emailUser}>`,
      to: 'kreshnik.kelmendi1994@gmail.com',
      subject: 'Test Email - Kraslight Email System',
      text: 'Ky është një email test për të verifikuar konfigurimin e Gmail për sistemin e porosive.',
      html: `
        <h2>Test Email - Kraslight</h2>
        <p>Ky është një email test për të verifikuar konfigurimin e Gmail për sistemin e porosive.</p>
        <p><strong>Data:</strong> ${new Date().toLocaleString('sq-AL')}</p>
        <p><strong>Status:</strong> ✅ Email system is working!</p>
      `
    };

    console.log('📧 Sending test email...');
    console.log('Mail options:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject
    });
    
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Test email sent successfully!');
    console.log('Message ID:', result.messageId);

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Test email sent successfully',
      messageId: result.messageId,
      config: {
        EMAIL_USER: emailUser ? 'SET' : 'NOT SET',
        EMAIL_PASS: emailPass ? 'SET' : 'NOT SET'
      }
    }), {
      status: 200,
    });

  } catch (error) {
    console.error('❌ Test email failed:', error);
    
    let errorMessage = 'Unknown error';
    let errorType = 'unknown';
    
    if (error instanceof Error) {
      errorMessage = error.message;
      
      if (error.message.includes('Invalid login')) {
        errorMessage = 'Invalid login credentials. Check email and app password.';
        errorType = 'auth';
      } else if (error.message.includes('Username and Password not accepted')) {
        errorMessage = 'Username and password not accepted. App password may be expired.';
        errorType = 'auth';
      } else if (error.message.includes('Less secure app access')) {
        errorMessage = 'Less secure app access required or app password needed.';
        errorType = 'auth';
      } else if (error.message.includes('ENOTFOUND')) {
        errorMessage = 'Network error: Could not connect to Gmail servers.';
        errorType = 'network';
      }
    }

    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage,
      errorType,
      config: {
        EMAIL_USER: process.env.EMAIL_USER ? 'SET' : 'NOT SET',
        EMAIL_PASS: process.env.EMAIL_PASS ? 'SET' : 'NOT SET'
      }
    }), {
      status: 500,
    });
  }
} 