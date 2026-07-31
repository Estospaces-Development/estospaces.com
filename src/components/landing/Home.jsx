// biome-ignore-all lint/a11y/noNoninteractiveTabindex: The horizontal comparison region must be keyboard-scrollable.
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import Image from 'next/image';

import { siteConfig } from '../../config/site';
import TrackedLink from '../site/TrackedLink';
import TrackedSection from '../site/TrackedSection';
import { JourneyRoute, LandingHero, SectionReveal } from './LandingMotion';
import Footer from './Footer';
import Navbar from './Navbar';
import styles from './Landing.module.css';

const workflow = [
  {
    number: '01',
    label: 'Prepare',
    title: 'Start with your requirements',
    body: 'Create an account and record the area, property type, timing, and practical constraints that matter to you.',
    note: 'The registration route is available; completed access remains release-gated.',
  },
  {
    number: '02',
    label: 'Discover',
    title: 'Review supported options',
    body: 'When the production search service passes release checks, review current property information in supported areas.',
    note: 'Coverage and inventory vary by area.',
  },
  {
    number: '03',
    label: 'Connect',
    title: 'Send a focused enquiry',
    body: 'Where professional coverage is available, share the relevant property and context with a participating broker or manager.',
    note: 'Availability depends on operating coverage.',
  },
  {
    number: '04',
    label: 'Track',
    title: 'See the response and next action',
    body: 'Keep messages, requested information, and the next useful action connected to one property journey.',
    note: 'Ten minutes is a response target, not a guarantee.',
  },
  {
    number: '05',
    label: 'Progress',
    title: 'Move toward a viewing or application',
    body: 'Fast Track is designed to help an active enquiry progress without losing sight of the people, documents, or decisions involved.',
    note: 'The 24-hour aim is progress, not completion.',
  },
];

const productScreens = [
  {
    number: '01',
    label: 'Seeker dashboard',
    title: 'Search from one clear home base',
    body: 'A cropped private-beta capture showing the real seeker dashboard, property search controls, and direct access to activity and messages.',
    src: '/assets/landing/product-proof-seeker-fast-track.webp',
    width: 1120,
    height: 609,
    alt: 'EstoSpaces seeker dashboard showing property search controls and primary navigation',
    href: siteConfig.paths.register,
    action: 'Request seeker access',
    eventName: 'create_account_clicked',
    eventPlacement: 'product_proof_seeker',
    route: '/dashboard',
  },
  {
    number: '02',
    label: 'Manager dashboard',
    title: 'See active work at a glance',
    body: 'A cropped private-beta capture showing the real manager dashboard with Fast Track activity, listings, leads, applications, and performance context.',
    src: '/assets/landing/product-proof-manager-fast-track.webp',
    width: 1120,
    height: 609,
    alt: 'EstoSpaces property manager dashboard showing Fast Track, listings, leads, applications, and performance metrics',
    href: siteConfig.paths.brokerRegister,
    action: 'Request manager access',
    eventName: 'broker_join_clicked',
    eventPlacement: 'product_proof_manager',
    route: '/manager/dashboard',
  },
];

const seekerSteps = [
  ['Set the brief', 'Record what you need before starting the property journey.'],
  [
    'Keep context together',
    'Return to the property, enquiry, messages, and requested information.',
  ],
  [
    'See the next action',
    'Understand what is waiting on you and what is waiting on the professional.',
  ],
  ['Use Fast Track', 'Progress an eligible enquiry toward a viewing or application.'],
];

const professionalSteps = [
  ['Complete onboarding', 'Follow the onboarding steps shown before using professional features.'],
  [
    'Receive useful context',
    'See the property and enquiry details needed for a relevant response.',
  ],
  [
    'Manage active cases',
    'Keep time-sensitive next actions visible across active property journeys.',
  ],
  ['Review response timing', 'Track performance against the private-beta operating target.'],
];

const comparisonRows = [
  {
    feature: 'Property discovery',
    estoSpaces: 'Release-gated beta',
    magicBricks: 'Publicly offered',
    acres: 'Publicly offered',
    housing: 'Publicly offered',
    noBroker: 'Publicly offered',
  },
  {
    feature: 'Connect with a professional or owner',
    estoSpaces: 'Participating professionals',
    magicBricks: 'Buyer and seller connections',
    acres: 'Owners, brokers, and builders',
    housing: 'Owners, brokers, and builders',
    noBroker: 'Owner-first plus service teams',
  },
  {
    feature: 'Property or participant verification',
    estoSpaces: 'Private-beta workflow',
    magicBricks: 'Service-specific checks vary',
    acres: 'Verified-listing signals',
    housing: 'Broker verification products',
    noBroker: 'Tenant and legal checks',
  },
  {
    feature: 'Time-bound response workflow',
    estoSpaces: '10-minute operating target',
    magicBricks: 'No equivalent target confirmed',
    acres: 'No equivalent target confirmed',
    housing: 'No equivalent target confirmed',
    noBroker: 'No equivalent target confirmed',
  },
  {
    feature: 'Connected transaction case workspace',
    estoSpaces: 'Fast Track beta workflow',
    magicBricks: 'Service-specific assistance',
    acres: 'No equivalent workspace confirmed',
    housing: 'No equivalent workspace confirmed',
    noBroker: 'Property-management services',
  },
  {
    feature: 'Documents linked to case progress',
    estoSpaces: 'Designed into Fast Track',
    magicBricks: 'Loan and service contexts',
    acres: 'No equivalent workspace confirmed',
    housing: 'No equivalent workspace confirmed',
    noBroker: 'Agreement and legal services',
  },
  {
    feature: 'Professional operations view',
    estoSpaces: 'Private-beta manager workflow',
    magicBricks: 'Business tools vary',
    acres: 'Listing and lead tools',
    housing: 'Broker partner products',
    noBroker: 'Relationship-manager services',
  },
];

const traditionalJourney = [
  'Search across listings',
  'Contact several people',
  'Wait for callbacks',
  'Move the conversation to calls or messaging apps',
  'Exchange files separately',
  'Arrange appointments elsewhere',
  'Track progress yourself',
];

const connectedJourney = [
  'Set a clear property brief',
  'Review supported property options',
  'Connect with a participating professional',
  'Track the response target',
  'Shortlist the relevant property',
  'Use Fast Track for an eligible case',
  'Keep documents, messages, and next actions together',
  'Progress toward a viewing or application',
];

const trustSignals = [
  'Onboarding and verification workflows',
  'Property responsibility kept visible',
  'Secure document handling by design',
  'Connected case timeline',
  'Activity history',
  'Guided next actions',
  'Transparent operating limits',
];

const audienceUseCases = [
  {
    audience: 'Property seekers',
    items: [
      'Find supported options when search is released',
      'Request a relevant professional connection',
      'Track each active next action',
      'Keep case documents and messages together',
    ],
  },
  {
    audience: 'Brokers and managers',
    items: [
      'Manage inventory and enquiry context',
      'Respond within the live operating window',
      'Share relevant property options',
      'Manage active cases, appointments, and contracts',
    ],
  },
];

const evidence = [
  {
    signal: 'Response target',
    status: '10 minutes',
    detail:
      'Participating professionals during supported operating periods. Actual response time varies.',
  },
  {
    signal: 'Fast Track aim',
    status: 'Within 24 hours',
    detail:
      'Progress toward a viewing or application. It is not a tenancy or purchase completion promise.',
  },
  {
    signal: 'Platform role',
    status: 'Software provider',
    detail:
      'No estate-agency status is claimed. Property professionals remain responsible for their services.',
  },
  {
    signal: 'Availability',
    status: 'Private beta',
    detail: 'Access, inventory, and professional coverage are limited and vary by area.',
  },
];

const faqs = [
  {
    question: 'What does private beta mean?',
    answer:
      'EstoSpaces is available to a limited group while product reliability, property coverage, and operating processes are validated. Features and availability can change during this period.',
  },
  {
    question: 'Is a professional response guaranteed within 10 minutes?',
    answer:
      'No. Participating professionals are measured against a 10-minute response target during supported operating periods. Actual response times vary with coverage, availability, and operating conditions.',
  },
  {
    question: 'What does Fast Track promise?',
    answer:
      'Fast Track is designed to help move an enquiry toward a viewing or application within 24 hours. It does not guarantee that a rental or purchase will complete within 24 hours.',
  },
  {
    question: 'Is EstoSpaces an estate agency?',
    answer:
      'No agency status is claimed. EstoSpaces is software backed by Estospaces Solutions Private Limited in India and Estospaces Solutions Limited in the United Kingdom. Property professionals remain responsible for their services and property information.',
  },
  {
    question: 'Which areas are supported?',
    answer:
      'Coverage is being validated area by area during private beta. Inventory and participating-professional availability vary, and public search will only be promoted after its production release checks pass.',
  },
];

export default function Home() {
  return (
    <div className={styles.page}>
      <Navbar />
      <main id="main-content">
        <LandingHero
          brokerRegisterPath={siteConfig.paths.brokerRegister}
          loginPath={siteConfig.paths.login}
          registerPath={siteConfig.paths.register}
          searchNotice="Property search is not available in this public beta yet."
        />

        <section aria-label="Current product status" className={styles.statusLedger}>
          <div className={styles.statusLedgerInner}>
            <div className={styles.statusLead}>
              <span>Current field status</span>
              <strong>Private beta</strong>
            </div>
            <div>
              <span>Platform role</span>
              <strong>Software provider</strong>
            </div>
            <div>
              <span>Operating targets</span>
              <strong>Measured, not guaranteed</strong>
            </div>
            <div>
              <span>Area coverage</span>
              <strong>Limited and variable</strong>
            </div>
          </div>
        </section>

        {siteConfig.features.showProductScreenshots ? (
          <TrackedSection
            aria-labelledby="product-proof-title"
            className={styles.productProofSection}
            eventName="product_preview_viewed"
            eventProperties={{ placement: 'product_proof' }}
            id="product-proof"
          >
            <div className={styles.productProofIntro}>
              <div>
                <p className={styles.sectionCode}>Field proof / Live application access</p>
                <h2 id="product-proof-title">The workspace behind the promise.</h2>
              </div>
              <div className={styles.productProofContext}>
                <p>
                  Real, sanitized private-beta captures show the current seeker and manager
                  dashboards. Access, inventory, workflow availability, and the test figures shown
                  remain limited to the beta environment.
                </p>
                <span>Captured 10 July 2026 / Test data only / Cropped for clarity</span>
              </div>
            </div>

            <div className={styles.productProofGrid}>
              {productScreens.map((screen) => (
                <article className={styles.productProofCard} key={screen.title}>
                  <div aria-hidden="true" className={styles.productProofBrowser}>
                    <span>
                      <i />
                      <i />
                      <i />
                    </span>
                    <p>{screen.route}</p>
                    <b>PRIVATE BETA</b>
                  </div>
                  <div className={styles.productProofViewport}>
                    <Image
                      alt={screen.alt}
                      height={screen.height}
                      sizes="(max-width: 767px) calc(100vw - 34px), (max-width: 1023px) 78vw, 44vw"
                      src={screen.src}
                      unoptimized
                      width={screen.width}
                    />
                  </div>
                  <div className={styles.productProofCaption}>
                    <div>
                      <span>{screen.number}</span>
                      <p>{screen.label}</p>
                    </div>
                    <h3>{screen.title}</h3>
                    <p>{screen.body}</p>
                    <TrackedLink
                      eventName={screen.eventName}
                      eventProperties={{ placement: screen.eventPlacement }}
                      href={screen.href}
                    >
                      {screen.action} <ArrowUpRight aria-hidden="true" size={17} />
                    </TrackedLink>
                  </div>
                </article>
              ))}
            </div>
          </TrackedSection>
        ) : null}

        <JourneyRoute stages={workflow} />

        <section className={styles.relaySection} id="relay">
          <div aria-hidden="true" className={styles.relayAxis}>
            <span>02</span>
          </div>
          <div className={styles.sectionIntro}>
            <p className={styles.sectionCode}>Chapter 02 / The relay</p>
            <h2>One journey. Clear responsibility on both sides.</h2>
            <p>
              EstoSpaces connects the seeker’s next action with the professional’s operating
              context. It does not blur who is responsible for the property information or service.
            </p>
          </div>

          <div className={styles.relayGrid}>
            <SectionReveal className={styles.relayPanel}>
              <div className={styles.relayHeader}>
                <p>Property seeker</p>
                <span>01 / 02</span>
              </div>
              <h3>Understand what happens next.</h3>
              <ol className={styles.relayList}>
                {seekerSteps.map(([title, body], index) => (
                  <li key={title}>
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <div>
                      <strong>{title}</strong>
                      <p>{body}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <TrackedLink
                className={styles.textAction}
                eventName="create_account_clicked"
                eventProperties={{ placement: 'seeker_journey' }}
                href={siteConfig.paths.register}
              >
                Request seeker access <ArrowUpRight aria-hidden="true" size={17} />
              </TrackedLink>
            </SectionReveal>

            <SectionReveal className={styles.relayPanel} delay={0.08}>
              <div className={styles.relayHeader}>
                <p>Broker or manager</p>
                <span>02 / 02</span>
              </div>
              <h3>Respond with the right context.</h3>
              <ol className={styles.relayList}>
                {professionalSteps.map(([title, body], index) => (
                  <li key={title}>
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <div>
                      <strong>{title}</strong>
                      <p>{body}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <TrackedLink
                className={styles.textAction}
                eventName="broker_join_clicked"
                eventProperties={{ placement: 'professional_journey' }}
                href={siteConfig.paths.brokerRegister}
              >
                Discuss professional access <ArrowUpRight aria-hidden="true" size={17} />
              </TrackedLink>
            </SectionReveal>
          </div>
        </section>

        <section className={styles.differenceSection} id="difference">
          <div aria-hidden="true" className={styles.differenceAxis}>
            <span>03</span>
          </div>
          <SectionReveal className={styles.sectionIntro}>
            <p className={styles.sectionCode}>Chapter 03 / The difference</p>
            <h2>More than another property portal.</h2>
            <p>
              Most portals are built to help people discover properties. EstoSpaces is being built
              to keep the work after discovery connected: professional contact, response context,
              documents, viewings, and the next action in one case record.
            </p>
          </SectionReveal>

          <SectionReveal className={styles.comparisonBlock}>
            <div className={styles.comparisonHeading}>
              <div>
                <span>Comparative field note</span>
                <h3>Compare the public product shape.</h3>
              </div>
              <div className={styles.comparisonCaveat}>
                <p>
                  &ldquo;Not confirmed&rdquo; means an equivalent capability was not found in the
                  public materials reviewed. It does not mean the competitor cannot offer it
                  privately or in another service.
                </p>
                <span>Public materials reviewed July 2026</span>
              </div>
            </div>

            <section
              aria-label="Scrollable comparison of public property-platform capabilities"
              aria-describedby="comparison-scroll-hint"
              className={styles.comparisonScroll}
              tabIndex={0}
            >
              <table className={styles.comparisonTable}>
                <caption>
                  EstoSpaces and named property platforms, based on public product materials
                  reviewed in July 2026
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Capability</th>
                    <th className={styles.estoColumn} scope="col">
                      EstoSpaces
                    </th>
                    <th scope="col">MagicBricks</th>
                    <th scope="col">99acres</th>
                    <th scope="col">Housing.com</th>
                    <th scope="col">NoBroker</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row) => (
                    <tr key={row.feature}>
                      <th scope="row">{row.feature}</th>
                      <td className={styles.estoColumn}>{row.estoSpaces}</td>
                      <td>{row.magicBricks}</td>
                      <td>{row.acres}</td>
                      <td>{row.housing}</td>
                      <td>{row.noBroker}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
            <p className={styles.comparisonScrollHint} id="comparison-scroll-hint">
              Swipe or use the left and right arrow keys to compare every platform.
            </p>

            <div className={styles.comparisonSources}>
              <p>
                First-party EstoSpaces entries describe the intended private-beta workflow, not
                unrestricted general availability. Third-party references:{' '}
                <a href="https://www.magicbricks.com/aboutus.html" rel="noreferrer" target="_blank">
                  MagicBricks
                </a>
                ,{' '}
                <a
                  href="https://play.google.com/store/apps/details?id=com.nnacres.app"
                  rel="noreferrer"
                  target="_blank"
                >
                  99acres
                </a>
                ,{' '}
                <a href="https://housing.com/partners/broker/" rel="noreferrer" target="_blank">
                  Housing.com
                </a>
                , and{' '}
                <a
                  href="https://www.nobroker.in/prophub/property-management/rental-property-management/"
                  rel="noreferrer"
                  target="_blank"
                >
                  NoBroker
                </a>
                .
              </p>
            </div>
          </SectionReveal>

          <div className={styles.journeyComparison}>
            <SectionReveal className={styles.journeyColumn}>
              <div>
                <span>Typical portal journey</span>
                <strong>Disconnected hand-offs</strong>
              </div>
              <ol>
                {traditionalJourney.map((step, index) => (
                  <li key={step}>
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    {step}
                  </li>
                ))}
              </ol>
            </SectionReveal>
            <SectionReveal
              className={`${styles.journeyColumn} ${styles.connectedColumn}`}
              delay={0.08}
            >
              <div>
                <span>The EstoSpaces journey</span>
                <strong>One connected case</strong>
              </div>
              <ol>
                {connectedJourney.map((step, index) => (
                  <li key={step}>
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    {step}
                  </li>
                ))}
              </ol>
            </SectionReveal>
          </div>

          <SectionReveal className={styles.trustBlock}>
            <div>
              <p className={styles.sectionCode}>Built around trust</p>
              <h3>Accountability belongs in the workflow.</h3>
            </div>
            <ul>
              {trustSignals.map((signal) => (
                <li key={signal}>{signal}</li>
              ))}
            </ul>
          </SectionReveal>

          <div className={styles.audienceGrid}>
            {audienceUseCases.map((group, index) => (
              <SectionReveal
                delay={index * 0.06}
                id={index === 0 ? 'property-seekers' : 'brokers'}
                key={group.audience}
              >
                <span>{String(index + 1).padStart(2, '0')} / 02</span>
                <h3>For {group.audience}</h3>
                <ul>
                  {group.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </SectionReveal>
            ))}
          </div>

          <SectionReveal className={styles.whyExist}>
            <p className={styles.sectionCode}>Why we exist</p>
            <h3>
              Property progress should not depend on scattered calls, messages, files, and memory.
            </h3>
            <p>
              EstoSpaces connects the work into one understandable experience: search, connect, Fast
              Track, and progress toward completion.
            </p>
          </SectionReveal>

          <p className={styles.comparisonDisclaimer}>
            Comparison is based on publicly available product materials at the time of review.
            Third-party products continue to evolve, feature scope may vary by market or service,
            and all company names and trademarks belong to their respective owners.
          </p>
        </section>

        <section className={styles.evidenceSection} id="evidence">
          <div aria-hidden="true" className={styles.evidenceAxis}>
            <span>04</span>
          </div>
          <div className={styles.sectionIntro}>
            <p className={styles.sectionCode}>Chapter 04 / Evidence</p>
            <h2>The limits belong beside the claim.</h2>
            <p>
              Targets can be useful without being presented as promises. This is the operating
              context behind the numbers used during private beta.
            </p>
          </div>

          <table className={styles.evidenceTable}>
            <caption>Current private-beta operating commitments and limitations</caption>
            <thead>
              <tr className={styles.evidenceHead}>
                <th scope="col">Signal</th>
                <th scope="col">Current status</th>
                <th scope="col">What it means</th>
              </tr>
            </thead>
            <tbody>
              {evidence.map((item) => (
                <tr className={styles.evidenceRow} key={item.signal}>
                  <th scope="row">{item.signal}</th>
                  <td>{item.status}</td>
                  <td>{item.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className={styles.operatorNote}>
            <span>Registered companies</span>
            <p>
              {siteConfig.legalEntities.india.name} / {siteConfig.legalEntities.unitedKingdom.name}
            </p>
          </div>
        </section>

        <section className={styles.faqSection} id="faq">
          <div className={styles.faqIntro}>
            <p className={styles.sectionCode}>Field notes / Questions</p>
            <h2>Details, stated plainly.</h2>
            <p>
              Need an answer about your situation?{' '}
              <TrackedLink
                eventName="contact_clicked"
                eventProperties={{ placement: 'faq' }}
                href={siteConfig.paths.contact}
              >
                Contact EstoSpaces
              </TrackedLink>
              .
            </p>
          </div>
          <div className={styles.faqList}>
            {faqs.map((faq, index) => (
              <details className={styles.faqItem} key={faq.question}>
                <summary>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  {faq.question}
                  <span aria-hidden="true" className={styles.faqMark}>
                    +
                  </span>
                </summary>
                <p>{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className={styles.finalCta}>
          <div>
            <p className={styles.sectionCode}>Next field action</p>
            <h2>Start with a clearer brief.</h2>
            <p>
              Open the private-beta registration route, or return to the application if you already
              have an account.
            </p>
          </div>
          <div className={styles.finalActions}>
            <TrackedLink
              className={styles.primaryAction}
              eventName="create_account_clicked"
              eventProperties={{ placement: 'final_cta' }}
              href={siteConfig.paths.register}
            >
              Create account <ArrowRight aria-hidden="true" size={18} />
            </TrackedLink>
            <TrackedLink
              className={styles.secondaryAction}
              eventName="login_clicked"
              eventProperties={{ placement: 'final_cta' }}
              href={siteConfig.paths.login}
            >
              Existing user log in
            </TrackedLink>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
