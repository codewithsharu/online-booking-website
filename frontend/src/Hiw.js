import React from 'react';
import cardimg1 from './cardimg1.jpg';
import cardimg2 from './cardimg2.jpg';
const Hiw = () => {
  return (
    <div className="bg-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            How It Works ?
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            A smarter way to schedule services with nearby professionals. Skip the queue and save your valuable time.
          </p>
        </div>

        {/* Content */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Left Side - Images */}
          <div className="relative w-full lg:w-1/2 flex justify-center items-center min-h-[450px] pl-12">
            {/* First centered image */}
            <div className="relative">
              {/* Star icon attached to top-left corner */}
              <svg className="absolute -top-4 -left-4 w-12 h-12 text-indigo-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
              </svg>
              
              <div className="rounded-[2.5rem] overflow-hidden shadow-2xl relative z-10" style={{border: '3px solid #4e71ff'}}>
                <img
                  src={cardimg2}
                  alt="Service"
                  className="w-64 h-80 object-cover"
                />
              </div>
            </div>
            
            {/* Second image - bottom left corner overlapping */}
            <div className="absolute bottom-0 left-12 z-20">
              {/* Settings icon attached to bottom-right corner */}
              <svg className="absolute -bottom-4 -right-4 w-12 h-12 text-indigo-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 15.5A3.5 3.5 0 0 1 8.5 12A3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5a3.5 3.5 0 0 1-3.5 3.5m7.43-2.53c.04-.32.07-.64.07-.97c0-.33-.03-.66-.07-1l2.11-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.31-.61-.22l-2.49 1c-.52-.39-1.06-.73-1.69-.98l-.37-2.65A.506.506 0 0 0 14 2h-4c-.25 0-.46.18-.5.42l-.37 2.65c-.63.25-1.17.59-1.69.98l-2.49-1c-.22-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64L4.57 11c-.04.34-.07.67-.07 1c0 .33.03.65.07.97l-2.11 1.66c-.19.15-.25.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1.01c.52.4 1.06.74 1.69.99l.37 2.65c.04.24.25.42.5.42h4c.25 0 .46-.18.5-.42l.37-2.65c.63-.26 1.17-.59 1.69-.99l2.49 1.01c.22.08.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.66Z"/>
              </svg>
              
              <div className="rounded-[2.5rem] overflow-hidden shadow-2xl bg-white relative z-10" style={{border: '3px solid #4e71ff'}}>
                <img
                  src={cardimg1}
                  alt="Service tools"
                  className="w-64 h-80 object-cover"
                />
              </div>
            </div>
          </div>

          {/* Right Side - Steps */}
          <div className="w-full lg:w-1/2 pl-0 lg:pl-8">
            {/* Step 1 */}
            <div className="flex items-start mb-8">
              <div className="relative flex flex-col items-center mr-6">
                {/* Circle - outer dashed, inner solid thick */}
                <div className="w-14 h-14 rounded-full border-2 border-dashed border-indigo-400 p-1 flex items-center justify-center">
                  <div className="w-full h-full rounded-full flex items-center justify-center" style={{backgroundColor: '#4e71ff'}}>
                    <span className="text-white font-bold text-base">01</span>
                  </div>
                </div>
                {/* Dotted line */}
                <div className="h-20 border-l-2 border-dashed border-indigo-300"></div>
              </div>
              <div className="pt-2">
                <h3 className="text-xl font-bold mb-2" style={{color: 'rgb(40, 80, 239)'}}>Step 1: Search Services</h3>
                <p className="text-sm leading-relaxed" style={{color: '#4e71ff'}}>
                  Choose from a variety of services such as grooming, healthcare, wellness, fitness and more in your area.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start mb-8 -mt-6">
              <div className="relative flex flex-col items-center mr-6">
                {/* Circle - outer dashed, inner solid thick */}
                <div className="w-14 h-14 rounded-full border-2 border-dashed border-indigo-400 p-1 flex items-center justify-center">
                  <div className="w-full h-full rounded-full flex items-center justify-center" style={{backgroundColor: '#4e71ff'}}>
                    <span className="text-white font-bold text-base">02</span>
                  </div>
                </div>
                {/* Dotted line */}
                <div className="h-20 border-l-2 border-dashed border-indigo-300"></div>
              </div>
              <div className="pt-2">
                <h3 className="text-xl  mb-2 text-black">Step 2: Schedule Your Slot</h3>
                <p className="text-sm leading-relaxed text-gray-500">
                  Choose a convenient date and time for your appointment. Select the best slot that fits your schedule.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start -mt-6">
              <div className="relative flex flex-col items-center mr-6">
                {/* Circle - outer dashed, inner solid thick */}
                <div className="w-14 h-14 rounded-full border-2 border-dashed border-indigo-400 p-1 flex items-center justify-center">
                  <div className="w-full h-full rounded-full flex items-center justify-center" style={{backgroundColor: '#4e71ff'}}>
                    <span className="text-white font-bold text-base">03</span>
                  </div>
                </div>
              </div>
              <div className="pt-2">
                <h3 className="text-xl  mb-2 text-black">Step 3: Skip the Queue</h3>
                <p className="text-sm leading-relaxed text-gray-500">
                  Arrive at your scheduled time and get served immediately. No more waiting in long queues!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hiw;
