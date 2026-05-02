import React from 'react';
import { 
    ShieldCheck, 
    Zap, 
    Clock, 
    Sparkles, 
    View, 
    MapPin, 
    Activity, 
    BarChart3, 
    Users2, 
    MessageSquareMore 
} from 'lucide-react';
import { motion } from 'framer-motion';

const BigPromise = () => {
    const featureGroups = [
        {
            groupTitle: 'Trust & Speed',
            groupDescription: 'Move fast with confidence',
            features: [
                {
                    icon: <ShieldCheck size={28} />,
                    title: 'Verified Listings Only',
                    description: 'Every property is verified. No fake listings, no wasted visits.'
                },
                {
                    icon: <Zap size={28} />,
                    title: '24-Hour Fast Track',
                    description: 'From inquiry to site visit scheduled - all within a single day.'
                },
                {
                    icon: <Clock size={28} />,
                    title: '10-Minute Broker Response',
                    description: 'Get connected to the nearest verified broker in under 10 minutes.'
                }
            ]
        },
        {
            groupTitle: 'Smart Experience',
            groupDescription: 'Powered by AI and immersive tech',
            features: [
                {
                    icon: <Sparkles size={28} />,
                    title: 'AI Lakshmi - Your Property Guide',
                    description: 'Ask questions, get recommendations, and navigate listings effortlessly with AI.'
                },
                {
                    icon: <View size={28} />,
                    title: '360-degree Virtual Tours',
                    description: 'Walk through any property from your couch - immersive, realistic, and convenient.'
                },
                {
                    icon: <MapPin size={28} />,
                    title: 'Street View Integration',
                    description: 'Explore the neighborhood, nearby amenities, and surroundings before you visit.'
                }
            ]
        },
        {
            groupTitle: 'Broker Tools',
            groupDescription: 'Built for professionals who close deals',
            features: [
                {
                    icon: <Activity size={28} />,
                    title: 'Real-Time Monitoring',
                    description: 'Track visitor activity, engagement, and interest on your listings live.'
                },
                {
                    icon: <BarChart3 size={28} />,
                    title: 'Analytics Dashboard',
                    description: 'Deep insights into listing performance, lead quality, and conversion trends.'
                },
                {
                    icon: <MessageSquareMore size={28} />,
                    title: 'Built-In CRM',
                    description: 'Manage leads, follow-ups, and client communication - all in one place.'
                },
                {
                    icon: <Users2 size={28} />,
                    title: 'Broker Community',
                    description: 'Connect, collaborate, and co-broker with trusted professionals across India.'
                }
            ]
        }
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.8,
                ease: [0.2, 0.8, 0.2, 1]
            }
        }
    };

    return (
        <section id="features" className="py-16 sm:py-20 lg:py-28 bg-gray-50 dark:bg-gray-900 relative overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-gray-800/5 dark:bg-gray-600/5 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-primary/3 to-transparent rounded-full blur-3xl"></div>
            </div>

            <motion.div
                initial={{ opacity: 1, scale: 1 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
                className="container mx-auto px-4 relative z-10"
            >
                {/* Section Header */}
                <div className="text-center mb-12 sm:mb-16 lg:mb-20 max-w-3xl mx-auto">
                    <motion.span
                        initial={{ opacity: 1, y: 0 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
                        className="inline-block text-primary font-semibold text-sm tracking-normal uppercase mb-3 sm:mb-4"
                    >
                        Platform Features
                    </motion.span>
                    <motion.h2
                        initial={{ opacity: 1, y: 0 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
                        className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-4 sm:mb-6 tracking-normal leading-tight"
                    >
                        Everything You Need,{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-600">
                            One Platform.
                        </span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 1, y: 0 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                        className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl mx-auto"
                    >
                        A seamless experience for buyers and brokers - from discovery to deal closure.
                    </motion.p>
                </div>

                {/* Feature Groups */}
                <div className="space-y-14 sm:space-y-16 lg:space-y-20">
                    {featureGroups.map((group, groupIndex) => (
                        <motion.div
                            key={groupIndex}
                            initial={{ opacity: 1, y: 0 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.8, delay: groupIndex * 0.1 }}
                        >
                            {/* Group Header */}
                            <div className="text-center mb-8 sm:mb-10 lg:mb-12">
                                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2 tracking-normal">
                                    {group.groupTitle}
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 text-base">
                                    {group.groupDescription}
                                </p>
                            </div>

                            {/* Features Grid */}
                            <motion.div
                                variants={containerVariants}
                                initial="visible"
                                whileInView="visible"
                                viewport={{ once: true }}
                                className={`grid gap-4 sm:gap-6 ${
                                    group.features.length === 4 
                                        ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' 
                                        : 'grid-cols-1 md:grid-cols-3'
                                } max-w-6xl mx-auto`}
                            >
                                {group.features.map((feature, index) => (
                                    <motion.div
                                        key={index}
                                        variants={itemVariants}
                                        className="bg-white dark:bg-gray-800 p-6 sm:p-7 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 group transform hover:-translate-y-1 border border-gray-100 dark:border-gray-700 relative overflow-hidden"
                                    >
                                        {/* Hover accent line */}
                                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                                        {/* Icon */}
                                        <motion.div
                                            animate={{ y: [0, -4, 0] }}
                                            transition={{
                                                duration: 3,
                                                repeat: Infinity,
                                                ease: "easeInOut",
                                                delay: index * 0.3 + groupIndex * 0.5
                                            }}
                                            className="inline-flex items-center justify-center w-14 h-14 bg-primary/10 rounded-xl mb-5 group-hover:bg-primary transition-colors duration-300"
                                        >
                                            {React.cloneElement(feature.icon, { 
                                                className: "text-primary group-hover:text-white transition-colors duration-300"
                                            })}
                                        </motion.div>

                                        {/* Content */}
                                        <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-primary transition-colors duration-300">
                                            {feature.title}
                                        </h4>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                                            {feature.description}
                                        </p>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </motion.div>
                    ))}
                </div>

                {/* Bottom Trust Indicators */}
                <motion.div
                    initial={{ opacity: 1 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="mt-14 sm:mt-20 text-center"
                >
                    <div className="inline-flex flex-wrap items-center justify-center gap-3 sm:gap-8 text-gray-400 dark:text-gray-500 text-sm">
                        <span className="flex items-center gap-2">
                            <ShieldCheck size={18} className="text-green-500" />
                            100% Verified
                        </span>
                        <span className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></span>
                        <span className="flex items-center gap-2">
                            <Zap size={18} className="text-primary" />
                            AI-Powered
                        </span>
                        <span className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></span>
                        <span className="flex items-center gap-2">
                            <Users2 size={18} className="text-blue-500" />
                            Trusted by Brokers
                        </span>
                    </div>
                </motion.div>
            </motion.div>
        </section>
    );
};

export default BigPromise;
