import Navbar from './Navbar';
import Footer from './Footer';

export default function LandingChrome({ children, activePath = '/' }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar activePath={activePath} forceSolid />
      {children}
      <Footer />
    </div>
  );
}
