import React, { useState } from 'react';

const FinalCta = () => {
  const [mobile, setMobile] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log('Mobile:', mobile);
  };

  return (
    <div 
      className="relative overflow-hidden py-8 sm:py-10 lg:py-12 px-4 sm:px-6 lg:px-8"
      style={{
        borderTopLeftRadius: '4rem',
        borderBottomRightRadius: '4rem',
        borderTopRightRadius: '0.5rem',
        borderBottomLeftRadius: '0.5rem'
      }}
    >
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500"
        style={{
          borderTopLeftRadius: '4rem',
          borderBottomRightRadius: '4rem',
          borderTopRightRadius: '0.5rem',
          borderBottomLeftRadius: '0.5rem'
        }}
      ></div>
      
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 opacity-20">
        <div className="absolute top-20 right-20 w-64 h-64 bg-white rounded-full transform rotate-45"></div>
        <div className="absolute top-40 right-40 w-48 h-48 bg-white rounded-full"></div>
      </div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Content */}
          <div className="text-white">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4 sm:mb-6">
              Start booking smarter today
            </h2>
            <p className="text-lg sm:text-xl text-blue-100 mb-8 sm:mb-10 max-w-xl">
              Join thousands of users who save time with instant appointments
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-2xl">
              <div className="flex-1">
                <input
                  type="tel"
                  placeholder="Enter your mobile number"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full px-6 py-4 rounded-xl sm:rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-white/30 text-base sm:text-lg"
                  required
                />
              </div>
              
              <button
                type="submit"
                className="group px-8 sm:px-10 py-4 bg-gray-900 hover:bg-black text-white font-bold rounded-xl sm:rounded-2xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl whitespace-nowrap"
              >
                Get Started
                <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </form>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center gap-6 sm:gap-8 mt-8 sm:mt-10 text-blue-100">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm sm:text-base font-medium">No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm sm:text-base font-medium">Setup in 2 minutes</span>
              </div>
            </div>
          </div>

          {/* Right Side - Professional Image/Illustration */}
          <div className="hidden lg:flex justify-end items-center">
            <div className="relative">
              {/* Decorative geometric shapes */}
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-3xl transform rotate-12"></div>
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-3xl transform -rotate-12"></div>
              
              {/* Main content area - you can add an image here */}
              <div className="relative bg-white/10 backdrop-blur-sm rounded-3xl p-8 w-96 h-96 flex items-center justify-center border border-white/20">
                <div className="text-center text-white">
                  <div className="w-32 h-32 mx-auto bg-white/20 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Verified Platform</h3>
                  <p className="text-blue-100">Trusted by professionals</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinalCta;
