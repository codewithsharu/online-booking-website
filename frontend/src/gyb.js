import React, { useEffect, useState, useRef } from 'react';

const Gyb = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [vendorCount, setVendorCount] = useState(0);
  const [customerCount, setCustomerCount] = useState(0);
  const statsRef = useRef(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          animateValue(setVendorCount, 0, 2500, 2000);
          animateValue(setCustomerCount, 0, 50000, 2000);
        }
      },
      { threshold: 0.5 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => {
      if (statsRef.current) {
        observer.unobserve(statsRef.current);
      }
    };
  }, []);

  const animateValue = (setter, start, end, duration) => {
    const startTime = performance.now();
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOutQuad = progress * (2 - progress);
      const current = Math.floor(start + (end - start) * easeOutQuad);
      setter(current);
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  };

  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <div className="bg-white py-24 px-4 sm:px-6 lg:px-8 overflow-hidden relative">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `radial-gradient(circle at 2px 2px, #4e71ff 1px, transparent 0)`,
        backgroundSize: '40px 40px'
      }}></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-20">
          {/* Left Side - Content */}
          <div 
            className={`w-full lg:w-1/2 transform transition-all duration-1000 ${
              isVisible ? 'translate-x-0 opacity-100' : '-translate-x-20 opacity-0'
            }`}
          >
            {/* Badge with icon */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full mb-8 shadow-sm" style={{backgroundColor: '#f0f4ff', border: '1px solid #4e71ff20'}}>
              <svg className="w-4 h-4" style={{color: '#4e71ff'}} fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
              </svg>
              <span className="text-sm font-bold tracking-wide" style={{color: '#4e71ff'}}>
                FOR BUSINESS OWNERS
              </span>
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
              Grow Your Business<br />
              <span className="relative inline-block">
                <span style={{color: '#4e71ff'}}>With Us</span>
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 9C40 3 80 1 198 9" stroke="#4e71ff" strokeWidth="3" strokeLinecap="round" opacity="0.3"/>
                </svg>
                {/* Pencil icon at the end */}
                <svg className="absolute -bottom-2 -right-10 w-8 h-8 transform rotate-[-15deg]" style={{color: '#4e71ff'}} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
                </svg>
              </span>
            </h2>
            
            <p className="text-xl text-gray-600 mb-12 leading-relaxed max-w-xl">
              Accept online bookings and manage your schedule easily. 
              Join thousands of businesses already growing with our platform.
            </p>

            {/* Feature List with enhanced design */}
            <div className="space-y-6 mb-12">
              {[
                { text: 'More customers', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', delay: '100ms' },
                { text: 'Fewer calls', icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z', delay: '200ms' },
                { text: 'On-time service', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', delay: '300ms' },
                { text: 'Automated reminders', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9', delay: '400ms' }
              ].map((feature, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-4 group transform transition-all duration-500 hover:translate-x-3 ${
                    isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'
                  }`}
                  style={{ transitionDelay: feature.delay }}
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 group-hover:shadow-xl group-hover:scale-110 relative z-10" style={{backgroundColor: '#000000'}}>
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={feature.icon} />
                      </svg>
                    </div>
                    <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl" style={{backgroundColor: '#4e71ff'}}></div>
                  </div>
                  <span className="text-lg font-semibold text-gray-800 group-hover:text-gray-900 transition-colors duration-300">
                    {feature.text}
                  </span>
                </div>
              ))}
            </div>

            {/* Enhanced Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-14">
              <button
                className="group relative px-10 py-4 text-base font-bold text-white rounded-2xl transition-all duration-300 transform hover:scale-105 overflow-hidden shadow-lg hover:shadow-2xl"
                style={{backgroundColor: '#4e71ff'}}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Become a Vendor
                  <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
              
              <button
                className="px-10 py-4 text-base font-bold text-white border-2 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-xl"
                style={{backgroundColor: '#000000', borderColor: '#000000'}}
              >
                <span className="flex items-center justify-center gap-2">
                  See how it works  ?
          
                </span>
              </button>
            </div>

            {/* Simple Stats with animation */}
            <div ref={statsRef} className="grid grid-cols-2 gap-8 mt-12">
              <div className="text-center">
                <div className="text-5xl font-bold mb-2" style={{color: '#4e71ff'}}>
                  {vendorCount >= 1000 ? `${(vendorCount / 1000).toFixed(1)}K` : vendorCount}+
                </div>
                <div className="text-gray-600 font-medium">Active Vendors</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold mb-2" style={{color: '#4e71ff'}}>
                  {customerCount >= 1000 ? `${(customerCount / 1000).toFixed(0)}K` : customerCount}+
                </div>
                <div className="text-gray-600 font-medium">Happy Customers</div>
              </div>
            </div>
          </div>

          {/* Right Side - Enhanced Image/Illustration */}
          <div 
            className={`w-full lg:w-1/2 flex justify-center items-center transform transition-all duration-1000 delay-300 ${
              isVisible ? 'translate-x-0 opacity-100' : 'translate-x-20 opacity-0'
            }`}
          >
            <div className="relative w-full max-w-lg">
              {/* Main Image Container with enhanced design */}
              <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl transform hover:scale-105 transition-all duration-500 hover:shadow-3xl">
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-indigo-500/10 to-purple-600/10 z-10"></div>
                
                {/* White padding container */}
                <div className="bg-white p-6 relative">
                  {/* Inner glow effect */}
                  <div className="absolute inset-6 rounded-2xl opacity-20 blur-2xl" style={{backgroundColor: '#4e71ff'}}></div>
                  
                  <img
                    src="https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=600&fit=crop"
                    alt="Dashboard illustration"
                    className="w-full h-auto rounded-2xl object-cover shadow-xl relative z-10"
                  />
                </div>
              </div>
              
              {/* Enhanced Decorative Floating Elements */}
              <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full opacity-20 animate-bounce shadow-xl" style={{backgroundColor: '#4e71ff', animationDuration: '3s'}}></div>
              <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-yellow-400 rounded-full opacity-20 animate-pulse shadow-xl" style={{animationDuration: '2s'}}></div>
              
              {/* Enhanced Floating Card 1 */}
              <div className="absolute top-8 -left-6 bg-white rounded-3xl shadow-2xl p-5 animate-float border-2" style={{borderColor: '#4e71ff20'}}>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg" style={{backgroundColor: '#4e71ff'}}>
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-base font-bold text-gray-900">24/7 Available</div>
                    <div className="text-xs font-medium text-gray-500">Always Online</div>
                  </div>
                </div>
              </div>
              
              {/* Enhanced Floating Card 2 */}
              <div className="absolute bottom-16 -right-6 bg-white rounded-3xl shadow-2xl p-5 animate-float-delayed border-2 border-green-100">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br from-green-400 to-green-600 shadow-lg">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-base font-bold text-gray-900">+120 Bookings</div>
                    <div className="text-xs font-medium text-gray-500">This Month</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float 3s ease-in-out infinite;
          animation-delay: 1.5s;
        }
      `}</style>
    </div>
  );
};

export default Gyb;
