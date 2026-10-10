// biome-ignore-all lint/a11y/noNoninteractiveTabindex: The horizontal comparison region must be keyboard-scrollable.
import { Bricolage_Grotesque, Geist, Geist_Mono } from 'next/font/google';
import Image from 'next/image';

import { siteConfig } from '../../config/site';
import { buildPropertySearchUrl } from '../../lib/search-url';
import PageActivityTracker from '../site/PageActivityTracker';
import TrackedButton from '../site/TrackedButton';
import TrackedLink from '../site/TrackedLink';
import { FloorPlan } from './HomeArt';
import { LiveClock, ShareButton, StickyCta } from './HomeMotion';
import HomePricing from './HomePricing';
import HomeSearch from './HomeSearch';
import HomeVideo from './HomeVideo';
import styles from './Home.module.css';

const display = Bricolage_Grotesque({
  subsets: ['latin'],
  axes: ['opsz'],
  display: 'swap',
  variable: '--font-display',
});
const body = Geist({ subsets: ['latin'], display: 'swap', variable: '--font-body' });
const mono = Geist_Mono({ subsets: ['latin'], display: 'swap', variable: '--font-mono' });

// Swapping the demo video only means replacing these files; update the length label with it.
const demo = {
  src: '/assets/landing/estospaces-demo.mp4',
  poster: '/assets/landing/estospaces-demo-poster.jpg',
  length: '2:17',
};

const { paths, videos } = siteConfig;
const rentUrl = buildPropertySearchUrl(paths.search, { type: 'rent' });
const buyUrl = buildPropertySearchUrl(paths.search, { type: 'sale' });
const youtube = (id) => `https://www.youtube.com/watch?v=${id}`;

const navLinks = [
  ['Rent', rentUrl],
  ['Buy', buyUrl],
  ['How it works', '#how'],
  ['For professionals', '#pros'],
  ['Pricing', '#pricing'],
  ['Security', paths.security],
];

const trust = [
  ['Verified professionals', 'Every lister is onboarded before a home goes live.'],
  ['A clock you can see', '10-minute response target. Measured, not guaranteed.'],
  ['Documents stay on the case', 'Share once — never forwarded around chats.'],
  ['Fast Track to a viewing', 'The aim: a viewing within 24 hours.'],
];

const listings = [
  {
    title: '2BHK apartment',
    place: 'Anna Nagar, Chennai',
    meta: '1,150 sq ft · Near metro',
    price: '₹38,000',
    unit: '/ month',
    avail: 'Available Nov',
    reply: '~6 min',
    plan: 'p2',
    photo: 'card-2bhk',
    alt: 'Sample photo: bright living room in a 2BHK apartment',
    sky: '#F7E4D3',
    ink: '#6B2C12',
    room: '#EFCBAB',
  },
  {
    title: '1-bed flat',
    place: 'Didsbury, Manchester',
    meta: '540 sq ft · Furnished',
    price: '£1,150',
    unit: 'pcm',
    avail: 'Available now',
    reply: '~9 min',
    plan: 'p1',
    photo: 'card-1bed',
    alt: 'Sample photo: brick terrace with coloured front doors in Didsbury',
    sky: '#E2E8F1',
    ink: '#2F3B52',
    room: '#C8D3E4',
  },
  {
    title: '3BHK villa',
    place: 'Whitefield, Bengaluru',
    meta: '2,400 sq ft · Gated',
    price: '₹1.6 Cr',
    unit: 'to buy',
    avail: 'New launch',
    reply: '~12 min',
    plan: 'pv',
    photo: 'card-villa',
    alt: 'Sample photo: modern villa lit at dusk',
    sky: '#E3EDDF',
    ink: '#2F4A35',
    room: '#C6DABF',
  },
  {
    title: 'Studio',
    place: 'Leith, Edinburgh',
    meta: '410 sq ft · Near tram',
    price: '£895',
    unit: 'pcm',
    avail: 'From 15 Nov',
    reply: '~8 min',
    plan: 'ps',
    photo: 'card-studio',
    alt: 'Sample photo: painted terrace houses in Edinburgh',
    sky: '#EAE4F1',
    ink: '#3E3A4C',
    room: '#D4CAE2',
  },
];

const mapRows = [
  ['#D9632B', '2BHK · Anna Nagar', '1,150 sq ft · near metro', '₹38k'],
  ['#8C3A17', '3BHK · Shenoy Nagar', '1,480 sq ft · pet-friendly', '₹52k'],
  ['#4F7A5A', '1BHK · Kilpauk', '640 sq ft · furnished', '₹24k'],
];

const pins = [
  [34, 20, '₹31k'],
  [60, 34, '₹52k'],
  [18, 54, '₹24k'],
  [70, 58, '₹45k'],
  [12, 14, '₹28k'],
];

const steps = [
  [
    '01 · Prepare',
    'Start with your requirements',
    'Area, budget, move-in date and must-haves — three quick questions.',
  ],
  [
    '02 · Discover',
    'Review supported options',
    'Homes from verified professionals in the areas we cover.',
  ],
  [
    '03 · Connect',
    'Send a focused enquiry',
    'Your brief goes with it, so you never repeat yourself on a call.',
  ],
  [
    '04 · Track',
    'See the reply and next action',
    'Who answered, how fast, and what they need from you.',
  ],
  [
    '05 · Progress',
    'Move to a viewing or application',
    'Documents and the viewing slot live on the same case.',
  ],
];

const photo = (name) => `/assets/landing/photos/${name}.webp`;

const shortlist = [
  ['thumb-2bhk', '2BHK · Anna Nagar', 'Viewing Sat', '#E5F2EA', '#1F6A44'],
  ['thumb-1bed', '1-bed · Didsbury', 'Replied', '#FBE9DD', '#9A3A0A'],
  ['thumb-villa', '3BHK villa · Whitefield', 'Docs sent', '#EEEBE6', '#4A443D'],
];

const days = [
  ['WED', '11'],
  ['THU', '12'],
  ['FRI', '13'],
  ['SAT', '14'],
  ['SUN', '15'],
];

const leads = [
  [
    'AR',
    '#FBE1D0',
    '#9A3A0A',
    'Ananya R. · 2BHK to rent',
    '₹35–40k · Move in Nov · Pet-friendly',
    '6:42',
  ],
  ['TH', '#DCE3EF', '#2F3B52', 'Tom H. · 1-bed flat', '£1,150 pcm · Didsbury', '8:15'],
  ['FZ', '#DDEBDF', '#1F6A44', 'Farhan & Zoya · 3BHK to buy', '₹1.6 Cr · Whitefield', 'Docs in'],
];

// Starting values for the illustrative "Waiting on you" timers (mm:ss as shown in the design).
const clockSeconds = { '6:42': 6 * 60 + 42, '8:15': 8 * 60 + 15 };

const comparison = [
  ['Browse homes', 'Yes'],
  ['Verified professional on every listing', 'Varies'],
  ['Your brief sent with every enquiry', '—'],
  ['Response time you can see', '—'],
  ['Documents kept with your case', '—'],
  ['Viewing tracked to the next step', '—'],
];

const faqs = [
  [
    'private-beta',
    'What does private beta mean?',
    'EstoSpaces is open for account registration while we bring areas and professionals online. Features and coverage vary by area, and we say so where it matters.',
  ],
  [
    'ten-minutes',
    'Is a reply within 10 minutes guaranteed?',
    'No. It is a response target professionals work to, and the time is measured and shown to you. Actual times vary.',
  ],
  [
    'fast-track',
    'What does Fast Track mean?',
    'Fast Track moves an active enquiry toward a viewing or application, with the aim of a viewing within 24 hours. It is an aim, not a promise.',
  ],
  [
    'agency',
    'Is EstoSpaces an estate agency?',
    'No. EstoSpaces is a software provider. Listings and viewings are handled by the verified professionals on the platform.',
  ],
  [
    'areas',
    'Which areas are supported?',
    'Coverage is limited and growing across India and the UK. The map and search show exactly where homes are available today.',
  ],
];

const footerGroups = [
  [
    'Access',
    [
      ['Create account', paths.register, 'create_account_clicked', 'create_account'],
      ['Log in', paths.login, 'login_clicked', 'login'],
      ['Professional access', paths.brokerRegister, 'broker_join_clicked', 'professional'],
    ],
  ],
  [
    'Company',
    [
      ['About', paths.about, 'navigation_clicked', 'about'],
      ['Security', paths.security, 'navigation_clicked', 'security'],
      ['Blog', paths.blog, 'navigation_clicked', 'blog'],
      ['Contact', paths.contact, 'contact_clicked', 'contact'],
    ],
  ],
  [
    'Follow',
    [
      ['X / Twitter', siteConfig.social.x, 'social_link_clicked', 'x'],
      ['Instagram', siteConfig.social.instagram, 'social_link_clicked', 'instagram'],
      ['LinkedIn', siteConfig.social.linkedin, 'social_link_clicked', 'linkedin'],
    ],
  ],
];

const cx = (...names) => names.filter(Boolean).join(' ');

function BrandMark({ size, iconSize, className }) {
  return (
    <span className={className} style={{ width: size, height: size }}>
      <svg
        aria-hidden="true"
        fill="none"
        height={iconSize}
        stroke="#FFFFFF"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.4"
        viewBox="0 0 24 24"
        width={iconSize}
      >
        <path d="M4 11.5 12 5l8 6.5V20H4z" />
        <path d="M10 20v-5h4v5" />
      </svg>
    </span>
  );
}

function Tick({ className, ...props }) {
  return (
    <span className={className} {...props}>
      <svg
        aria-hidden="true"
        fill="none"
        height="12"
        stroke="#FFFFFF"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3.4"
        viewBox="0 0 24 24"
        width="12"
      >
        <path d="m5 12 5 5 9-10" pathLength="1" />
      </svg>
    </span>
  );
}

const tickRow = (k) => ({ '--k': k });

export default function Home() {
  return (
    <div
      className={cx(styles.page, display.variable, body.variable, mono.variable)}
      data-home
      suppressHydrationWarning
    >
      <PageActivityTracker />
      <script defer src="/home-motion.js" />

      {/* ============ NAV ============ */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <a aria-label={`${siteConfig.name} home`} className={styles.brand} href="/">
            <BrandMark className={styles.brandMark} iconSize={18} size={34} />
            <span className={cx(styles.display, styles.brandName)}>estospaces</span>
          </a>
          <nav aria-label="Main" className={styles.nav}>
            {navLinks.map(([label, href]) => (
              <a className={styles.navLink} href={href} key={label}>
                {label}
              </a>
            ))}
          </nav>
          <div className={styles.access}>
            <TrackedLink
              className={styles.loginLink}
              eventName="login_clicked"
              eventProperties={{ placement: 'header' }}
              href={paths.login}
            >
              Log in
            </TrackedLink>
            <TrackedLink
              className={styles.signupBtn}
              eventName="create_account_clicked"
              eventProperties={{ placement: 'header' }}
              href={paths.register}
            >
              Create account
            </TrackedLink>
          </div>
        </div>
      </header>

      <main id="main-content">
        {/* ============ HERO ============ */}
        <section
          className={styles.hero}
          data-analytics-section="hero"
          data-hero
          data-live-only
          suppressHydrationWarning
          id="product"
        >
          {/* The thread: drawn by /home-motion.js from the beta dot into the case card. */}
          <div
            aria-hidden="true"
            className={styles.threadLayer}
            data-thread
            suppressHydrationWarning
          >
            <svg aria-hidden="true" className={styles.threadSvg} focusable="false">
              <path
                className={styles.threadPath}
                data-thread-path
                pathLength="1"
                suppressHydrationWarning
              />
            </svg>
            <span className={styles.bead} data-thread-bead suppressHydrationWarning />
          </div>

          <div className={styles.heroGrid}>
            <div className={styles.heroCopy}>
              <div className={cx(styles.badgeRow, styles.fade)}>
                <span className={styles.badge}>
                  <span aria-hidden="true" className={styles.badgeDot} data-thread-start />
                  Private beta · India &amp; the UK
                </span>
              </div>
              <h1 className={cx(styles.display, styles.h1)}>
                <span className={styles.word}>
                  <span className={styles.wordIn} style={{ '--w': 0 }}>
                    Homes
                  </span>
                </span>{' '}
                <span className={styles.word}>
                  <span className={styles.wordIn} style={{ '--w': 1 }}>
                    that
                  </span>
                </span>{' '}
                <span className={styles.accentText}>
                  <span className={styles.word}>
                    <span className={styles.wordIn} style={{ '--w': 2 }}>
                      answer
                    </span>
                  </span>
                  &nbsp;
                  <span className={styles.word}>
                    <span className={styles.wordIn} style={{ '--w': 3 }}>
                      back.
                    </span>
                  </span>
                </span>
              </h1>
              <p className={cx(styles.lede, styles.rise)} style={{ '--d': '0.45s' }}>
                Send one clear brief to verified professionals. See who replied, what they need, and
                when your viewing is — in one place, not scattered across calls and chats.
              </p>
              <dl
                className={cx(styles.stats, styles.rise)}
                data-reveal="group"
                suppressHydrationWarning
                style={{ '--d': '0.55s' }}
              >
                {[
                  [10, ' min', 'reply target, shown live'],
                  [24, ' h', 'Fast Track aim to a viewing'],
                  [1, ' case', 'brief, docs & viewing'],
                ].map(([value, unit, label]) => (
                  <div className={styles.stat} key={label}>
                    <dt className={cx(styles.mono, styles.statValue)}>
                      <span className={styles.num} style={{ '--to': value }} />
                      {unit}
                    </dt>
                    <dd className={styles.statLabel} style={{ margin: 0 }}>
                      {label}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className={cx(styles.heroVisual, styles.fade)} style={{ '--d': '0.2s' }}>
              <div className={styles.heroArt}>
                <Image
                  unoptimized
                  alt="Sample photo: apartment towers in Chennai"
                  className={styles.photo}
                  priority
                  height={1050}
                  src={photo('hero-anna-nagar')}
                  width={1200}
                />
                <span className={styles.heroPlace}>Anna Nagar, Chennai</span>
              </div>

              <figure aria-label="Example case: 2BHK in Anna Nagar" className={styles.caseCard}>
                <div className={styles.caseHead}>
                  <div className={styles.caseHeadText}>
                    <span className={styles.caseMeta}>Case #0418 · with Rahul K.</span>
                    <span className={cx(styles.display, styles.caseTitle)}>2BHK · Anna Nagar</span>
                  </div>
                  <span className={cx(styles.mono, styles.casePrice)}>₹38,000/mo</span>
                </div>
                <div className={styles.caseSteps}>
                  <div className={styles.caseStep} style={tickRow(0)}>
                    <Tick className={styles.stepDone} data-thread-end />
                    <span className={styles.caseStepGrow}>Brief sent</span>
                    <span className={cx(styles.mono, styles.caseTime)}>7:02 pm</span>
                  </div>
                  <div className={styles.caseStep} style={tickRow(1)}>
                    <Tick className={styles.stepDone} />
                    <span className={styles.caseStepGrow}>Rahul replied</span>
                    <span
                      className={styles.mono}
                      style={{ color: 'var(--green)', fontSize: 12, fontWeight: 600 }}
                    >
                      in <span className={styles.num} style={{ '--to': 6 }} /> min
                    </span>
                  </div>
                  <div className={styles.caseStep} style={tickRow(2)}>
                    <span aria-hidden="true" className={styles.stepNow} />
                    <span className={styles.caseStepGrow}>
                      <span style={{ fontWeight: 600 }}>Upload ID &amp; income proof</span>
                      <span aria-hidden="true" className={styles.progress}>
                        <span className={styles.progressFill} />
                      </span>
                    </span>
                    <span className={styles.caseTime}>2 of 3</span>
                  </div>
                  <div className={styles.caseStep} style={{ ...tickRow(3), color: 'var(--ink-3)' }}>
                    <span aria-hidden="true" className={styles.stepNext} />
                    <span className={styles.caseStepGrow}>Viewing</span>
                    <span className={cx(styles.mono, styles.caseTime)}>Sat · 11:00</span>
                  </div>
                </div>
              </figure>
            </div>
          </div>

          <div className={styles.searchWrap}>
            <HomeSearch searchUrl={paths.search} />
          </div>

          <div className={styles.trustWrap}>
            <ul className={styles.trust}>
              {trust.map(([title, text]) => (
                <li className={styles.trustItem} key={title}>
                  <strong>{title}</strong>
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ============ LISTINGS ============ */}
        <section
          aria-labelledby="listings-title"
          className={styles.section}
          data-analytics-section="listings"
          id="property-seekers"
        >
          <div className={cx(styles.wrap, styles.listings)}>
            <div className={styles.listingsHead}>
              <div className={styles.listingsHeadText}>
                <h2 className={cx(styles.display, styles.h2)} id="listings-title">
                  Fresh on EstoSpaces
                </h2>
                <p className={styles.subtle}>
                  Every home listed by a verified professional — with how fast they usually reply.
                </p>
              </div>
              <a className={styles.outlineBtn} href={paths.search}>
                Explore all homes
                <svg
                  aria-hidden="true"
                  fill="none"
                  height="16"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.2"
                  viewBox="0 0 24 24"
                  width="16"
                >
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </a>
            </div>

            <div className={styles.cards}>
              {listings.map((l, index) => (
                <article
                  className={styles.card}
                  data-reveal="rise"
                  suppressHydrationWarning
                  key={l.title}
                  style={{ '--d': `${index * 0.06}s` }}
                >
                  <div className={styles.thumb} style={{ background: l.sky }}>
                    <Image
                      unoptimized
                      alt={l.alt}
                      className={styles.photo}
                      height={720}
                      src={photo(l.photo)}
                      width={900}
                    />
                    <span className={styles.photoTag}>Sample photo</span>
                    <div className={styles.floorLayer} style={{ background: l.sky }}>
                      <FloorPlan
                        ink={l.ink}
                        plan={l.plan}
                        room={l.room}
                        sky={l.sky}
                        title={l.title}
                      />
                    </div>
                    <a className={styles.saveBtn} href={paths.register}>
                      <span className={styles.srOnly}>Save {l.title} (create an account)</span>
                      <svg
                        aria-hidden="true"
                        fill="none"
                        height="17"
                        stroke="#16130F"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        width="17"
                      >
                        <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />
                      </svg>
                    </a>
                  </div>
                  <div className={styles.cardBody}>
                    <div className={styles.cardRow}>
                      <h3 className={styles.cardTitle}>{l.title}</h3>
                      <span className={styles.avail}>{l.avail}</span>
                    </div>
                    <span className={styles.cardPlace}>{l.place}</span>
                    <span className={styles.cardMeta}>{l.meta} · Verified agent</span>
                    <div className={styles.cardFoot}>
                      <span className={styles.price}>
                        <strong>{l.price}</strong>{' '}
                        <span className={styles.priceUnit}>{l.unit}</span>
                      </span>
                      <span className={styles.reply}>
                        <span aria-hidden="true" className={styles.liveDot} />
                        Replies in {l.reply}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            <p className={styles.footnote}>
              Sample listings for design — fills from live inventory.
            </p>
          </div>
        </section>

        {/* ============ MAP ============ */}
        <section
          aria-labelledby="map-title"
          className={styles.section}
          data-analytics-section="map"
        >
          <div className={styles.wrap}>
            <div className={styles.mapCard}>
              <div className={styles.mapCopy}>
                <h2 className={cx(styles.display, styles.h2Map)} id="map-title">
                  See where you&apos;d actually live.
                </h2>
                <p className={styles.bodyText}>
                  Verified homes on one map, with price and typical reply time on every pin.
                  Coverage is growing area by area — the map shows exactly where we&apos;re live.
                </p>
                <ul className={styles.mapList}>
                  {mapRows.map(([color, title, meta, price]) => (
                    <li className={styles.mapRow} key={title}>
                      <span
                        aria-hidden="true"
                        className={styles.swatch}
                        style={{ background: color }}
                      />
                      <div className={styles.mapRowText}>
                        <strong>{title}</strong>
                        <span>{meta}</span>
                      </div>
                      <span className={cx(styles.mono, styles.mapRowPrice)}>{price}</span>
                    </li>
                  ))}
                </ul>
                <a className={styles.darkBtn} href={paths.search}>
                  Open the map
                </a>
              </div>

              <div
                aria-label="Illustrative map of homes with price pins"
                className={styles.map}
                data-reveal="group"
                suppressHydrationWarning
                role="img"
              >
                <svg
                  aria-hidden="true"
                  className={styles.mapSvg}
                  preserveAspectRatio="xMidYMid slice"
                  viewBox="0 0 620 600"
                >
                  <rect fill="#EFEAE2" height="600" width="620" />
                  <path
                    d="M-20 430 C 120 380, 200 470, 330 420 S 560 360, 660 400 L 660 640 L -20 640 Z"
                    fill="#CFE0E6"
                  />
                  <rect fill="#D7E5CF" height="110" rx="18" width="150" x="380" y="70" />
                  <rect fill="#D7E5CF" height="90" rx="16" width="110" x="60" y="210" />
                  <path d="M-10 150 L 640 110" stroke="#FFFFFF" strokeWidth="18" />
                  <path d="M-10 330 L 640 290" stroke="#FFFFFF" strokeWidth="14" />
                  <path d="M230 -10 L 270 620" stroke="#FFFFFF" strokeWidth="18" />
                  <path d="M470 -10 L 430 620" stroke="#FFFFFF" strokeWidth="12" />
                  <path
                    d="M60 -10 C 120 200, 40 380, 120 620"
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth="10"
                  />
                  <path d="M-10 240 L 640 220" stroke="#F7F4EF" strokeWidth="6" />
                  <path d="M350 -10 L 360 620" stroke="#F7F4EF" strokeWidth="6" />
                  <path d="M140 -10 L 160 620" stroke="#F7F4EF" strokeWidth="6" />
                  <path d="M560 -10 L 540 620" stroke="#F7F4EF" strokeWidth="6" />
                </svg>
                {pins.map(([left, top, price], index) => (
                  <span
                    className={cx(styles.mono, styles.pin)}
                    key={price}
                    style={{ left: `${left}%`, top: `${top}%`, '--i': index }}
                  >
                    {price}
                  </span>
                ))}
                <div className={styles.pinGroup}>
                  <span className={cx(styles.mono, styles.pin, styles.pinOn)}>₹38k</span>
                  <div className={styles.pinCard}>
                    <Image
                      unoptimized
                      alt=""
                      className={styles.pinCardSwatch}
                      height={56}
                      src={photo('thumb-2bhk')}
                      width={56}
                    />
                    <span className={styles.pinCardText}>
                      <strong>2BHK · Anna Nagar</strong>
                      <span>Replies in ~6 min</span>
                      <span className={styles.pinAvail}>Available Nov</span>
                    </span>
                  </div>
                </div>
                <div className={styles.mapNote}>Illustrative map</div>
              </div>
            </div>
          </div>
        </section>

        {/* ============ HOW IT WORKS ============ */}
        <section
          aria-labelledby="how-title"
          className={styles.section}
          data-analytics-section="how_it_works"
          id="how"
        >
          <span aria-hidden="true" id="journey" />
          <div className={cx(styles.wrap, styles.how)}>
            <div className={styles.howHead}>
              <h2 className={cx(styles.display, styles.h2How)} id="how-title">
                Everything after “I&apos;m interested” — handled.
              </h2>
              <p className={styles.howLede}>
                Other sites stop at the listing. EstoSpaces keeps the next useful step in view until
                you&apos;re standing in the home.
              </p>
            </div>

            <ol className={styles.steps} data-journey suppressHydrationWarning>
              {steps.map(([num, title, text], index) => (
                <li
                  className={styles.step}
                  key={num}
                  style={{ '--at': (index * 0.2 + 0.03).toFixed(2) }}
                >
                  <span aria-hidden="true" className={styles.stepDot} />
                  <span className={cx(styles.mono, styles.stepNum)}>{num}</span>
                  <strong>{title}</strong>
                  <span>{text}</span>
                </li>
              ))}
            </ol>

            <div className={styles.bento}>
              <div className={styles.tile} data-reveal="rise" suppressHydrationWarning>
                <div className={styles.tileHead}>
                  <h3>Shortlist, compare, decide</h3>
                  <p>Every saved home shows exactly where it stands.</p>
                </div>
                <ul className={styles.shortlist}>
                  {shortlist.map(([thumb, name, tag, tagBg, tagColor], index) => (
                    <li className={styles.shortRow} key={name} style={{ '--i': index }}>
                      <Image
                        unoptimized
                        alt=""
                        className={styles.shortThumb}
                        height={36}
                        src={photo(thumb)}
                        width={36}
                      />
                      <span className={styles.shortName}>{name}</span>
                      <span className={styles.tag} style={{ background: tagBg, color: tagColor }}>
                        {tag}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div
                className={cx(styles.tile, styles.tileDark, styles.onDark)}
                data-reveal="rise"
                suppressHydrationWarning
                style={{ '--d': '0.06s' }}
              >
                <div className={styles.tileHead}>
                  <h3>Hear back, fast</h3>
                  <p>
                    Professionals work to a 10-minute response target — and you can see the clock.
                  </p>
                </div>
                <div className={styles.clock}>
                  <div className={styles.ring}>
                    <svg aria-hidden="true" height="120" viewBox="0 0 120 120" width="120">
                      <circle
                        cx="60"
                        cy="60"
                        fill="none"
                        r="52"
                        stroke="#2E2924"
                        strokeWidth="10"
                      />
                      <circle
                        cx="60"
                        cy="60"
                        fill="none"
                        className={styles.arc}
                        r="52"
                        stroke="#C8460D"
                        strokeDasharray="230 327"
                        strokeLinecap="round"
                        strokeWidth="10"
                        transform="rotate(-90 60 60)"
                      />
                    </svg>
                    <span className={cx(styles.mono, styles.ringTime)}>6:12</span>
                  </div>
                  <span className={styles.clockNote}>
                    A target, not a guarantee. Actual times vary and are shown honestly.
                  </span>
                </div>
              </div>

              <div
                className={styles.tile}
                data-reveal="rise"
                suppressHydrationWarning
                style={{ '--d': '0.12s' }}
              >
                <div className={styles.tileHead}>
                  <h3>Viewings, booked</h3>
                  <p>Fast Track aims to get you to a viewing within 24 hours.</p>
                </div>
                <ul className={styles.days}>
                  {days.map(([name, num]) => (
                    <li className={cx(styles.day, name === 'SAT' && styles.dayOn)} key={name}>
                      <span className={styles.dayName}>{name}</span>
                      <span className={styles.dayNum}>{num}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ============ VIDEO + TUTORIALS ============ */}
        <section
          aria-labelledby="learn-title"
          className={styles.section}
          data-analytics-section="overview_video"
          id="overview-video"
        >
          <div className={cx(styles.wrap, styles.videoRow)}>
            <HomeVideo
              length={demo.length}
              poster={demo.poster}
              src={demo.src}
              title="See EstoSpaces in 2 minutes."
            />
            <div className={styles.learn}>
              <h3 className={cx(styles.display, styles.h3Learn)} id="learn-title">
                Learn it live, in the real app.
              </h3>
              {[
                ['For property seekers', 'From account setup to agreement and keys', videos.user],
                [
                  'For brokers & managers',
                  'Listings, leads, Fast Track, documents and viewings',
                  videos.manager,
                ],
              ].map(([who, title, video]) => (
                <a
                  className={styles.learnCard}
                  href={youtube(video.id)}
                  key={who}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <span className={styles.learnWho}>{who}</span>
                  <strong>{title}</strong>
                  <span className={styles.learnFoot}>
                    <span>{video.chapters.length} chapters</span>
                    <span>
                      Watch <span aria-hidden="true">→</span>
                      <span className={styles.srOnly}> on YouTube (opens in a new tab)</span>
                    </span>
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* ============ PROFESSIONALS ============ */}
        <section
          aria-labelledby="pros-title"
          className={styles.section}
          data-analytics-section="professionals"
          id="pros"
        >
          <span aria-hidden="true" id="brokers" />
          <div className={styles.wrap}>
            <div className={cx(styles.pros, styles.onDark)}>
              <div className={styles.prosCopy}>
                <span className={styles.prosKicker}>For brokers &amp; property managers</span>
                <h2 className={cx(styles.display, styles.h2)} id="pros-title">
                  Turn enquiries into viewings —{' '}
                  <span className={styles.prosAccent}>not WhatsApp chaos.</span>
                </h2>
                <p className={styles.prosLede}>
                  Enquiries arrive with a real brief. Your queue shows who&apos;s waiting and for
                  how long. Documents and viewings stay on one case — so nothing depends on whose
                  phone it landed on.
                </p>
                <div className={styles.btnRow}>
                  <TrackedLink
                    className={styles.accentBtn}
                    eventName="broker_join_clicked"
                    eventProperties={{ placement: 'professionals' }}
                    href={paths.brokerRegister}
                  >
                    List your properties
                  </TrackedLink>
                  <TrackedLink
                    className={styles.ghostBtn}
                    eventName="login_clicked"
                    eventProperties={{ placement: 'professionals' }}
                    href={paths.login}
                  >
                    Partner log in
                  </TrackedLink>
                </div>
              </div>

              <div className={styles.queue} data-reveal="group" suppressHydrationWarning>
                <div className={styles.queueHead}>
                  <span className={styles.queueTitle}>
                    <span aria-hidden="true" className={styles.queueDot} />
                    Waiting on you
                  </span>
                  <span className={styles.queueNote}>Illustrative</span>
                </div>
                {leads.map(([initials, bg, color, name, detail, badge], index) => (
                  <div
                    className={cx(styles.lead, index === 0 && styles.leadHot)}
                    key={initials}
                    style={{ '--i': index }}
                  >
                    <span
                      aria-hidden="true"
                      className={styles.avatar}
                      style={{ background: bg, color }}
                    >
                      {initials}
                    </span>
                    <span className={styles.leadText}>
                      <strong>{name}</strong>
                      <span>{detail}</span>
                    </span>
                    {index === 2 ? (
                      <span className={cx(styles.leadBadge, styles.leadBadgePlain)}>{badge}</span>
                    ) : (
                      <LiveClock
                        className={cx(styles.leadBadge, styles.mono)}
                        from={clockSeconds[badge]}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ============ PRICING ============ */}
        <section
          aria-labelledby="pricing-title"
          className={styles.section}
          data-analytics-section="pricing"
          id="pricing"
        >
          <div className={cx(styles.wrap, styles.pricing)}>
            <div className={styles.pricingHead}>
              <span className={styles.pricingKicker}>For brokers &amp; property managers</span>
              <h2 className={cx(styles.display, styles.h2)} id="pricing-title">
                Pricing
              </h2>
              <p className={styles.pricingLede}>
                Every new manager gets Growth free for 60 days. We don&apos;t take card details and
                won&apos;t charge you automatically.
              </p>
            </div>
            <HomePricing registerUrl={paths.brokerRegister} />
            <p className={styles.pricingTerms}>
              After 60 days you move to Free unless you choose a plan. Your price is set by your
              verified billing market at checkout. Secure checkout by Razorpay.
            </p>
          </div>
        </section>

        {/* ============ COMPARISON ============ */}
        <section
          aria-labelledby="compare-title"
          className={styles.section}
          data-analytics-section="comparison"
        >
          <div className={cx(styles.wrap, styles.compare)}>
            <h2 className={cx(styles.display, styles.h2)} id="compare-title">
              More than another listings site.
            </h2>
            <div>
              <section
                aria-describedby="comparison-scroll-hint"
                aria-labelledby="compare-title"
                className={styles.tableWrap}
                tabIndex={0}
              >
                <table className={styles.table} data-reveal="group" suppressHydrationWarning>
                  <thead>
                    <tr>
                      <th scope="col">What you get</th>
                      <th scope="col">Typical portal</th>
                      <th className={styles.us} scope="col">
                        EstoSpaces
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparison.map(([feature, portal], index) => (
                      <tr key={feature} style={{ '--i': index }}>
                        <td>{feature}</td>
                        <td className={portal === 'Yes' ? undefined : styles.muted}>
                          {portal === '—' ? (
                            <>
                              <span aria-hidden="true">—</span>
                              <span className={styles.srOnly}>No</span>
                            </>
                          ) : (
                            portal
                          )}
                        </td>
                        <td className={styles.usCell}>
                          <svg
                            aria-hidden="true"
                            className={styles.yesTick}
                            fill="none"
                            height="14"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="3"
                            viewBox="0 0 24 24"
                            width="14"
                          >
                            <path d="m5 12 5 5 9-10" pathLength="1" />
                          </svg>
                          Yes
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
              <p className={styles.scrollHint} id="comparison-scroll-hint">
                Swipe or use the left and right arrow keys to see the whole table.
              </p>
            </div>
          </div>
        </section>

        {/* ============ FAQ ============ */}
        <section
          aria-labelledby="faq-title"
          className={styles.section}
          data-analytics-section="faq"
          id="faq"
        >
          <div className={cx(styles.wrap, styles.faqRow)}>
            <div className={styles.faqIntro}>
              <h2 className={cx(styles.display, styles.h2Faq)} id="faq-title">
                Details, stated plainly.
              </h2>
              <p style={{ fontSize: 16, color: 'var(--ink-2)' }}>
                Can&apos;t find it?{' '}
                <a className={styles.inlineLink} href={paths.contact}>
                  Talk to our team
                </a>
                .
              </p>
            </div>
            <div className={styles.faqList}>
              {faqs.map(([key, question, answer], index) => (
                <details
                  className={styles.faqItem}
                  data-analytics-item={key}
                  key={key}
                  name="home-faq"
                  open={index === 0}
                >
                  <summary className={styles.faqQ}>
                    <span>{question}</span>
                    <span aria-hidden="true" className={styles.faqSign} />
                  </summary>
                  <p className={styles.faqA}>{answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ============ FINAL CTA ============ */}
        <section
          aria-labelledby="cta-title"
          className={styles.section}
          data-analytics-section="final_cta"
          data-hide-sticky
          style={{ paddingBottom: 'var(--section)' }}
        >
          <div className={styles.wrap}>
            <div
              className={cx(styles.cta, styles.onDark)}
              data-reveal="group"
              suppressHydrationWarning
            >
              {/* The same house as the logo, drawn by the thread (white here: the panel is the accent colour). */}
              <svg
                aria-hidden="true"
                className={styles.house}
                fill="none"
                focusable="false"
                height="72"
                stroke="#FFFFFF"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1"
                viewBox="0 0 24 24"
                width="72"
              >
                <path d="M4 11.5 12 5l8 6.5V20H4z" pathLength="1" />
                <path d="M10 20v-5h4v5" pathLength="1" />
              </svg>
              <h2 className={cx(styles.display, styles.h2Cta)} id="cta-title">
                Your next home is one clear brief away.
              </h2>
              <p className={styles.ctaLede}>
                Create a free account, set your brief and start hearing back from verified
                professionals.
              </p>
              <div className={styles.ctaBtnRow}>
                <TrackedLink
                  className={styles.whiteBtn}
                  eventName="create_account_clicked"
                  eventProperties={{ placement: 'final_cta' }}
                  href={paths.register}
                >
                  Create account
                </TrackedLink>
                <a className={styles.outlineWhiteBtn} href="#pros">
                  I&apos;m a professional
                </a>
              </div>
              <ShareButton className={styles.ctaShare} />
            </div>
          </div>
        </section>
      </main>

      {/* ============ FOOTER ============ */}
      <footer className={styles.footer} data-hide-sticky>
        <div className={styles.footerInner}>
          <div className={styles.footerGrid}>
            <div className={styles.footerBrand}>
              <span className={styles.footerBrandRow}>
                <BrandMark className={styles.footerMark} iconSize={16} size={30} />
                <span className={cx(styles.display, styles.footerName)}>estospaces</span>
              </span>
              <span>Clear steps for the property journey — from first search to the keys.</span>
            </div>
            {footerGroups.map(([heading, links]) => (
              <nav aria-label={heading} className={styles.footerNav} key={heading}>
                <h2>{heading}</h2>
                {links.map(([label, href, eventName, destination]) => {
                  const external = href.startsWith('http') && !href.includes('app.estospaces.com');
                  return (
                    <TrackedLink
                      className={styles.footerLink}
                      eventName={eventName}
                      eventProperties={{ placement: 'footer', destination }}
                      href={href}
                      key={label}
                      rel={external ? 'noreferrer' : undefined}
                      target={external ? '_blank' : undefined}
                    >
                      {label}
                    </TrackedLink>
                  );
                })}
              </nav>
            ))}
          </div>
          <div className={styles.footerBase}>
            <span>
              © {new Date().getFullYear()} EstoSpaces · {siteConfig.legalEntities.india.name}{' '}
              (India) · {siteConfig.legalEntities.unitedKingdom.name} (UK)
            </span>
            <span className={styles.legal}>
              <a href={paths.privacy}>Privacy</a>
              <a href={paths.terms}>Terms</a>
              <a href={paths.cookies}>Cookies</a>
              {siteConfig.analyticsMeasurementId || siteConfig.salesIqWidgetUrl ? (
                <TrackedButton
                  data-cookie-preferences
                  eventName="cookie_preferences_opened"
                  eventProperties={{ placement: 'footer' }}
                  type="button"
                >
                  Cookie preferences
                </TrackedButton>
              ) : null}
            </span>
          </div>
        </div>
      </footer>

      <StickyCta registerUrl={paths.register} />
    </div>
  );
}
