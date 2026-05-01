// Node.js backend for handling supplier form and sending email via Gmail
// 1. Install dependencies: npm install express nodemailer cors body-parser dotenv
// 2. Create a .env file and set GMAIL_USER, GMAIL_PASS, and optionally RECEIVER_EMAIL

require('dotenv').config();

const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000; // You can change this if needed

app.use(cors());
app.options('*', cors());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

app.use(express.json({
  limit: '10mb',
  verify: (req, res, buf) => {
    req.rawBody = buf.toString();
  }
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Handle invalid JSON bodies without failing the entire submission.
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('Invalid JSON payload received:', err.message);
    console.error('Raw payload was:', req.rawBody);
    return res.status(400).json({
      message: 'The form payload could not be parsed. Please refresh the page and try again.'
    });
  }

  next(err);
});

// POST /send-supplier-form endpoint for form submissions
app.post('/send-supplier-form', async (req, res) => {
  const { full_name, company_name, email, phone, products, details } = req.body;
  
  console.log('📬 Received supplier form submission:', { full_name, company_name, email, phone });

  const brevoApiKey = process.env.BREVO_API_KEY;
  const receiverEmail = process.env.RECEIVER_EMAIL;

  console.log('🔍 DEBUG - BREVO_API_KEY exists:', !!brevoApiKey);
  console.log('🔍 DEBUG - RECEIVER_EMAIL:', receiverEmail);

  if (!brevoApiKey) {
    console.error('❌ BREVO_API_KEY not configured!');
    return res.status(500).json({
      message: 'Email service not configured. Please contact administrator.'
    });
  }

  if (!receiverEmail) {
    console.error('❌ RECEIVER_EMAIL not configured.');
    return res.status(500).json({
      message: 'Receiver email not configured.'
    });
  }

  const emailBody = `Supplier Application Received:\n\nFull Name: ${full_name}\nFarm / Company Name: ${company_name}\nEmail Address: ${email}\nPhone Number: ${phone}\nProducts Supplied: ${products}\nAdditional Details: ${details}`;

  console.log('📧 Attempting to send via Brevo...');
  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': brevoApiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sender: { name: 'FarmiNova Global Trade', email: 'farminovaglobaltrade@gmail.com' },
        to: [{ email: receiverEmail }],
        subject: 'New Supplier Application - FarmiNova Global Trade',
        textContent: emailBody
      })
    });

    console.log('Brevo response status:', response.status);
    const responseData = await response.text();
    console.log('Brevo response:', responseData);

    if (!response.ok) {
      throw new Error(`Brevo error ${response.status}: ${responseData}`);
    }

    console.log('✅ Email sent successfully via Brevo');
    return res.status(200).json({ message: 'Thank you for your application! Your details have been sent successfully.' });
  } catch (error) {
    console.error('❌ Brevo failed:', error.message);
    return res.status(502).json({
      message: 'Unable to send email. Please try again later.',
      error: error.message
    });
  }
});

const path = require('path');
const fs = require('fs');

// Clean URL routing - serve HTML pages without .html extension
// These routes must come BEFORE static file serving
const projectRoot = process.cwd();
const htmlDir = path.join(projectRoot, 'Farmi-Nova');

console.log('Project root:', projectRoot);
console.log('HTML directory:', htmlDir);
console.log('HTML directory exists:', fs.existsSync(htmlDir));

// List all HTML files in the directory
if (fs.existsSync(htmlDir)) {
  const files = fs.readdirSync(htmlDir).filter(f => f.endsWith('.html'));
  console.log('Available HTML files:', files);
}

app.get('/home', (req, res) => {
  res.set('Content-Type', 'text/html; charset=utf-8');
  res.sendFile(path.join(htmlDir, 'index.html'), (err) => {
    if (err) console.error('Error serving /home:', err.message);
  });
});

app.get('/certifications', (req, res) => {
  const filePath = path.join(htmlDir, 'certifications.html');
  console.log('Attempting to serve /certifications from:', filePath);
  console.log('File exists:', fs.existsSync(filePath));
  res.set('Content-Type', 'text/html; charset=utf-8');
  res.sendFile(filePath, (err) => {
    if (err) console.error('Error serving /certifications:', err.message);
  });
});

app.get('/products', (req, res) => {
  res.set('Content-Type', 'text/html; charset=utf-8');
  res.sendFile(path.join(htmlDir, 'products.html'), (err) => {
    if (err) console.error('Error serving /products:', err.message);
  });
});

app.get('/about', (req, res) => {
  res.set('Content-Type', 'text/html; charset=utf-8');
  res.sendFile(path.join(htmlDir, 'about.html'), (err) => {
    if (err) console.error('Error serving /about:', err.message);
  });
});

app.get('/contact-us', (req, res) => {
  const filePath = path.join(htmlDir, 'contact-us.html');
  console.log('Attempting to serve /contact-us from:', filePath);
  console.log('File exists:', fs.existsSync(filePath));
  res.set('Content-Type', 'text/html; charset=utf-8');
  res.sendFile(filePath, (err) => {
    if (err) console.error('Error serving /contact-us:', err.message);
  });
});

app.get('/become-supplier', (req, res) => {
  res.set('Content-Type', 'text/html; charset=utf-8');
  res.sendFile(path.join(htmlDir, 'become-supplier.html'), (err) => {
    if (err) console.error('Error serving /become-supplier:', err.message);
  });
});

// Root path serves index.html
app.get('/', (req, res) => {
  res.set('Content-Type', 'text/html; charset=utf-8');
  res.sendFile(path.join(htmlDir, 'index.html'), (err) => {
    if (err) console.error('Error serving /:', err.message);
  });
});

// Serve static files (CSS, images, etc.) - this comes AFTER route handlers
app.use(express.static(path.join(htmlDir)));

// Fallback handler - try to serve as HTML file with .html extension
app.get('*', (req, res) => {
  const requestPath = req.path;
  console.log(`Fallback handler: attempting to serve ${requestPath}`);
  
  // Remove leading slash and add .html extension
  const fileName = requestPath.substring(1) + '.html';
  const filePath = path.join(htmlDir, fileName);
  
  console.log(`Trying fallback path: ${filePath}`);
  
  if (fs.existsSync(filePath)) {
    console.log(`Found file via fallback: ${filePath}`);
    res.set('Content-Type', 'text/html; charset=utf-8');
    res.sendFile(filePath);
  } else {
    console.log(`File not found via fallback: ${filePath}`);
    res.status(404).send('Not Found - ' + requestPath);
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


