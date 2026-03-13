import { useEffect, useRef, useState } from "react";
import API from "./api/axios";

function App() {
  const TELEGRAM_BOT = "vidscheduler_bot"; // Your bot username
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  const [file, setFile] = useState(null);
  const [sendAt, setSendAt] = useState("");
  const [uploading, setUploading] = useState(false);
  const [telegramConnected, setTelegramConnected] = useState(false);
  const [telegramUser, setTelegramUser] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [preview, setPreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [telegramID, setTelegramID] = useState(null);
  const [scheduledAtUtc, setScheduledAtUtc] = useState(null);
  const sendAtInputRef = useRef(null);

const[token, setToken] = useState(() => {
  let saved = localStorage.getItem("connectToken");
  if (saved) return saved;
  const newToken = crypto.randomUUID();
  localStorage.setItem("connectToken", newToken);
  return newToken;
});

  console.log("Generated Connect Token:", token);
  useEffect(() => {
  const interval = setInterval(async () => {
    try {
          console.log("Checking Telegram connection status...");
      const res = await API.get(`/telegram-status/${token}`);
      if (res.data.connected) {
        setTelegramConnected(true);
        setTelegramUser(res.data.user);
        console.log("Telegram User:", res.data.user.username);
        setTelegramID(res.data.user.telegramId);
        console.log("Telegram ID:", res.data.user.telegramId);
        clearInterval(interval);
      }
    } catch (err) {
      console.error("Error checking Telegram status:", err);
    }
  }, 2000);

  return () => clearInterval(interval);
}, [token]);



  // Handle file selection with preview
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setMessage({ type: '', text: '' });
    
    // Create video preview URL
    if (selectedFile) {
      if (preview) URL.revokeObjectURL(preview);
      const url = URL.createObjectURL(selectedFile);
      setPreview(url);
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const toLocalDateTimeInputValue = (date) => {
    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return localDate.toISOString().slice(0, 16);
  };

  const formatInUserTimezone = (dateValue) => {
    return new Intl.DateTimeFormat(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: userTimeZone,
      timeZoneName: 'short',
    }).format(new Date(dateValue));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!telegramConnected) {
      setMessage({ 
        type: 'error', 
        text: 'Please connect to Telegram first' 
      });
      return;
    }

    if (!file || !sendAt) {
      setMessage({ type: 'error', text: 'Please fill in all fields' });
      return;
    }

    if (new Date(sendAt) < new Date()) {
      setMessage({ type: 'error', text: 'Please select a future date' });
      return;
    }

    // Validate file type
    if (!file.type.startsWith('video/')) {
      setMessage({ type: 'error', text: 'Please upload a valid video file' });
      return;
    }

    // Validate file size (max 100MB)
    if (file.size > 100 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'File size must be less than 100MB' });
      return;
    }

    const formData = new FormData();
    formData.append("video", file);

    setUploading(true);
    setUploadProgress(0);
    setMessage({ type: '', text: '' });
    setScheduledAtUtc(null);

    try {
      const uploadRes = await API.post("/uploads", formData, {
        onUploadProgress: (progressEvent) => {
          if (!progressEvent.total) return;
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(Math.min(percent, 95));
        },
      });
      const { s3Url } = uploadRes.data;

      const sendAtUtc = new Date(sendAt).toISOString();
      setUploadProgress(96);

      const scheduleRes = await API.post("/schedule-video", {
        s3Url,
        sendAt: sendAtUtc,
        telegramID,
        clientTimeZone: userTimeZone,
      });

      setScheduledAtUtc(scheduleRes.data?.normalizedSendAtUtc || sendAtUtc);
      setUploadProgress(100);
      
      setMessage({ 
        type: 'success', 
        text: '✓ Video scheduled! You will receive it on Telegram at the selected time.' 
      });
      
      // Reset form
      setTimeout(() => {
        setFile(null);
        setSendAt("");
        setPreview(null);
        setUploadProgress(0);
        document.getElementById('video-input').value = '';
      }, 2000);
      
    } catch (err) {
      setUploadProgress(0);
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.message || 'Something went wrong' 
      });
    } finally {
      setTimeout(() => {
        setUploading(false);
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header with Telegram Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-lg rounded-3xl mb-4 border border-white/20 shadow-2xl">
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.053-.333-.373-.12l-6.87 4.326-2.96-.984c-.643-.2-.658-.643.135-.953l11.56-4.455c.538-.196 1.006.128.832.941z"/>
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">Telegram Video Scheduler</h1>
          <p className="text-white/80 text-lg">Upload a video and get it delivered via Telegram</p>
        </div>

        {/* Main Card */}
        <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-6 border border-white/20">
          
          {/* Telegram Connection Status - UPDATED UI */}
          <div className={`mb-6 p-4 rounded-xl border ${
            telegramConnected 
              ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' 
              : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100'
          }`}>
            {telegramConnected ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div className="absolute top-0 left-0 w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700 block">Connected to Telegram</span>
                    {telegramUser && (
                      <span className="text-xs text-gray-500">
                        {telegramUser.first_name} {telegramUser.last_name || ''}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs bg-white px-3 py-1.5 rounded-full text-gray-600 font-medium shadow-sm">
                    @{telegramUser?.username || 'connected'}
                  </span>
                  <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center shadow-md">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-3">Connect Telegram to receive your videos</p>
                <a
                  href={`https://t.me/${TELEGRAM_BOT}?start=${token}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl text-sm font-medium transition-all transform hover:scale-105 shadow-lg"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.053-.333-.373-.12l-6.87 4.326-2.96-.984c-.643-.2-.658-.643.135-.953l11.56-4.455c.538-.196 1.006.128.832.941z"/>
                  </svg>
                  <span>Connect with Telegram</span>
                </a>
                <p className="text-xs text-gray-400 mt-2">
                  Click to open @{TELEGRAM_BOT} and press "Start"
                </p>
              </div>
            )}
          </div>

          {/* How it works steps */}
          <div className="mb-6 grid grid-cols-4 gap-2">
            {[
              { num: '1', label: 'Connect', icon: '🤝' },
              { num: '2', label: 'Upload', icon: '📤' },
              { num: '3', label: 'Schedule', icon: '⏰' },
              { num: '4', label: 'Receive', icon: '📱' }
            ].map((step, i) => (
              <div key={i} className="text-center">
                <div className={`w-10 h-10 mx-auto mb-1 rounded-full flex items-center justify-center text-sm font-bold
                  ${telegramConnected || i > 0 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                    : 'bg-gray-200 text-gray-400'}`}>
                  {step.num}
                </div>
                <div className="text-xs text-gray-500">{step.label}</div>
                <div className="text-lg">{step.icon}</div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Input with Preview */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Video
              </label>
              
              <div className={`relative border-2 border-dashed rounded-xl p-4 transition-all
                ${file ? 'border-purple-400 bg-purple-50' : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'}
                ${!telegramConnected && 'opacity-50 pointer-events-none'}`}>
                
                <input
                  id="video-input"
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  disabled={!telegramConnected}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                />
                
                {preview ? (
                  <div className="space-y-3">
                    <video 
                      src={preview} 
                      className="w-full max-h-40 rounded-lg object-cover"
                      controls
                    />
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600 truncate">{file.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-gray-600 font-medium">Click to upload your video</p>
                    <p className="text-xs text-gray-500 mt-2">MP4, MOV, AVI up to 100MB</p>
                  </div>
                )}
              </div>
            </div>

            {/* Date Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deliver via Telegram on
              </label>
              <p className="text-xs text-gray-500 mb-2">Shown in your timezone: {userTimeZone}</p>
              <div className="relative">
                <input
                  ref={sendAtInputRef}
                  type="datetime-local"
                  value={sendAt}
                  onChange={(e) => setSendAt(e.target.value)}
                  min={toLocalDateTimeInputValue(new Date())}
                  disabled={!telegramConnected}
                  className="w-full px-4 pr-14 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!sendAtInputRef.current) return;
                    if (typeof sendAtInputRef.current.showPicker === 'function') {
                      sendAtInputRef.current.showPicker();
                    }
                    sendAtInputRef.current.focus();
                  }}
                  disabled={!telegramConnected}
                  className="absolute inset-y-0 right-0 px-4 flex items-center text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Open date and time picker"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Upload Progress */}
            {uploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Uploading your video...</span>
                  <span className="text-purple-600 font-medium">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Message */}
            {message.text && (
              <div className={`p-4 rounded-xl text-sm flex items-start space-x-2 ${
                message.type === 'success' 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {message.type === 'success' ? (
                  <svg className="w-5 h-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-red-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                <div>
                  <span>{message.text}</span>
                  {message.type === 'success' && scheduledAtUtc && (
                    <div className="mt-1 text-xs text-green-700">
                      Stored on server (UTC): {new Date(scheduledAtUtc).toISOString()}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={uploading || !telegramConnected || !file || !sendAt}
              className={`w-full py-4 px-4 rounded-xl font-semibold text-white text-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-xl ${
                uploading || !telegramConnected || !file || !sendAt
                  ? 'bg-gray-400'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
              }`}
            >
              {uploading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading...
                </span>
              ) : (
                'Schedule Telegram Delivery'
              )}
            </button>
          </form>

          {/* Delivery Confirmation Card */}
          {telegramConnected && file && sendAt && !uploading && (
            <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800 mb-1">📱 Telegram Delivery Scheduled</p>
                  <p className="text-xs text-gray-600">
                    <span className="font-medium">{file.name}</span> will be sent to your Telegram on{' '}
                    <span className="font-medium text-purple-600">
                      {formatInUserTimezone(sendAt)}
                    </span>
                  </p>
                  {scheduledAtUtc && (
                    <p className="text-xs text-gray-500 mt-1">
                      Server UTC: <span className="font-medium">{new Date(scheduledAtUtc).toISOString()}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Footer with Bot Info */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-xs text-center text-gray-500">
              Powered by <a href={`https://t.me/${TELEGRAM_BOT}`} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-700 font-medium hover:underline">@{TELEGRAM_BOT}</a>
              <br />
              <span className="text-gray-400">Make sure you've started the bot to receive videos</span>
            </p>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="mt-8 text-center text-white/60 text-sm">
          <p>✨ Upload once, receive it at the perfect time on Telegram</p>
        </div>
      </div>
    </div>
  );
}

export default App;