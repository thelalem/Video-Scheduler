const VideoCard = ({ video, darkMode }) => {
  const getStatusColor = () => {
    if (video.sent) return darkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-600';
    return darkMode ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-100 text-yellow-600';
  };

  const getStatusIcon = () => {
    if (video.sent) {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
      );
    }
    return (
      <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString([], { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  return (
    <div className={`group relative ${darkMode ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} rounded-xl p-4 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg border ${darkMode ? 'border-gray-600' : 'border-gray-100'}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-3">
            <div className={`flex-shrink-0 w-10 h-10 ${darkMode ? 'bg-gray-600' : 'bg-gray-100'} rounded-lg flex items-center justify-center`}>
              <svg className={`w-5 h-5 ${darkMode ? 'text-gray-300' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={`text-sm font-medium truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {video.s3Url.split("/").pop()}
              </h3>
              <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {formatDateTime(video.sendAt)}
              </p>
            </div>
          </div>
        </div>
        
        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
          {getStatusIcon()}
          <span>{video.sent ? 'Sent' : 'Pending'}</span>
        </div>
      </div>

      {/* Progress bar for pending videos */}
      {!video.sent && (
        <div className="mt-3">
          <div className="flex justify-between text-xs mb-1">
            <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Time remaining</span>
            <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
              {Math.max(0, Math.floor((new Date(video.sendAt) - new Date()) / (1000 * 60 * 60)))}h
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-1.5 rounded-full transition-all duration-300"
              style={{ 
                width: `${Math.min(100, Math.max(0, 
                  ((new Date(video.sendAt) - new Date()) / (1000 * 60 * 60 * 24)) * 100
                ))}%` 
              }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoCard;