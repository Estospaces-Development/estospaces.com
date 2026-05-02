import React from 'react';
import Navbar from './Navbar';
import Hero from './Hero';
import BigPromise from './BigPromise';
import SneakPeek from './SneakPeek';
import Problem from './Problem';
import Solution from './Solution';
import SocialProof from './SocialProof';
import Testimonials from './Testimonials';
import WhyJoin from './WhyJoin';
import Countdown from './Countdown';
import FAQ from '../FAQ';
import FinalCTA from './FinalCTA';
import Footer from './Footer';

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main id="main-content">
        <Hero />
        <BigPromise />
        <SneakPeek />
        <Problem />
        <Solution />
        <SocialProof />
        <Testimonials />
        <WhyJoin />
        <Countdown />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
