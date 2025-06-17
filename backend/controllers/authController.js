const Otp = require('../models/Otp');
const nodemailer = require('nodemailer');

//make otp
function makeOtp() {
  let x = Math.floor(Math.random() * 900000) + 100000;
  return x.toString();
}

//send otp
exports.sendOtp = async (req, res) => {
  const email = req.body.email;
  if (email === '') {
    return res.status(400).json({ error: 'Email required, please add your Email above' });
  }

  if (!email.endsWith('@gmail.com')) { //change to @skeintech.com later
    return res.status(400).json({ error: 'Only company addresses are allowed' });
  }

  let code = makeOtp();

  try {
    //check old
    let data = await Otp.find({ email: email });
    if (data.length > 0) {
      await Otp.deleteMany({ email: email });
    }

    //save new
    const item = new Otp({
      email: email,
      otp: code,
    });

    await item.save();

    //setup email
    const emailSender = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASS,
      },
    });

    //details
    const mail = {
      from: process.env.SMTP_EMAIL,
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP code is ${code}. It is valid for 5 minutes.`,
    };

    //send it
    await emailSender.sendMail(mail);

    return res.json({ success: true, message: 'OTP sent successfully!' });

  } catch (err) {
    console.log('Send OTP error:', err);
    res.status(500).json({ error: 'Failed to send OTP', details: err.message });
  }
};

//verify otp
exports.verifyOtp = async (req, res) => {
  const email = req.body.email;
  const otp = req.body.otp;
  if (email === '' || otp === '') return res.status(400).json({ error: 'Email and OTP are required' });

  try {
    const record = await Otp.findOne({ email: email, otp: otp });
    if (record == null) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    const currentTime = new Date().getTime();
    const createdTime = new Date(record.createdAt).getTime();
    const diff = currentTime - createdTime;

    if (diff > 300000) { //5 mins
      await Otp.deleteMany({ email: email });
      return res.status(400).json({ error: 'OTP expired' });
    }

    await Otp.deleteMany({ email: email });

    res.json({ success: true, message: 'Login successful' });
  } catch (err) {
    console.log('Verify OTP error:', err);
    res.status(500).json({ error: 'Verification failed', details: err.message });
  }
};