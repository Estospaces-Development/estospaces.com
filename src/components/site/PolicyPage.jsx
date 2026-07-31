import Footer from '../landing/Footer';
import Navbar from '../landing/Navbar';

export default function PolicyPage({
  eyebrow,
  title,
  description,
  updated = '31 July 2026',
  children,
}) {
  return (
    <div className="min-h-screen bg-white text-gray-950">
      <Navbar forceSolid />
      <main id="main-content" className="pt-20">
        <header className="border-b border-gray-200 bg-gray-50">
          <div className="container mx-auto max-w-4xl px-4 py-14 sm:px-6 sm:py-20">
            <p className="text-sm font-bold uppercase text-primary">{eyebrow}</p>
            <h1 className="mt-3 font-serif text-[clamp(2.7rem,6vw,5rem)] font-semibold leading-none">
              {title}
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-gray-600">{description}</p>
            <p className="mt-5 text-sm text-gray-500">Last updated: {updated}</p>
          </div>
        </header>
        <div className="container mx-auto max-w-4xl px-4 py-14 sm:px-6 sm:py-20">
          <div className="space-y-10">{children}</div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export function PolicySection({ title, children }) {
  return (
    <section>
      <h2 className="text-2xl font-bold text-gray-950">{title}</h2>
      <div className="mt-4 space-y-4 text-base leading-8 text-gray-700">{children}</div>
    </section>
  );
}

export function PolicyList({ children }) {
  return <ul className="list-disc space-y-2 pl-6">{children}</ul>;
}
