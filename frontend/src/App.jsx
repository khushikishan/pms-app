import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

axios.defaults.baseURL = 'http://localhost:4000';

function App() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(300); //5 mins

  //start countdown
  useEffect(() => {
    let countdown;
    if (otpSent && timer > 0) {
      countdown = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(countdown);
  }, [otpSent, timer]);

  //send otp
  const sendOtp = async (e) => {
    e.preventDefault();
    setMessage(''); //clear old msg

    // console.log(email);

    try {
      const response = await axios.post('/api/send-otp', { email });

      if (response && response.status === 200) {
        setOtpSent(true); //only start if actually sent
        setTimer(300);
        setMessage('OTP sent to your email');
      } else {
        setMessage('Something went wrong, Try again');
      }
    } catch (err) {
      console.log('Error: ', err);
      if (err.response?.data?.error) {
        setMessage(err.response.data.error);
      } else {
        setMessage('Could not send OTP');
      }
    }
  };

  //verify otp
  const checkOtp = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('/api/verify-otp', { email, otp });

      if (response.data.success) {
        window.location.href = '/success';
      }
    } catch (err) {
      console.log('Error verifying OTP:', err);
      setMessage('Invalid OTP');
    }
  };

  //timer
  const showTime = (val) => {
    let min = Math.floor(val / 60);
    let sec = val % 60;
    return `${min}:${sec < 10 ? '0' + sec : sec}`;
  };

  return (
    <div className="container">
      <h2>SkeinTechnology</h2>

      {/* login */}
      <form onSubmit={sendOtp}>
        <input
          type="email"
          placeholder="Email Address"
          value={email}
          readOnly={otpSent}
          onChange={(e) => setEmail(e.target.value)}
        />
        {!otpSent && (
          <button type="submit" className="active">
            Send OTP
          </button>
        )}
      </form>

      {/* success */}
      {otpSent && (
        <form onSubmit={checkOtp}>
          <input
            type="text"
            placeholder="Enter 6-digit OTP"
            maxLength={6}
            value={otp}
            disabled={timer <= 0}
            onChange={(e) => {
              let newOtp = e.target.value;
              if (/^\d{0,6}$/.test(newOtp)) {
                setOtp(newOtp);
              }
            }}
          />
          <button
            type="submit"
            className={otp.length === 6 && !isNaN(otp) && timer > 0 ? 'active' : ''}
            disabled={otp.length !== 6 || isNaN(otp) || timer <= 0}
          >
            Submit OTP
          </button>
          {timer > 0 ? (
            <p className="message">OTP expires in {showTime(timer)}</p>
          ) : (
            <p className="message">OTP expired. Please resend.</p>
          )}
        </form>
      )}

      {/* msg */}
      <p className="message">{message}</p>
    </div>
  );
}

export default App;