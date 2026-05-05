import React, { useState } from 'react';
import { ArrowRight, Mail, Sparkles, CheckCircle2 } from 'lucide-react';
import WaitlistModal from './WaitlistModal';

const FinalCTA = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleContactClick = () => {
        window.location.href = `mailto:${'contact'}@${'estospaces.com'}`;
    };

    const benefits = [
        'Early access to platform',
        'Exclusive launch offers',
        'Priority support'
    ];

    return (
        <section className="py-16 sm:py-20 lg:py-32 bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 text-white relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[10%] left-[5%] w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-[10%] right-[5%] w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl"></div>
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-5xl mx-auto text-center">
                    {/* Headline */}
                    <h2 className="text-3xl sm:text-4xl md:text-7xl font-bold mb-4 sm:mb-6 tracking-normal leading-tight">
                        The Future of <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-orange-400 to-orange-600">Real Estate</span>
                        <span className="block mt-2">Starts Here</span>
                    </h2>

                    {/* Subheadline */}
                    <p className="text-base sm:text-lg md:text-2xl text-gray-300 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed">
                        Reserve your spot and be part of the virtual-first revolution in property discovery.
                    </p>

                    {/* Benefits Pills */}
                    <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-8 sm:mb-12">
                        {benefits.map((benefit, index) => (
                            <div
                                key={index}
                                className="bg-white/10 backdrop-blur-sm px-4 sm:px-5 py-2 rounded-full border border-white/20 flex items-center gap-2 hover:bg-white/20 transition-all duration-300"
                            >
                                <CheckCircle2 className="text-primary" size={18} />
                                <span className="text-sm font-medium text-white dark:text-gray-100">{benefit}</span>
                            </div>
                        ))}
                    </div>

                    {/* Reserve Your Spot Button */}
                    <div className="max-w-2xl mx-auto mb-8 sm:mb-10">
                        <button
                            onClick={handleOpenModal}
                            type="button"
                            className="w-full bg-gradient-to-r from-primary to-orange-600 text-white px-6 sm:px-10 py-4 sm:py-5 rounded-full font-bold text-base sm:text-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-3 transform hover:scale-105"
                        >
                            Reserve Your Spot
                            <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>

                    {/* Microcopy */}
                    <p className="text-xs sm:text-sm text-gray-400 mb-8 sm:mb-12">
                        Secure. No spam. Unsubscribe anytime. We respect your privacy.
                    </p>

                    {/* Divider */}
                    <div className="max-w-md mx-auto mb-8">
                        <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                    </div>

                    {/* Contact Info */}
                    <div className="text-gray-400">
                        <p className="text-sm sm:text-lg leading-relaxed">
                            Questions?{' '}
                            <button
                                type="button"
                                onClick={handleContactClick}
                                className="text-primary hover:text-orange-400 font-semibold transition-colors inline-flex items-center gap-1 group"
                            >
                                Message our team
                                <Mail size={16} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </p>
                    </div>
                </div>
            </div>

            {/* Waitlist Modal */}
            <WaitlistModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </section>
    );
};

export default FinalCTA;
