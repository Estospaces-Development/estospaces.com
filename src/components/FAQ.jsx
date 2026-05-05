import React, { useState } from 'react';
import { ChevronDown, HelpCircle, Mail } from 'lucide-react';

const FAQ = () => {
    const [openIndex, setOpenIndex] = useState(null);

    const handleContactClick = () => {
        window.location.href = `mailto:${'contact'}@${'estospaces.com'}`;
    };

    const faqs = [
        {
            question: 'What is Estospaces?',
            answer: 'Estospaces is a virtual-first real estate platform that lets you explore properties through immersive 3D tours, connect with verified brokers, and complete your property journey online.'
        },
        {
            question: 'When will Estospaces launch?',
            answer: 'We\'re launching soon! Join the waitlist to get notified first and receive early access.'
        },
        {
            question: 'Is the waitlist free?',
            answer: 'Yes, joining the waitlist is completely free with no commitment required.'
        },
        {
            question: 'How are listings verified?',
            answer: 'Every listing on Estospaces is created by verified brokers. We ensure authenticity so you never waste time on fake posts.'
        }
    ];

    return (
        <section id="faq" className="py-16 sm:py-20 lg:py-32 bg-gradient-to-b from-white dark:from-gray-900 via-gray-50 dark:via-gray-900 to-white dark:to-gray-900 relative overflow-hidden">
            {/* Decorative Background */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[20%] right-[10%] w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-[20%] left-[10%] w-96 h-96 bg-orange-200/10 rounded-full blur-3xl"></div>
            </div>

            <div className="container mx-auto px-4 relative z-10">
                {/* Section Header */}
                <div className="text-center mb-10 sm:mb-16 lg:mb-20 max-w-3xl mx-auto">
                    <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-4 sm:mb-6 tracking-normal leading-tight">
                        Frequently Asked <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-600">Questions</span>
                    </h2>
                    <p className="text-base sm:text-lg xl:text-xl text-gray-600 dark:text-gray-300">
                        Everything you need to know about Estospaces
                    </p>
                </div>

                {/* FAQ Accordion */}
                <div className="max-w-4xl mx-auto space-y-4 sm:space-y-5">
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            className={`bg-white dark:bg-gray-800 border-2 rounded-2xl overflow-hidden transition-all duration-300 shadow-md hover:shadow-xl ${openIndex === index ? 'border-primary shadow-lg' : 'border-gray-100 dark:border-gray-700'
                                }`}
                        >
                            <button
                                className="w-full px-4 sm:px-8 py-4 sm:py-6 text-left flex justify-between items-start sm:items-center transition-all duration-300 group gap-3"
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                            >
                                <span className={`font-bold text-lg sm:text-xl pr-2 sm:pr-8 transition-colors ${openIndex === index ? 'text-primary' : 'text-gray-900 dark:text-gray-100 group-hover:text-primary'
                                    }`}>
                                    {faq.question}
                                </span>
                                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${openIndex === index ? 'bg-primary rotate-180' : 'bg-gray-100 dark:bg-gray-700 group-hover:bg-primary/10'
                                    }`}>
                                    <ChevronDown
                                        className={`transition-colors ${openIndex === index ? 'text-white' : 'text-primary'
                                            }`}
                                        size={24}
                                    />
                                </div>
                            </button>

                            <div className={`overflow-hidden transition-all duration-300 ${openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                                }`}>
                                <div className="px-4 sm:px-8 py-4 sm:py-6 bg-gradient-to-br from-gray-50 dark:from-gray-800 to-white dark:to-gray-900 border-t border-gray-100 dark:border-gray-700">
                                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm sm:text-lg">
                                        {faq.answer}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Contact Card */}
                <div id="contact" className="text-center mt-10 sm:mt-16 max-w-2xl mx-auto">
                    <div className="bg-gradient-to-br from-primary/5 to-orange-50 p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-primary/10 shadow-lg">
                        <Mail className="text-primary mx-auto mb-4" size={32} />
                        <p className="text-gray-700 dark:text-gray-200 text-base sm:text-lg mb-4">
                            Still have questions? We're here to help!
                        </p>
                        <button
                            type="button"
                            onClick={handleContactClick}
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-orange-600 text-white px-6 sm:px-8 py-3 rounded-full font-semibold hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                        >
                            Contact Us
                            <Mail size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FAQ;
