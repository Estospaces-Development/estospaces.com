import React, { useState, useEffect } from 'react';
import { Menu, X, UserPlus } from 'lucide-react';
import { useChat } from '../../contexts/ChatContext';

const logoIcon = '/assets/logo-icon.png';

const Navbar = ({ activePath = '/', forceSolid = false }) => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { closeChat } = useChat();
    const isSolid = forceSolid || isScrolled;
    const navItems = [
        { label: 'Features', href: forceSolid ? '/#features' : '#features' },
        { label: 'Reviews', href: forceSolid ? '/#reviews' : '#reviews' },
        { label: 'FAQ', href: forceSolid ? '/#faq' : '#faq' },
        { label: 'Blog', href: '/blogs' },
        { label: 'Contact', href: forceSolid ? '/#contact' : '#contact' },
    ];

    useEffect(() => {
        let ticking = false;

        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    if (window.scrollY > 100) {
                        setIsScrolled(true);
                    } else {
                        setIsScrolled(false);
                    }
                    ticking = false;
                });
                ticking = true;
            }
        };

        handleScroll();
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleNavClick = () => {
        closeChat();
        setIsMobileMenuOpen(false);
    };

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
            isSolid ? 'bg-white dark:bg-gray-900 shadow-md' : 'bg-transparent'
        }`}>
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16 sm:h-20">
                    {/* Logo */}
                    <a 
                        href="/" 
                        onClick={handleNavClick}
                        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                    >
                        <img src={logoIcon} alt="Estospaces" className="w-9 h-9 sm:w-10 sm:h-10 object-contain" />
                        <span className={`font-bold text-lg sm:text-xl ${isSolid ? 'text-gray-900 dark:text-white' : 'text-white'}`}>
                            Estospaces
                        </span>
                    </a>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        {navItems.map((item) => {
                            const active = activePath === item.href || (activePath === '/blogs' && item.href === '/blogs');
                            return (
                                <a
                                    key={item.label}
                                    href={item.href}
                                    onClick={handleNavClick}
                                    aria-current={active ? 'page' : undefined}
                                    className={`hover:text-primary transition-colors ${active ? 'text-primary font-semibold' : isSolid ? 'text-gray-700 dark:text-gray-300' : 'text-white'}`}
                                >
                                    {item.label}
                                </a>
                            );
                        })}
                        
                        <button
                            disabled
                            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg opacity-60 cursor-not-allowed transition-colors"
                        >
                            <UserPlus size={18} />
                            Coming Soon
                        </button>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className={`md:hidden p-2 rounded-lg ${isSolid ? 'text-gray-700 dark:text-gray-300' : 'text-white'}`}
                        aria-label="Toggle menu"
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                    <div className="container mx-auto px-4 py-4 space-y-3">
                        {navItems.map((item) => {
                            const active = activePath === item.href || (activePath === '/blogs' && item.href === '/blogs');
                            return (
                                <a
                                    key={item.label}
                                    href={item.href}
                                    onClick={handleNavClick}
                                    aria-current={active ? 'page' : undefined}
                                    className={`block py-2 hover:text-primary transition-colors ${active ? 'text-primary font-semibold' : 'text-gray-700 dark:text-gray-300'}`}
                                >
                                    {item.label}
                                </a>
                            );
                        })}
                        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                            <button
                                disabled
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg opacity-60 cursor-not-allowed transition-colors"
                            >
                                <UserPlus size={18} />
                                Coming Soon
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
