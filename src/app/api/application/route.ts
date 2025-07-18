import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const { name, surname, companyName, companyEmail, phoneNumber, file, fileName, applyForMotorTools = 'attachment' } = await req.json();

    // Decode the base64 file string into a buffer
    const base64Data = file.split('base64,')[1];  // Extract the base64 part
    const buffer = Buffer.from(base64Data, 'base64'); // Convert to buffer

    // Determine the file type from the data URL
    const mimeTypeMatch = file.match(/data:(.*?);base64,/);
    const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'application/octet-stream';

    // Get file extension from the MIME type
    const extension = mimeType.split('/')[1] || 'bin';
    const fullFileName = `${fileName}.${extension}`;

    // Create a transporter using Gmail service
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: "noreplynplsport@gmail.com",
        pass: "vhmb lrkt xzrj fwof", 
      },
    });

    // Prepare the mail options
    const mailOptions = {
      from: "noreplynplsport@gmail.com",
      to: 'info@nplsportmarketing.com, info@prishtinafestive.com',
      subject: `Email from ${name} ${surname}`,
      text: `Aplikues i ri. Ja detajet:
      
      Emri i plotë: ${name} ${surname}
      Emri i kompanisë: ${companyName}
      Email i kompanisë: ${companyEmail}
      Nr.Kontaktues: ${phoneNumber}
      Bashkangjis aplikimin për mjete motorike: ${applyForMotorTools}`,
      
      attachments: [
        {
          filename: fullFileName,
          content: buffer,
          encoding: 'base64',
          contentType: mimeType,
        },
      ],
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return new Response(JSON.stringify({ message: 'Email sent successfully' }), {
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Error sending email' }), {
      status: 500,
    });
  }
} 