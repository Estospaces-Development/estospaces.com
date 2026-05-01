import React, { useState } from 'react';
import { Twitter, Instagram, Linkedin, Send, Loader2 } from 'lucide-react';
import { postJson } from '../../lib/landingApi';
import { useChat } from '../../contexts/ChatContext';

const logoIcon = '/assets/logo-icon.png';

const Footer = () => {
    const { closeChat } = useChat();
    const appBaseUrl = process.env.NEXT_PUBLIC_APP_BASE_URL || 'https://app.estospaces.com';
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        if (!email.trim() || !email.includes('@')) {
            setError('Please enter a valid email address');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const subscriberEmail = email.trim().toLowerCase();

            await postJson('/api/send-newsletter-notification', {
                email: subscriberEmail,
                source: 'footer',
            });

            setSubmitted(true);
            setEmail('');

            // Reset the submitted message after 3 seconds
            setTimeout(() => {
                setSubmitted(false);
            }, 3000);
        } catch (err) {
            console.error('Error saving email:', err);
            setError(err.message || 'Failed to subscribe. Please try again.');
            
            // Clear error after 3 seconds
            setTimeout(() => {
                setError('');
            }, 3000);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSubmit();
        }
    };

    return (
        <footer className="bg-gray-900 text-white">
            {/* Main Footer */}
            <div className="container mx-auto px-4 py-12 sm:py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-10">
                    {/* About */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center gap-2 mb-4">
                            <img src={logoIcon} alt="Estospaces" className="w-10 h-10 object-contain" />
                            <span className="font-bold text-lg sm:text-xl">Estospaces</span>
                        </div>
                        <p className="text-gray-400 text-sm sm:text-base mb-4 max-w-sm">
                            A virtual-first real estate platform connecting buyers and renters with verified brokers through immersive 3D property tours.
                        </p>
                        <div className="flex gap-3">
                            <a href="https://x.com/ESTOSPACES" aria-label="Estospaces on X" className="bg-white bg-opacity-10 p-2 rounded-full hover:bg-primary transition-colors">
                                <Twitter size={18} />
                            </a>
                            <a href="https://www.instagram.com/estospaces/" aria-label="Estospaces on Instagram" className="bg-white bg-opacity-10 p-2 rounded-full hover:bg-primary transition-colors">
                                <Instagram size={18} />
                            </a>
                            <a href="https://www.linkedin.com/company/estospaces-solutions-private-limited" aria-label="Estospaces on LinkedIn" className="bg-white bg-opacity-10 p-2 rounded-full hover:bg-primary transition-colors">
                                <Linkedin size={18} />
                            </a>
                        </div>
                    </div>

                    {/* Pages */}
                    <div>
                        <h3 className="text-lg font-bold mb-4">Pages</h3>
                        <ul className="space-y-2">
                            {[
                                { name: 'Home', link: '/' },
                                { name: 'Features', link: '#features' },
                                { name: 'Reviews', link: '#reviews' },
                                { name: 'Waitlist', link: '#join-waitlist' },
                                { name: 'Contact Us', link: '#contact' }
                            ].map((item) => (
                                <li key={item.name}>
                                    <a 
                                        href={item.link} 
                                        onClick={closeChat}
                                        className="text-gray-400 hover:text-primary transition-colors"
                                    >
                                        {item.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Platform */}
                    <div>
                        <h3 className="text-lg font-bold mb-4">Platform</h3>
                        <ul className="space-y-2">
                            <li>
                                <a href="#faq" onClick={closeChat} className="text-gray-400 hover:text-primary transition-colors">FAQ</a>
                            </li>
                            <li>
                                <a href={`${appBaseUrl}/terms`} onClick={closeChat} className="text-gray-400 hover:text-primary transition-colors">
                                    Terms & Conditions
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h3 className="text-lg font-bold mb-4">Stay Updated</h3>
                        <p className="text-gray-400 text-sm sm:text-base mb-4">
                            Get launch updates and early access.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <input
                                type="email"
                                aria-label="Email address for launch updates"
                                placeholder="Your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onKeyDown={handleKeyDown}
                                disabled={loading}
                                className="flex-1 min-w-0 px-4 py-2.5 rounded bg-white bg-opacity-10 border border-gray-600 outline-none focus:border-primary transition-colors placeholder-gray-400 text-white disabled:opacity-50"
                            />
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                aria-label={loading ? 'Subscribing to updates' : 'Subscribe to updates'}
                                className="bg-primary p-2.5 rounded hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed self-start sm:self-auto"
                            >
                                {loading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                            </button>
                        </div>
                        {submitted && (
                            <p className="text-green-400 text-sm mt-2 animate-fade-in">
                                ✓ Subscribed! We'll keep you updated.
                            </p>
                        )}
                        {error && (
                            <p className="text-red-400 text-sm mt-2 animate-fade-in">
                                ✗ {error}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Copyright Bar */}
            <div className="border-t border-gray-700">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-gray-400 text-sm">
                            © 2025 Estospaces. All rights reserved.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-sm">
                            <a href={`${appBaseUrl}/privacy`} className="text-gray-400 hover:text-primary transition-colors">Privacy Policy</a>
                            <a href={`${appBaseUrl}/terms`} className="text-gray-400 hover:text-primary transition-colors">Terms of Service</a>
                            <a href={`${appBaseUrl}/cookies`} className="text-gray-400 hover:text-primary transition-colors">Cookie Policy</a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
