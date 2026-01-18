import React, { useState } from 'react';

const Faq = () => {
  const [activeAccordion, setActiveAccordion] = useState(null);

  const faqs = [
    {
      question: "How can I start using WaitSmart for my business?",
      answer: "Getting started is simple! Sign up for an account, complete your business profile, set your availability, and you're ready to accept appointments. Our intuitive dashboard makes setup quick and easy."
    },
    {
      question: "How long does it take to set up the booking system?",
      answer: "Most businesses complete their setup in under 15 minutes. You can customize your services, availability, and booking preferences instantly. Start accepting appointments right away!"
    },
    {
      question: "Will I need to train my staff on the system?",
      answer: "No extensive training needed! WaitSmart is designed to be user-friendly. Your team will quickly adapt to the simple interface. We also provide video tutorials and 24/7 support."
    }
  ];

  return (
    <div className="bg-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-blue-600 font-semibold mb-2 uppercase text-sm tracking-wide">FAQ</p>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900">
            You've got questions, we've
          </h2>
          <h2 className="text-4xl sm:text-5xl font-bold text-blue-600">
            got answers
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setActiveAccordion(activeAccordion === index ? null : index)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors duration-200"
              >
                <span className="text-lg font-semibold text-gray-900 pr-4">
                  {faq.question}
                </span>
                <svg
                  className={`w-6 h-6 text-gray-500 flex-shrink-0 transition-transform duration-300 ${
                    activeAccordion === index ? 'rotate-45' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
                </svg>
              </button>
              {activeAccordion === index && (
                <div className="px-6 pb-6 text-gray-600 leading-relaxed">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Faq;
