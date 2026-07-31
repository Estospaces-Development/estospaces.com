import Footer from '../landing/Footer';
import Navbar from '../landing/Navbar';

export default function BlogChrome({ children, activePath = '/blogs' }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar activePath={activePath} forceSolid />
      {children}
      <Footer />
    </div>
  );
}
