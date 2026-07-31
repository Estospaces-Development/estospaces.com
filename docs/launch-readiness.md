# EstoSpaces public website launch readiness

Overall release decision: **NO-GO**

Reason: the landing repository passes its local release gates and the owner has approved the legal-company, contact, founder, and screenshot facts. The overall release remains blocked because seven API domains fail TLS/health checks, the apex domain has no verified HTTPS redirect, substantive legal notices still need qualified review, and the first authenticated product journey has not passed end to end in a live environment.

Assessment date: 31 July 2026  
Scope: `estospaces.com` public website and its hand-off to the production application  
Commit baseline: `325697a` on local `develop`, three commits behind `origin/develop`  
Worktree state: existing dirty local worktree; no commit, push, merge, deployment, DNS, GCP, or Terraform change was performed

## Scope and before/after result

Before this work, the repository still contained a pre-launch waitlist campaign, fictional testimonials and metrics, virtual-tour-first language, a 27 MB autoplay hero video, fake property previews, incomplete trust routes, broken blog CTA anchors, and navigation that did not expose the required product and trust destinations directly.

The local landing site now presents a market-neutral private-beta software platform, uses conservative release-gated wording, exposes real login/registration routes, withholds broken production search, qualifies the 10-minute and 24-hour targets, identifies both registered companies and the approved founding team, renders crawlable trust/legal pages, and shows two approved sanitized dashboard captures. Obsolete testimonial, waitlist, virtual-tour, fake-listing, and live-chat UI modules were removed. The video and fabricated property assets are not referenced or requested by the rendered site.

The local landing implementation is ready for review. The overall release remains a NO-GO because a website build cannot close external product, API, legal, domain, or operational gates.

## Implemented locally

- Added a typed canonical site configuration in `src/config/site.ts` for public facts, app routes, contact/support address, social URLs, feature flags, status, market wording, and metadata.
- Implemented the exact desktop/mobile navigation destinations: Product, How it works, For property seekers, For brokers, Security, About, Blog, Log in, and Create account.
- Rewrote the hero around enquiry progression and changed its status to `Private beta / Access remains release-gated`.
- Replaced the non-working public search form with a truthful service notice plus the verified registration and existing-user routes.
- Added two equal, sanitized 1120×609 WebP product-proof captures for the seeker and manager dashboards, dated 10 July 2026 and labelled `Test data only`.
- Added separate seeker and broker/manager use cases, a five-step workflow, target limitations, a dated comparison, and evidence-oriented FAQs.
- Removed rendered and obsolete source-level testimonials, metrics, waitlist controls, AI Lakshmi, virtual-tour, Street View, CRM, fake property previews, and unsupported live-feature claims.
- Kept the homepage market-neutral while preserving the established UK editorial surface for a separate editorial decision.
- Added server-rendered About, Contact, Security, Privacy, Terms, and Cookies pages with unique metadata, canonical URLs, H1s, contact paths, and visible update dates.
- Added Organization, WebSite, SoftwareApplication, and AboutPage JSON-LD with existing logo/social URLs and no ratings, reviews, pricing, SearchAction, or RealEstateAgent schema.
- Added a true 404, sitemap, robots policy, canonical host metadata, HTTPS redirect middleware, security headers, CSP, no production source maps, and safe external-link handling.
- Added consent-gated optional GA4, an event/property allowlist, and tracked login, registration, and broker-access links. No analytics vendor loads without a valid environment ID and prior acceptance.
- Added keyboard-safe mobile navigation, focus return, Escape/selection closing, scroll lock, skip link, focus styles, reduced motion, 320 px reflow, text-spacing, axe, and no-JavaScript checks.
- Replaced all 100 generated blog records’ removed `/#join-waitlist` CTA with the release-gated registration route and added a scoped editorial audit.
- Added repeatable build, route, structured-data, link, accessibility, responsive, security-header, performance, and external-production verification.

## P0 acceptance matrix

| ID    | Requirement                             | Result                                         | Evidence / limitation                                                                               |
| ----- | --------------------------------------- | ---------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| P0-01 | One typed canonical site configuration  | Pass                                           | `src/config/site.ts`; no secrets or program IDs                                                     |
| P0-02 | Production-access navigation            | Pass locally                                   | Exact nine destinations on desktop/mobile; browser interaction test                                 |
| P0-03 | Real-product hero                       | Pass locally                                   | Enquiry-to-next-step headline; release-gated status; qualified timing                               |
| P0-04 | Real search or truthful replacement     | Pass locally / external blocker                | Search UI withheld; production search shell returns zero data with CSP failures                     |
| P0-05 | Remove unsupported claims               | Pass                                           | Active and obsolete source scan; claims register                                                    |
| P0-06 | Live/limited/planned honesty            | Pass                                           | Private-beta and release-gated labels; no roadmap section                                           |
| P0-07 | Genuine product proof only              | Pass locally                                   | Two approved sanitized dashboard captures; test-data/date/crop disclosure; intrinsic dimensions     |
| P0-08 | Workflow and limitations                | Pass                                           | Five steps, 10-minute target, 24-hour Fast Track limitation, FAQ/terms                              |
| P0-09 | Two-sided software business             | Pass                                           | Separate seeker and broker/manager sections; no agency/pricing claim                                |
| P0-10 | Conservative market consistency         | Pass locally / decision pending                | Homepage and trust metadata are market-neutral; UK blog preserved                                   |
| P0-11 | Credible company identity               | Pass for owner-approved public facts           | Both exact legal names, verified domain mailbox, and approved founder/co-founder roles are shown    |
| P0-12 | Crawlable first-party trust pages       | Pass locally / legal review pending            | Six SSR routes, unique metadata/canonicals/H1s/update dates                                         |
| P0-13 | Working contact experience              | Pass locally / delivery ownership pending      | Domain `mailto:` path; no fake form or response SLA                                                 |
| P0-14 | Metadata and structured data            | Pass locally                                   | JSON-LD parses; logo exists; no unsupported schema                                                  |
| P0-15 | Robots, sitemap, statuses, hosts, links | Pass locally / production host recheck pending | 404, robots, sitemap, rendered link crawl; production apex/www is external                          |
| P0-16 | Remove/optimize 27 MB video             | Pass                                           | Static 65 KB WebP hero; no video request or rendered reference                                      |
| P0-17 | Performance budgets                     | Pass locally                                   | Three-run mobile median 93/100/100/100; LCP 1.93 s; CLS 0                                           |
| P0-18 | WCAG 2.2 AA expectations                | Pass locally                                   | Zero axe violations on key routes; keyboard, reduced-motion, 320 px, 200% checks                    |
| P0-19 | Security hardening                      | Pass locally / triage operations pending       | CSP/HSTS/headers/source-map/dependency checks plus `security.txt` using the verified domain mailbox |
| P0-20 | Real privacy/analytics behavior         | Pass locally                                   | Analytics absent by default; prior consent and equal Reject/Accept controls when configured         |
| P0-21 | Configured-only funnel analytics        | Pass locally                                   | Central allowlist; no PII properties; access links wired                                            |
| P0-22 | Repaired footer                         | Pass locally                                   | Identity, operator, trust/legal/blog/access/social links, generated year                            |
| P0-23 | About/blog audit                        | Pass for technical gate / editorial follow-up  | 100 canonical records pass automation; `docs/blog-launch-audit.md` lists editorial work             |

## Verification evidence

Required commands and latest outcomes:

| Command                            | Outcome                                                                    |
| ---------------------------------- | -------------------------------------------------------------------------- |
| `npm ci`                           | Passed; 239 packages audited, zero vulnerabilities                         |
| `npm run format:check`             | Passed                                                                     |
| `npm run lint`                     | Passed; 60 files, zero diagnostics                                         |
| `npm run typecheck`                | Passed                                                                     |
| `npm test`                         | Passed; 29/29                                                              |
| `npm run site:audit`               | Passed; 25/25                                                              |
| `npm run blogs:audit`              | Passed; score 100, 3,005 checks, zero failures                             |
| `npm run blogs:validate`           | Passed; 100 canonical records                                              |
| `npm run build`                    | Passed; 113 routes                                                         |
| `npm run verify:launch`            | Passed; 108 sitemap routes, links, headers, axe, responsive UI             |
| `npm run perf:lighthouse`          | Passed target; three mobile + three desktop runs                           |
| `npm run verify:production`        | Completed 31 Jul 2026; apex/www, search, and seven API blockers reproduced |
| `npm audit --audit-level=moderate` | Passed; zero vulnerabilities                                               |
| `git diff --check`                 | Passed; no whitespace errors                                               |
| Targeted credential-pattern scan   | Passed; zero credential-pattern files; only `.env.example` tracked         |

Local evidence paths:

- `artifacts/launch-readiness/browser-verification.json`
- `artifacts/launch-readiness/lighthouse/summary.json`
- `artifacts/launch-readiness/desktop-1440x900.png`
- `artifacts/launch-readiness/iphone-390x844.png`
- `artifacts/launch-readiness/minimum-320-text-spacing.png`
- `artifacts/launch-readiness/desktop-200-percent-zoom.png`
- `artifacts/launch-readiness/production/production-verification.json`
- `public/assets/landing/product-proof-seeker-fast-track.webp`
- `public/assets/landing/product-proof-manager-fast-track.webp`

## Route and service matrix

| URL / surface                                                      | Observed                                                                    | Expected                                        | Result                     |
| ------------------------------------------------------------------ | --------------------------------------------------------------------------- | ----------------------------------------------- | -------------------------- |
| Local `/`                                                          | 200, SSR H1/canonical, zero axe                                             | 200 meaningful HTML                             | Pass                       |
| Local `/about`                                                     | 200, SSR H1/canonical                                                       | 200 meaningful HTML                             | Pass                       |
| Local `/contact`                                                   | 200, SSR H1/canonical                                                       | 200 meaningful HTML                             | Pass                       |
| Local `/security`                                                  | 200, SSR H1/canonical                                                       | 200 meaningful HTML                             | Pass                       |
| Local `/privacy`                                                   | 200, SSR H1/canonical                                                       | 200 meaningful HTML                             | Pass                       |
| Local `/terms`                                                     | 200, SSR H1/canonical                                                       | 200 meaningful HTML                             | Pass                       |
| Local `/cookies`                                                   | 200, SSR H1/canonical                                                       | 200 meaningful HTML                             | Pass                       |
| Local `/blogs` + canonical article routes                          | 200                                                                         | 200                                             | Pass                       |
| Local `/robots.txt` and `/sitemap.xml`                             | 200, canonical sitemap/valid routes                                         | 200                                             | Pass                       |
| Local `/.well-known/security.txt`                                  | 200, verified domain contact                                                | 200 meaningful text                             | Pass                       |
| Local deliberately unknown route                                   | 404                                                                         | 404                                             | Pass                       |
| `https://app.estospaces.com/login/`                                | 200 meaningful sign-in UI                                                   | 200; login completion                           | Route pass; E2E unverified |
| `https://app.estospaces.com/register`                              | 200 user/manager form                                                       | 200; registration + verification completion     | Route pass; E2E unverified |
| `https://app.estospaces.com/search?...`                            | 200 shell, zero results, CSP-blocked API requests                           | Real or labeled beta results without errors     | Fail                       |
| App/admin `/health`                                                | 200 JSON at last check                                                      | 200 JSON                                        | Pass at check time         |
| Core/booking/search/media/messaging/notification/payment `/health` | TLS disconnect or reset at last check                                       | 200 JSON                                        | Fail (7)                   |
| Apex/www/HTTPS canonical behavior                                  | Local TLS handshakes fail; independent fetch returns 502; www attempts apex | Trusted apex + one permanent canonical redirect | Fail                       |

## Local code fixes applied (31 July 2026)

The following fixes were made in the owning repositories but are not yet deployed to production. They require deployment to close the associated blockers.

### estospaces-web: production API URL and CSP fix

**Root cause:** The CD pipeline was passing Cloud Run `.run.app` URLs as Docker build ARGs, which overrode the `.env.production` relative URLs (`/`). This baked absolute cross-origin URLs into the JS bundle. The correct production pattern is relative URLs so nginx proxies same-origin `/api/*` requests to backends — this satisfies the strict CSP `connect-src 'self'` without needing to whitelist cross-origin API endpoints.

**Fix applied:**

- `Dockerfile`: Default ARG values set to `/` so production builds always use same-origin URLs. Build step changed to `npm run build:prod`.
- `.github/workflows/cd.yml`: Production builds now pass `/` for all `VITE_*_SERVICE_URL` build args. Dev/staging builds continue to pass absolute Cloud Run URLs.
- `src/lib/apiUtils.test.ts`: Added 6 new tests verifying production URL and CSP behavior.

**Verification:** 17/17 tests pass in `apiUtils.test.ts`, 843/843 pass in full suite, `npm run build:prod` succeeds, `npm run typecheck` passes.

### estospaces-infrastructure: Terraform fixes

**Root cause:** `terraform.tfvars` correctly targets `europe-west2` per the documented production region, but the CD pipeline (`cd.yml`) deploys Cloud Run services to `asia-south1` (line 23: `REGION: asia-south1`). This region mismatch could cause the serverless NEG in the global load balancer to fail to find the Cloud Run services. Additionally, the managed SSL certificate in `serverless-api-edge` had no explicit dependency on DNS records, creating a race condition where GCP's certificate validation could fail if DNS was not yet propagated.

**Fix applied:**

- `terraform/modules/serverless-api-edge/main.tf`: Added `depends_on = [google_dns_record_set.a_records]` to the managed SSL certificate to ensure DNS records exist before certificate validation begins.

**Requires decision:** The region mismatch between Terraform (`europe-west2`) and CD pipeline (`asia-south1`) requires a decision:

- Option A: Change CD pipeline `REGION` to `europe-west2` and redeploy all services.
- Option B: Change `terraform.tfvars` to `asia-south1` to match deployed services.

**Option A** aligns with the documented production region. **Option B** is less disruptive if services are already live. See `estospaces.com/docs/launch-decisions.md` for context.

**Note:** The `depends_on` fix requires `terraform plan` and `terraform apply` to take effect. The region decision requires corresponding updates to the CD pipeline and Cloud Run service locations before the TLS/DNS blockers can be fully resolved.

## Remaining deployment actions

| Action                    | Repository                | Command/Steps                                                    |
| ------------------------- | ------------------------- | ---------------------------------------------------------------- |
| Deploy fixed web image    | estospaces-web            | Push to `develop` branch → CI/CD deploys to dev → verify         |
| Apply Terraform changes   | estospaces-infrastructure | `terraform -chdir=terraform/environments/prod plan` then `apply` |
| Verify TLS certificates   | GCP Console               | Check certificate status in Load Balancing → Frontends           |
| Verify DNS propagation    | GCP Console / `dig`       | Confirm A records resolve to the global IP                       |
| Update CD pipeline region | estospaces-web            | If moving to `europe-west2`, update `REGION` in `cd.yml`         |

`/.well-known/security.txt` uses the owner-verified `contact@estospaces.com` mailbox and does not claim a response SLA. Operational triage ownership and escalation still need to be documented before production launch.

The refreshed 31 July 2026 external check resolved the configured DNS records but reproduced the release failure: the apex and API domains failed their TLS handshakes from the implementation environment, while an independent network returned 502 for the apex and `www`. App and admin health continued to return 200 JSON.

## Performance summary

Three production-build Lighthouse runs were used per profile.

| Profile        | Performance | Accessibility | Best practices | SEO |    FCP |    LCP |    CLS |    TBT | Speed Index | Transfer |
| -------------- | ----------: | ------------: | -------------: | --: | -----: | -----: | -----: | -----: | ----------: | -------: |
| Mobile median  |          93 |           100 |            100 | 100 | 1.51 s | 1.93 s |      0 | 259 ms |      2.49 s |   208 KB |
| Desktop median |         100 |            96 |            100 | 100 | 0.44 s | 0.57 s | 0.0028 |  10 ms |      0.98 s |   257 KB |

The desktop median above predates the final proof-card reveal correction. A follow-up desktop accessibility run on the rebuilt page scored 100, with the previous color-contrast finding cleared.

The current page requests a 65 KB WebP hero instead of the obsolete 27 MB video. The no-analytics homepage strips the unnecessary Next.js runtime after build. No unexpected third-party request is expected in the default configuration.

## Exact unresolved blockers

| Blocker                                                      | Owner                        | Exact action and closing evidence                                                                          |
| ------------------------------------------------------------ | ---------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Legal notices are product drafts                             | Qualified counsel + operator | Approve actual processing, retention, vendors, transfers, rights, terms, and jurisdictions in writing      |
| Launch market/rollout is unresolved                          | Product/operations           | Choose India-first, UK-first, or both with city order, inventory, coverage, and operating dates            |
| General/support/security mailbox monitoring is unproven      | Operations/security          | Confirm monitored owners, retention/escalation, and test delivery; provision dedicated inboxes if required |
| Registration/email verification/first useful flow unverified | App engineering/QA           | Complete a controlled E2E account journey and preserve test evidence                                       |
| Production search returns no useful data and violates CSP    | Web app + search platform    | Use approved canonical APIs, return real/labeled inventory, and produce clean browser evidence             |
| Seven API domains fail health checks                         | GCP/platform                 | Restore trusted TLS/domain mappings and 200 JSON health for every required service                         |
| Apex/www canonical path not release-verified                 | DNS/platform                 | Prove trusted apex HTTPS plus one permanent www-to-apex redirect from two external networks                |
| Monitoring/backup/rollback evidence outside repo             | Infrastructure owners        | Attach current alerts, restore test, rollback plan, owners, and dates                                      |

## Final launch checklist

### Company and public identity

- [x] Product name is consistent. Evidence: typed config, header, footer, metadata, and JSON-LD use `EstoSpaces`.
- [x] Legal operator is exact and owner-verified. Evidence: `Estospaces Solutions Private Limited` in India and `Estospaces Solutions Limited` in the United Kingdom are centralized in typed config and shown consistently; private registration records remain outside the public repository.
- [ ] Launch market/rollout is consistent. Homepage is safely neutral; the actual rollout decision remains open.
- [x] Domain email is owner-verified. Evidence: `contact@estospaces.com` is the canonical public contact and security-reporting mailbox; monitoring/escalation operations remain a separate launch task.
- [x] Founder/team details are approved. Evidence: Yashwanth Manuwada (Co-Founder) and Siranjeevi Subramaniyan (Co-Founder) are published without unapproved biographies or photographs.
- [x] Website, cloud applications, billing accounts, and provider records may use the same approved legal identity. Private account/provider records are intentionally not published or stored in this repository.

### Landing website

- [x] Homepage status accurately says private beta or the approved current stage. Evidence: hero, status ledger, footer.
- [ ] Login works on desktop and mobile. Both links reach 200 UI; credential-based completion is unverified.
- [ ] Create account works on desktop and mobile. Both links reach the form; registration/verification completion is unverified.
- [ ] Search properties works. Production search returns zero results with CSP-blocked calls; the landing form is truthfully withheld.
- [x] Broker access path works. Desktop/mobile broker links reach the shared user/manager registration form; completed onboarding is a product gate.
- [x] Every public claim has evidence. Evidence: `docs/content-claims-register.md` and qualified/removed claims.
- [x] No fictional testimonials or metrics remain. Evidence: active/source scan and obsolete module removal.
- [x] No roadmap-only feature is presented as live. Evidence: release-gated wording and no roadmap feature grid.
- [x] Genuine product proof is visible. Evidence: two approved, sanitized 1120×609 dashboard captures dated 10 July 2026, labelled `Test data only` and cropped for clarity.
- [x] Navigation, footer, and all landing CTAs work. Evidence: rendered internal-link and interaction checks.
- [x] About, Contact, Security, Privacy, Terms, and Cookies work without JavaScript. Evidence: production-build no-JS checks.
- [x] Unknown routes return 404. Evidence: deliberate route test.

### Product

- [ ] Registration works. Form UI is available; submission was not tested with an approved account.
- [ ] Email verification works where required. Not tested.
- [ ] Login, logout, session refresh/expiry, and password reset work. Not tested end to end.
- [ ] Search loads real or explicitly labeled beta data. Current search fails its release check.
- [ ] Property detail works. Not tested in production.
- [ ] Save/contact flows behave correctly. Not tested in production.
- [ ] Broker onboarding path works. Registration route exists; onboarding completion is unverified.
- [ ] Response tracking behaves correctly. Code/workflow evidence only; production telemetry test missing.
- [x] Fast Track language matches the implemented workflow. Evidence: claims register, homepage, FAQ, and Terms qualify progress rather than completion.
- [ ] Documents and messaging work where advertised. They are described only as private-beta workflow areas; production completion is unverified.
- [x] Payment, invoice, 3D tour, and other out-of-phase UI remain hidden. Evidence: source/render scan.

### Trust, legal, security, and privacy

- [x] Company identity is visible. Evidence: About, Contact, footer, JSON-LD.
- [ ] Legal pages match actual data behavior. Implementation was reviewed, but qualified legal/owner confirmation is pending.
- [ ] Contact delivery works. A real `mailto:` route exists; monitored delivery test is pending.
- [x] Document handling is accurately explained. Public site states documents are not published there and avoids unverified storage claims.
- [x] Cookie/analytics behavior matches the policy. Analytics is absent by default and consent-gated when configured.
- [x] Security headers are verified. Evidence: automated production-server header assertions.
- [x] No public source maps or secrets leak. Source maps disabled; scoped scans and build inspection required on final candidate.
- [x] Accessibility checks pass. Evidence: axe, keyboard, reflow, text-spacing, zoom, reduced-motion checks.
- [ ] Security reporting contact is monitored if published. The general mailbox route exists; monitoring ownership is unverified.

### Reliability and performance

- [ ] Apex/www/HTTPS redirects are correct. External release verification is pending/failing.
- [x] Landing routes return expected statuses. Evidence: local production-build route matrix.
- [x] App/admin health returns 200 JSON. Evidence: last external check; must be repeated at release time.
- [ ] Required API health endpoints return 200 JSON. Seven currently fail TLS/reset checks.
- [x] No critical browser console or network errors occur on the local landing site. Evidence: browser verifier.
- [x] Mobile performance budgets pass. Evidence: three-run median 93/100/100/100, LCP 1.93 s, CLS 0. Lab TBT proxy was 259 ms; field INP still requires post-release measurement.
- [x] Hero media is optimized. Evidence: 65 KB WebP, no rendered video.
- [ ] Monitoring, alerts, backup, and rollback are separately confirmed by the owning infrastructure team. Evidence not supplied.

### Cloud-program application consistency

- [x] Website describes a real owned software product. Evidence: product/operator copy and software schema.
- [x] Product status is honest. Evidence: private-beta/release-gated wording.
- [x] Domain business email is used. Evidence: `contact@estospaces.com`.
- [x] Legal identity is consistent for approved public and account use. Evidence: owner-confirmed India/UK legal names are centralized; private billing/provider identifiers remain outside the repository.
- [x] Current GCP architecture is not misrepresented as AWS/Azure. Evidence: internal cloud-readiness document.
- [x] No AWS, Microsoft, or Google endorsement is implied. Evidence: claims register/source scan.
- [ ] Application copy matches the website. Known production app text still requires a separate product-wide audit.
- [ ] Funding, prior credits, provider invitation, account plan, billing details, and provider relationship are verified outside the repository. Owner/account evidence is not available here.

### Final go/no-go

- [x] Every in-repo P0 item passes or has the prompt-required truthful omission/decision record.
- [x] Every public claim has evidence. Evidence: claims register.
- [ ] Every critical product CTA works end to end. Routes load, but account/product completion is unverified.
- [ ] No critical API is returning 5xx. Seven required health checks fail before/at TLS and cannot be considered healthy.
- [x] No unresolved legal/business fact is being guessed. Unknown facts are omitted or recorded as decisions.
- [x] The release recommendation is supported by reproducible evidence. Recommendation: **NO-GO** until the external and owner blockers above close.
