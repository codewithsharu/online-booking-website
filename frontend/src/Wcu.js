import React from 'react';

const Wcu = () => {
  const features = [
    {
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      ),
      title: 'Less Time in the Chair',
      description: 'Pre-booked appointments mean you spend less time waiting and more time getting the care you need.',
      color: '#3B82F6', // Blue
      bgColor: '#EFF6FF'
    },
    {
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ),
      title: 'More Efficient',
      description: 'Streamlined scheduling ensures smooth service delivery with minimal disruptions and maximum convenience.',
      color: '#A855F7', // Purple
      bgColor: '#FAF5FF'
    },
    {
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
      ),
      title: 'Longer Lasting',
      description: 'Quality service with proper time allocation ensures better results and longer-lasting satisfaction.',
      color: '#EF4444', // Red
      bgColor: '#FEF2F2'
    },
    {
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
          <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
        </svg>
      ),
      title: 'More Comfortable Experience',
      description: 'Know your exact appointment time and arrive stress-free. No crowded waiting rooms, just personalized attention.',
      color: '#10B981', // Green
      bgColor: '#F0FDF4'
    }
  ];

  return (
    <div className="bg-white to-blue-50 py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-3 sm:mb-4">
            Why Choose Us?
          </h2>
          <div className="w-20 sm:w-24 h-1 mx-auto rounded-full" style={{backgroundColor: '#4e71ff'}}></div>
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 items-center">
          {/* Left Side - Feature Cards */}
          <div className="space-y-3 sm:space-y-4 order-1">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100"
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  {/* Icon Container */}
                  <div
                    className="flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-lg sm:rounded-xl flex items-center justify-center"
                    style={{
                      backgroundColor: feature.bgColor,
                      color: feature.color
                    }}
                  >
                    <div className="w-6 h-6 sm:w-8 sm:h-8">
                      {feature.icon}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right Side - Image */}
          <div className="relative w-full max-w-xs sm:max-w-sm mx-auto lg:mx-0 lg:ml-16 order-2 mt-6 lg:mt-0">
            {/* Blue Border Frame - only top and right, no white strip */}
            <div 
              className="relative shadow-2xl overflow-hidden" 
              style={{
                borderTopLeftRadius: '3rem',
                borderBottomRightRadius: '3rem',
                borderTopRightRadius: '0.5rem',
                borderBottomLeftRadius: '0.25rem'
              }}
            >
              {/* Blue border lines on top and right */}
              <div className="absolute top-0 left-0 right-0 h-1.5 z-10" style={{backgroundColor: '#4e71ff'}}></div>
              <div className="absolute top-0 right-0 bottom-0 w-1.5 z-10" style={{backgroundColor: '#4e71ff'}}></div>
              
              <img
                src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=300&h=600&fit=crop&q=80"
                alt="Professional dental service environment"
                className="w-full h-[400px] sm:h-[400px] lg:h-[500px] object-cover relative"
                style={{
                  borderTopLeftRadius: '3rem',
                  borderBottomRightRadius: '3rem',
                  borderTopRightRadius: '0.5rem',
                  borderBottomLeftRadius: '0.25rem'
                }}
              />
            </div>

            {/* Decorative Elements - hidden on mobile */}
            <div className="hidden sm:block absolute -top-6 -right-6 w-24 h-24 sm:w-32 sm:h-32 bg-blue-400 rounded-full opacity-20 blur-2xl animate-pulse"></div>
            <div className="hidden sm:block absolute -bottom-6 -left-6 w-24 h-24 sm:w-32 sm:h-32 bg-purple-400 rounded-full opacity-20 blur-2xl animate-pulse" style={{animationDelay: '1s'}}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wcu;
