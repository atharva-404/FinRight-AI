import { useState, useEffect } from 'react';
import FinancialForm from './FinancialForm'; // Corrected path assumption
// The App.css import is removed as Tailwind CSS is used for styling.

function App() {
  const [advice, setAdvice] = useState('');
  const [apiResponse, setApiResponse] = useState(null);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (apiResponse) {
      setIsTyping(true);
      setAdvice(''); // Clear the previous advice
      const fullText = apiResponse;
      let i = 0;
      
      const typingInterval = setInterval(() => {
        if (i < fullText.length) {
          setAdvice((prevAdvice) => prevAdvice + fullText.charAt(i));
          i++;
        } else {
          clearInterval(typingInterval);
          setIsTyping(false);
        }
      }, 30); // Adjust typing speed here (in milliseconds)
      
      return () => clearInterval(typingInterval);
    }
  }, [apiResponse]);

  return (
    <div className="bg-gray-100 min-h-screen p-4 flex flex-col items-center">
      {/* The main form component is now rendered here */}
      <FinancialForm setApiResponse={setApiResponse} />

      {/* Container for the AI's response */}
      {advice && (
        <div className="mt-8 p-6 bg-white rounded-lg shadow-2xl max-w-lg w-full transform transition-all duration-300">
          <p className="font-bold text-gray-800 text-lg mb-2">AI Insights:</p>
          <p className="text-gray-700 font-inter leading-relaxed whitespace-pre-wrap">
            {advice}
            {isTyping && <span className="animate-pulse">|</span>}
          </p>
        </div>
      )}
    </div>
  );
}

export default App;
