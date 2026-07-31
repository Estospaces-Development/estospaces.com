# EstoSpaces cloud program readiness

Status: **NO-GO for a production-readiness or provider-program submission**

Assessment date: 31 July 2026

## Current strengths

- The owner-approved India and United Kingdom legal entities and product/software identity are present consistently in the local website.
- The public narrative distinguishes a private beta from generally available service.
- The architecture is represented by separate GCP Cloud Run services with Terraform and CI/CD repositories.
- The public site has canonical metadata, crawlable trust routes, security headers, consent-gated optional analytics, an accessibility baseline, and repeatable verification.
- Dependency audit is currently clean.
- Claims do not imply Google, AWS, Azure, or any other cloud-provider endorsement.

## Required evidence before submission

- A working apex domain with trusted TLS and a deterministic `www` canonical redirect.
- Healthy canonical domains for core, booking, payment, notification, search, media, and messaging services.
- A complete production architecture diagram covering Cloud Run, database, storage, networking, secrets, identity, observability, backup, disaster recovery, and data regions.
- Terraform plan/apply evidence from an approved pipeline without credentials in the repository.
- Service-level objectives, alerting, incident ownership, on-call/escalation, runbooks, and recent recovery-test evidence.
- Cost ownership, budgets, alerts, labels, environment separation, committed-use decisions, and a six-month minimum/base/maximum forecast based on measured traffic.
- Security evidence: least-privilege service accounts, Workload Identity Federation, secret rotation, vulnerability management, logging/retention, data classification, access review, and incident response.
- Privacy/legal approval for operating jurisdictions, data transfers, subprocessors, retention, deletion, and data-subject requests.
- Real production journey proof from account creation through search, enquiry, broker response, Fast Track, viewing/application step, and notifications.
- Product-support channels on the company domain with named monitoring responsibility.

## Current blockers

| Area        | Finding                                                                                                                                                    | Closure evidence                                                                      |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Domain      | Apex and `www` fail from two networks: local TLS handshakes fail and an independent fetch returns 502                                                      | Trusted external 200 plus one permanent canonical redirect and certificate inspection |
| APIs        | Seven API custom domains reset or disconnected before TLS                                                                                                  | Successful `/health` matrix plus certificate/domain mapping evidence                  |
| Product     | Search UI loads but its Cloud Run fetches are blocked by the app CSP                                                                                       | Real inventory response without console/network errors                                |
| Performance | Local landing page passes the web-quality target at 93/100/100/100 mobile and 100/96/100/100 desktop; the final desktop accessibility follow-up scored 100 | Preserve the measured result on the exact deployed release candidate                  |
| Operations  | Launch market, operating hours, support ownership, and SLA evidence are undecided                                                                          | Signed owner decisions and operational runbook                                        |
| Legal       | Public notices have not received qualified review                                                                                                          | Documented approval                                                                   |
| Evidence    | Approved sanitized dashboard captures exist; controlled production credentials and full journey evidence remain unavailable                                | Controlled test account plus reproducible end-to-end evidence                         |

## Program-safe positioning

Describe EstoSpaces as a private-beta property-technology software platform backed by Estospaces Solutions Private Limited in India and Estospaces Solutions Limited in the United Kingdom. This legal identity does not by itself claim product availability in either market. Describe Google Cloud as the infrastructure platform only when supported by current architecture evidence. Never state or imply provider certification, partnership, funding, marketplace approval, customer validation, or endorsement unless a written program record explicitly permits that claim.

Provider-program dependencies are outside this landing repository:

- AWS $25K depends on an eligible Activate Provider offer/invitation and account eligibility.
- Azure credit milestones depend on real program verification and qualifying Azure usage.
- Google Cloud tier eligibility depends on the actual funding/program route and billing details.
- Funding, prior credits, provider relationship, cloud-account status, account plans, and billing IDs require owner/account evidence.

The current application is GCP-oriented. Do not rewrite the architecture as AWS or Azure to fit an application, and do not display a provider logo or endorsement without written permission.

## Internal submission checklist

- [ ] Canonical website and all API domains are healthy.
- [ ] Production user journey passes end to end.
- [ ] GCP architecture and data-flow diagrams are current.
- [ ] Security, privacy, backup, DR, monitoring, and incident evidence is attached.
- [ ] GCP billing export, budgets, anomaly alerts, resource labels, and cost owners are active.
- [ ] Minimum/base/maximum six-month cost forecast is reconciled to actual billing data.
- [ ] Business-domain support contacts and legal details are verified.
- [ ] Product claims register has an owner and release review.
- [ ] No cloud-provider endorsement claim appears without written permission.
- [ ] Application descriptions match the current website and GCP architecture.
- [ ] AWS/Azure/GCP eligibility and prior-credit facts are verified in the relevant provider accounts.
- [ ] Final submission package contains no API keys, private keys, customer data, or production credentials.

No application or external submission should be made until the launch-readiness NO-GO blockers are closed.
