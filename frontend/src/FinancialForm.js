import { useState } from 'react';
import axios from 'axios'; // We'll use axios for cleaner API calls
import PropTypes from 'prop-types';

// The FinancialForm component handles the user interface and API logic.
function FinancialForm({ setApiResponse }) {
  const [file, setFile] = useState(null);
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handles the file selection by the user.
  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  // Handles the change in the question text area.
  const handleQuestionChange = (event) => {
    setQuestion(event.target.value);
  };

  // Handles the form submission.
  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevents the default form submission behavior

    if (!file || !question) {
      setError('Please select a CSV or PDF file and enter a question.');
      return;
    }

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('question', question);

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/users/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      // Pass the advice back to the parent component (App.js)
      setApiResponse(response.data.advice); 
    } catch (err) {
      setError('An error occurred. Please try again later.');
      console.error('API Error:', err);
      setApiResponse(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-2xl max-w-lg mx-auto my-8 space-y-6 transform transition-all duration-300 hover:scale-105">
      <h2 className="text-3xl font-bold text-gray-900 text-center mb-6 font-inter">
        Get Your Financial Insights 🧠
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* CSV File Input */}
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-indigo-400 p-6 rounded-lg hover:border-indigo-600 transition-colors duration-200 cursor-pointer">
          <input
            type="file"
            id="csv-file"
            className="hidden"
            onChange={handleFileChange}
            accept=".csv, .pdf"
          />
          <label htmlFor="csv-file" className="flex flex-col items-center cursor-pointer">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-indigo-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
              />
            </svg>
            <span className="mt-2 text-center text-sm font-medium text-gray-700">
              {file ? file.name : 'Click to upload your CSV or PDf file'}
            </span>
            <span className="text-xs text-gray-500 mt-1">
              (e.g., bank statements)
            </span>
          </label>
        </div>

        {/* Question Input */}
        <div>
          <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-2">
            Ask Your Financial Question:
          </label>
          <textarea
            id="question"
            rows="4"
            value={question}
            onChange={handleQuestionChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 resize-none font-inter"
            placeholder="e.g., 'What are my biggest spending categories this month?' or 'How can I save more money?'"
            required
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full flex justify-center items-center py-3 px-6 border border-transparent rounded-full shadow-lg text-lg font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-1"
          disabled={isLoading}
        >
          {isLoading ? (
            <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            'Get My AI Insights'
          )}
        </button>

        {/* Error Message */}
        {error && (
          <div className="text-red-500 text-sm font-medium text-center">{error}</div>
        )}
      </form>
    </div>
  );
}

// Add PropTypes for type-checking.
FinancialForm.propTypes = {
  setApiResponse: PropTypes.func.isRequired,
};

export default FinancialForm;
