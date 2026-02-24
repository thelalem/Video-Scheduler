const Loader = ({ darkMode }) => (
  <div className="flex flex-col items-center justify-center py-12">
    <div className="relative">
      {/* Outer ring */}
      <div className={`w-16 h-16 border-4 ${darkMode ? 'border-gray-600' : 'border-gray-200'} rounded-full`}></div>
      
      {/* Spinning gradient ring */}
      <div className="absolute top-0 left-0 w-16 h-16 border-4 border-t-transparent border-l-transparent border-r-transparent border-b-4 border-b-blue-500 rounded-full animate-spin"></div>
      
      {/* Inner dot */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className={`w-2 h-2 ${darkMode ? 'bg-blue-400' : 'bg-blue-500'} rounded-full animate-pulse`}></div>
      </div>
    </div>
    
    <div className="mt-4 flex items-center space-x-2">
      <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Loading</span>
      <span className="flex space-x-1">
        <span className={`w-1 h-1 ${darkMode ? 'bg-gray-400' : 'bg-gray-500'} rounded-full animate-bounce`} style={{ animationDelay: '0s' }}></span>
        <span className={`w-1 h-1 ${darkMode ? 'bg-gray-400' : 'bg-gray-500'} rounded-full animate-bounce`} style={{ animationDelay: '0.1s' }}></span>
        <span className={`w-1 h-1 ${darkMode ? 'bg-gray-400' : 'bg-gray-500'} rounded-full animate-bounce`} style={{ animationDelay: '0.2s' }}></span>
      </span>
    </div>
  </div>
);

export default Loader;