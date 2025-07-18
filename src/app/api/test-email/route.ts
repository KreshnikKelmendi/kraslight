import nodemailer from 'nodemailer';

export async function POST() {
  try {
    console.log('Testing email configuration...');
    
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;
    
    // Check if environment variables are set
    if (!emailUser || !emailPass) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'EMAIL_USER and EMAIL_PASS environment variables are required' 
      }), {
        status: 500,
      });
    }
    
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
    console.log('Verifying connection...');
    await transporter.verify();
    console.log('Connection verified!');

    // Send test email
    const mailOptions = {
      from: emailUser,
      to: 'kreshnik.kelmendi1994@gmail.com',
      subject: 'Test Email - Runway Shop',
      text: 'Ky është një email test për të verifikuar konfigurimin e Gmail.',
      html: '<h2>Test Email</h2><p>Ky është një email test për të verifikuar konfigurimin e Gmail.</p>'
    };

    console.log('Sending test email...');
    const result = await transporter.sendMail(mailOptions);
    console.log('Test email sent successfully:', result.messageId);

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Test email sent successfully',
      messageId: result.messageId 
    }), {
      status: 200,
    });

  } catch (error) {
    console.error('Test email failed:', error);
    
    let errorMessage = 'Unknown error';
    if (error instanceof Error) {
      errorMessage = error.message;
      
      if (error.message.includes('Invalid login')) {
        errorMessage = 'Invalid login credentials. Check email and app password.';
      } else if (error.message.includes('Username and Password not accepted')) {
        errorMessage = 'Username and password not accepted. App password may be expired.';
      } else if (error.message.includes('Less secure app access')) {
        errorMessage = 'Less secure app access required or app password needed.';
      }
    }

    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage 
    }), {
      status: 500,
    });
  }
} 