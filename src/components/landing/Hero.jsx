import React from 'react';
import useParallax from '../../hooks/useParallax';
import SearchBar from '../ui/SearchBar';

const backgroundVideo = '/assets/hero-section-video.mp4';

const Hero = () => {
    const offset = useParallax(0.5);
    const appSearchUrl = `${process.env.NEXT_PUBLIC_APP_BASE_URL || 'https://app.estospaces.com'}/search`;

    return (
        <div className="relative min-h-[620px] sm:min-h-[680px] lg:min-h-[760px] flex items-center justify-center overflow-hidden">
            {/* Background Video */}
            <div
                className="absolute inset-0 z-0 will-change-transform"
                style={{ transform: `translateY(${offset}px)` }}
            >
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                >
                    <source src={backgroundVideo} type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-black bg-opacity-40"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 container mx-auto px-4 sm:px-6 pt-16 sm:pt-20">
                <div className="text-center text-white mb-7 sm:mb-10 lg:mb-12">
                    <h1 className="text-4xl min-[360px]:text-5xl sm:text-6xl md:text-8xl font-medium mb-4 sm:mb-6 animate-fade-in-up leading-[0.95] font-serif tracking-normal">
                        <span className="text-white drop-shadow-lg">Discover your</span>
                        <span className="block mt-1 sm:mt-2 text-transparent bg-clip-text bg-gradient-to-r from-primary via-amber-400 to-orange-600 font-bold italic sm:pr-4 pb-2">
                            Dream Home
                        </span>
                    </h1>
                    <p className="px-1 text-base sm:text-xl md:text-2xl text-white max-w-[19rem] sm:max-w-3xl mx-auto animate-fade-in-up delay-100 font-light leading-relaxed drop-shadow-lg">
                        Experience properties like never before with immersive virtual tours and verified listings
                    </p>
                </div>

                {/* Search Form */}
                <div className="w-full max-w-5xl mx-auto bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-1 animate-fade-in-up delay-200 overflow-visible">
                    <SearchBar 
                        variant="hero" 
                        showAdvanced={true}
                        navigateOnSearch={true}
                        searchPath={appSearchUrl}
                    />
                </div>
            </div>
        </div>
    );
};

export default Hero;
