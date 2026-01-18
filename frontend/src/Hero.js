import React, { useEffect, useRef, useState } from 'react';
import grooming from './grooming.jpg';
import healthcare from './healthcare.jpg';
import services from './services.jpg';
import wellness from './wellness.jpg';
import fittness from './fittness.jpg';
import Hiw from './Hiw';
import Gyb from './gyb';
import Wcu from './Wcu';
import FinalCta from './FinalCta';
import ContactForm from './ContactForm';
import Faq from './Faq';
import Footer from './Footer';
const Hero = () => {
  const scrollContainerRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    let animationId;
    const scrollSpeed = 0.5; // Pixels per frame - adjust for speed

    const smoothScroll = () => {
      if (!isPaused && scrollContainer) {
        scrollContainer.scrollLeft += scrollSpeed;
        
        // When we've scrolled past half (the original content), reset to start
        const halfWidth = scrollContainer.scrollWidth / 2;
        if (scrollContainer.scrollLeft >= halfWidth) {
          scrollContainer.scrollLeft = 0;
        }
      }
      animationId = requestAnimationFrame(smoothScroll);
    };

    animationId = requestAnimationFrame(smoothScroll);

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [isPaused]);

  return (
    <div className="">
      <section className="relative py-12 bg-white sm:py-16 lg:py-20">
        <div className="absolute inset-0">
          <img className="object-cover w-full h-full" src="https://landingfoliocom.imgix.net/store/collection/clarity-blog/images/hero/5/grid-pattern.png" alt="" />
        </div>

        <div className="relative px-4 mx-auto sm:px-6 lg:px-8 max-w-7xl">
          <div className="max-w-xl mx-auto text-center">
            <h1 className="mt-16 text-3xl font-bold text-gray-900 sm:text-4xl lg:text-5xl">

              Book Appointments  <br></br>   
             Skip the Waiting
            </h1>
            <p className="max-w-md mx-auto mt-6 text-base font-normal leading-7 text-gray-500">
              A smarter way to schedule services with nearby professionals.
Choose your time, book instantly, and arrive stress-free.
            </p>

            <form action="#" method="POST"
              className="max-w-md mx-auto mt-8 space-y-4 sm:space-x-4 sm:flex sm:space-y-0 sm:items-end">
              <div className="flex-1">
                <label htmlFor="email" className="sr-only">
                  Email address
                </label>
                <div>
                  <input type="email" name="email" id="email"
                    className="block w-full px-4 py-3 sm:py-3.5 text-base font-medium text-gray-900 placeholder-gray-500 border border-gray-300 rounded-lg sm:text-sm focus:ring-gray-900 focus:border-gray-900"
                    placeholder="Enter area pin code" />
                </div>
              </div>

              <div className="relative group">
                <div
                  className="absolute transition-all duration-1000 opacity-70 inset-0 bg-gradient-to-r from-[#44BCFF] via-[#FF44EC] to-[#FF675E] rounded-xl blur-lg filter group-hover:opacity-100 group-hover:duration-200">
                </div>

                <button type="button"
                  className="inline-flex relative items-center justify-center w-full sm:w-auto px-8 py-3 sm:text-sm text-base sm:py-3.5 font-semibold text-white transition-all duration-200 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2"
                  style={{backgroundColor: '#4e71ff'}}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#4e71ff'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#4e71ff'}>
                  Search
                </button>
              </div>
            </form>

            <ul className="flex items-center justify-center mt-6 space-x-6 sm:space-x-8">
              <li className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none"
                  viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-xs font-medium text-gray-900 sm:text-sm">
                  Search nearby shops
                </span>
              </li>

              <li className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none"
                  viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-xs font-medium text-gray-900 sm:text-sm">
                  Real-time availability
                </span>
              </li>
            <li className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none"
                  viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-xs font-medium text-gray-900 sm:text-sm">
                 Zero waiting time
                </span>
              </li>
              
            </ul>
          </div>
        </div>

        <div 
          ref={scrollContainerRef}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="flex w-full gap-6 pb-8 mt-12 overflow-x-scroll sm:mt-16 lg:mt-20"
          style={{ 
            scrollbarWidth: 'none', 
            msOverflowStyle: 'none',
            scrollBehavior: 'auto'
          }}
        >
          <div className="relative snap-center scroll-ml-6 shrink-0 first:pl-6 last:pr-6">
            <div
              className="overflow-hidden w-[300px] lg:w-[420px] transition-all duration-200 transform bg-white border border-gray-200 rounded-2xl hover:shadow-lg hover:-translate-y-1">
              <div className="px-4 py-5 sm:p-5">
                <div className="flex items-start lg:items-center">
                  <div className="shrink-0">
                    <img className="lg:h-24 w-14 h-14 lg:w-24 rounded-xl object-cover" src={grooming} alt="grooming" />
                  </div>

                  <div className="flex-1 ml-4 lg:ml-6">
                    <p className="text-xs font-medium text-gray-900 lg:text-sm">
                      <span className="">
                        Grooming
                      </span>
                    </p>
                    <p className="mt-2 text-sm font-bold text-gray-900 lg:text-lg group-hover:text-gray-600">
                      <span className="">
                        Skip the queue at your favorite salon
                      </span>
                    </p>
                    <p className="mt-2 text-xs font-medium text-gray-500 lg:text-sm">
                      Verified vendors
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative snap-center scroll-ml-6 shrink-0 first:pl-6 last:pr-6">
            <div
              className="overflow-hidden w-[300px] lg:w-[420px] transition-all duration-200 transform bg-white border border-gray-200 rounded-2xl hover:shadow-lg hover:-translate-y-1">
              <div className="px-4 py-5 sm:p-5">
                <div className="flex items-start lg:items-center">
                  <div className="shrink-0">
                    <img className="lg:h-24 w-14 h-14 lg:w-24 rounded-xl object-cover" src={healthcare}
                      alt="healthcare" />
                  </div>

                  <div className="flex-1 ml-4 lg:ml-6">
                    <p className="text-xs font-medium text-gray-900 lg:text-sm">
                      <span className="">
                       Healthcare
                      </span>
                    </p>
                    <p className="mt-2 text-sm font-bold text-gray-900 lg:text-lg group-hover:text-gray-600">
                      <span className="">
                       Book doctor visits without waiting
                      </span>
                    </p>
                    <p className="mt-2 text-xs font-medium text-gray-500 lg:text-sm">
                      Instant confirmation
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative snap-center scroll-ml-6 shrink-0 first:pl-6 last:pr-6">
            <div
              className="overflow-hidden w-[300px] lg:w-[420px] transition-all duration-200 transform bg-white border border-gray-200 rounded-2xl hover:shadow-lg hover:-translate-y-1">
              <div className="px-4 py-5 sm:p-5">
                <div className="flex items-start lg:items-center">
                  <div className="shrink-0">
                    <img className="lg:h-24 w-14 h-14 lg:w-24 rounded-xl object-cover" src={services}
                      alt="" />
                  </div>

                  <div className="flex-1 ml-4 lg:ml-6">
                    <p className="text-xs font-medium text-gray-900 lg:text-sm">
                      <span className="">
                        Services
                      </span>
                    </p>
                    <p className="mt-2 text-sm font-bold text-gray-900 lg:text-lg group-hover:text-gray-600">
                      <span className="">
                        Schedule repairs at your convenience
                      </span>
                    </p>
                    <p className="mt-2 text-xs font-medium text-gray-500 lg:text-sm">
                      Verified vendors
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative snap-center scroll-ml-6 shrink-0 first:pl-6 last:pr-6">
            <div
              className="overflow-hidden w-[300px] lg:w-[420px] transition-all duration-200 transform bg-white border border-gray-200 rounded-2xl hover:shadow-lg hover:-translate-y-1">
              <div className="px-4 py-5 sm:p-5">
                <div className="flex items-start lg:items-center">
                  <div className="shrink-0">
                    <img className="lg:h-24 w-14 h-14 lg:w-24 rounded-xl object-cover" src={wellness}
                      alt="" />
                  </div>

                  <div className="flex-1 ml-4 lg:ml-6">
                    <p className="text-xs font-medium text-gray-900 lg:text-sm">
                      <span className="">
                       Wellness
                      </span>
                    </p>
                    <p className="mt-2 text-sm font-bold text-gray-900 lg:text-lg group-hover:text-gray-600">
                      <span className="">
                        Relax more with pre-booked sessions
                      </span>
                    </p>
                    <p className="mt-2 text-xs font-medium text-gray-500 lg:text-sm">
                      Hassle-free booking
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative snap-center scroll-ml-6 shrink-0 first:pl-6 last:pr-6">
            <div
              className="overflow-hidden w-[300px] lg:w-[420px] transition-all duration-200 transform bg-white border border-gray-200 rounded-2xl hover:shadow-lg hover:-translate-y-1">
              <div className="px-4 py-5 sm:p-5">
                <div className="flex items-start lg:items-center">
                  <div className="shrink-0">
                    <img className="lg:h-24 w-14 h-14 lg:w-24 rounded-xl object-cover" src={fittness}
                      alt="" />
                  </div>

                  <div className="flex-1 ml-4 lg:ml-6">
                    <p className="text-xs font-medium text-gray-900 lg:text-sm">
                      <span className="">
                        Fitness
                      </span>
                    </p>
                    <p className="mt-2 text-sm font-bold text-gray-900 lg:text-lg group-hover:text-gray-600">
                      <span className="">
                        Book gym sessions on your schedule
                      </span>
                    </p>
                    <p className="mt-2 text-xs font-medium text-gray-500 lg:text-sm">
                      Flexible timings
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Duplicate cards for infinite scroll */}
          <div className="relative snap-center scroll-ml-6 shrink-0 first:pl-6 last:pr-6">
            <div
              className="overflow-hidden w-[300px] lg:w-[420px] transition-all duration-200 transform bg-white border border-gray-200 rounded-2xl hover:shadow-lg hover:-translate-y-1">
              <div className="px-4 py-5 sm:p-5">
                <div className="flex items-start lg:items-center">
                  <div className="shrink-0">
                    <img className="lg:h-24 w-14 h-14 lg:w-24 rounded-xl object-cover" src={grooming} alt="grooming" />
                  </div>

                  <div className="flex-1 ml-4 lg:ml-6">
                    <p className="text-xs font-medium text-gray-900 lg:text-sm">
                      <span className="">
                        Grooming
                      </span>
                    </p>
                    <p className="mt-2 text-sm font-bold text-gray-900 lg:text-lg group-hover:text-gray-600">
                      <span className="">
                        Skip the queue at your favorite salon
                      </span>
                    </p>
                    <p className="mt-2 text-xs font-medium text-gray-500 lg:text-sm">
                      Verified vendors
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative snap-center scroll-ml-6 shrink-0 first:pl-6 last:pr-6">
            <div
              className="overflow-hidden w-[300px] lg:w-[420px] transition-all duration-200 transform bg-white border border-gray-200 rounded-2xl hover:shadow-lg hover:-translate-y-1">
              <div className="px-4 py-5 sm:p-5">
                <div className="flex items-start lg:items-center">
                  <div className="shrink-0">
                    <img className="lg:h-24 w-14 h-14 lg:w-24 rounded-xl object-cover" src={healthcare}
                      alt="healthcare" />
                  </div>

                  <div className="flex-1 ml-4 lg:ml-6">
                    <p className="text-xs font-medium text-gray-900 lg:text-sm">
                      <span className="">
                       Healthcare
                      </span>
                    </p>
                    <p className="mt-2 text-sm font-bold text-gray-900 lg:text-lg group-hover:text-gray-600">
                      <span className="">
                       Book doctor visits without waiting
                      </span>
                    </p>
                    <p className="mt-2 text-xs font-medium text-gray-500 lg:text-sm">
                      Instant confirmation
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative snap-center scroll-ml-6 shrink-0 first:pl-6 last:pr-6">
            <div
              className="overflow-hidden w-[300px] lg:w-[420px] transition-all duration-200 transform bg-white border border-gray-200 rounded-2xl hover:shadow-lg hover:-translate-y-1">
              <div className="px-4 py-5 sm:p-5">
                <div className="flex items-start lg:items-center">
                  <div className="shrink-0">
                    <img className="lg:h-24 w-14 h-14 lg:w-24 rounded-xl object-cover" src={services}
                      alt="" />
                  </div>

                  <div className="flex-1 ml-4 lg:ml-6">
                    <p className="text-xs font-medium text-gray-900 lg:text-sm">
                      <span className="">
                        Services
                      </span>
                    </p>
                    <p className="mt-2 text-sm font-bold text-gray-900 lg:text-lg group-hover:text-gray-600">
                      <span className="">
                        Schedule repairs at your convenience
                      </span>
                    </p>
                    <p className="mt-2 text-xs font-medium text-gray-500 lg:text-sm">
                      Verified vendors
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative snap-center scroll-ml-6 shrink-0 first:pl-6 last:pr-6">
            <div
              className="overflow-hidden w-[300px] lg:w-[420px] transition-all duration-200 transform bg-white border border-gray-200 rounded-2xl hover:shadow-lg hover:-translate-y-1">
              <div className="px-4 py-5 sm:p-5">
                <div className="flex items-start lg:items-center">
                  <div className="shrink-0">
                    <img className="lg:h-24 w-14 h-14 lg:w-24 rounded-xl object-cover" src={wellness}
                      alt="" />
                  </div>

                  <div className="flex-1 ml-4 lg:ml-6">
                    <p className="text-xs font-medium text-gray-900 lg:text-sm">
                      <span className="">
                       Wellness
                      </span>
                    </p>
                    <p className="mt-2 text-sm font-bold text-gray-900 lg:text-lg group-hover:text-gray-600">
                      <span className="">
                        Relax more with pre-booked sessions
                      </span>
                    </p>
                    <p className="mt-2 text-xs font-medium text-gray-500 lg:text-sm">
                      Hassle-free booking
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative snap-center scroll-ml-6 shrink-0 first:pl-6 last:pr-6">
            <div
              className="overflow-hidden w-[300px] lg:w-[420px] transition-all duration-200 transform bg-white border border-gray-200 rounded-2xl hover:shadow-lg hover:-translate-y-1">
              <div className="px-4 py-5 sm:p-5">
                <div className="flex items-start lg:items-center">
                  <div className="shrink-0">
                    <img className="lg:h-24 w-14 h-14 lg:w-24 rounded-xl object-cover" src={fittness}
                      alt="" />
                  </div>

                  <div className="flex-1 ml-4 lg:ml-6">
                    <p className="text-xs font-medium text-gray-900 lg:text-sm">
                      <span className="">
                        Fitness
                      </span>
                    </p>
                    <p className="mt-2 text-sm font-bold text-gray-900 lg:text-lg group-hover:text-gray-600">
                      <span className="">
                        Book gym sessions on your schedule
                      </span>
                    </p>
                    <p className="mt-2 text-xs font-medium text-gray-500 lg:text-sm">
                      Flexible timings
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Hiw />
      <Gyb />
      <Wcu />
      <FinalCta />
      <ContactForm />
      <Faq />
      <Footer />
    </div>
  );
};

export default Hero;
