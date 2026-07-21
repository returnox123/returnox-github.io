const express = require('express');
const path = require('path');
const twilio = require('twilio');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get(['/booking', '/booking/'], (req, res) => {
  res.sendFile(path.join(__dirname, 'booking', 'index.html'));
});

app.get('/booking.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'booking.html'));
});

app.use(express.static(path.join(__dirname)));

app.post('/api/contact', async (req, res) => {
  const { name, business, phone, schedule } = req.body;

  if (!name || !business || !phone || !schedule) {
    return res.status(400).json({ success: false, message: 'Please fill in all fields.' });
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_PHONE_NUMBER;
  const to = process.env.MY_PHONE_NUMBER;

  if (!accountSid || !authToken || !from || !to) {
    console.error('Twilio credentials not configured.');
    return res.status(500).json({ success: false, message: 'SMS service is not configured yet.' });
  }

  const client = twilio(accountSid, authToken);

  try {
    await client.messages.create({
      body: `New Returnox inquiry\nName: ${name}\nBusiness: ${business}\nPhone: ${phone}\nPreferred time: ${schedule}`,
      from,
      to
    });

    return res.json({ success: true, message: 'Thanks — we will be in touch shortly.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Could not send SMS right now.' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
