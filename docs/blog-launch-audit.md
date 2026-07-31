# EstoSpaces blog launch audit

Assessment date: 31 July 2026  
Scope: technical release gate for the existing 100-article UK editorial library; not a substitute for qualified article-by-article legal/editorial review

## Completed technical checks

- The canonical blog index is `/blogs`; all 100 generated article records have unique canonical slugs.
- The automated blog audit validates titles, descriptions, author/owner data, published/updated dates, heading/content structure, FAQ data, source links, images, and JSON-LD.
- The sitemap is generated from the valid canonical article records.
- Missing article slugs return 404; stale generated hero-image versions return 410/noindex.
- Established UK URLs were preserved while the product launch market remains undecided.
- All generated article CTA records now use `https://app.estospaces.com/register` with release-gated private-beta wording. The removed `/#join-waitlist` anchor is no longer present.
- Blog copy is separated from product availability: the About/blog disclosure states that editorial discussion is not proof that a feature is live.

## Editorial follow-up before broad promotion

| Issue                                                                               | Risk                                                                | Required owner/action                                                                                          |
| ----------------------------------------------------------------------------------- | ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| UK-heavy library versus unresolved product rollout                                  | Readers may infer UK product availability                           | Product/content owner must choose rollout strategy and keep editorial/product status clearly separated         |
| Time-sensitive 2026 legal, tax, renting, and compliance topics                      | Law/guidance may change                                             | Qualified UK reviewer must verify each article against current official sources immediately before promotion   |
| Financial, tax, legal, safety, surveying, and investment guidance                   | General information may be mistaken for advice                      | Legal/editorial owner must approve disclaimers, escalation/corrections, and review cadence                     |
| Automated image concepts and captions                                               | Image may imply a specific place/property or unsupported product UI | Content owner must visually review each hero; never use generated UI as product evidence                       |
| Source freshness                                                                    | An official URL can remain live while the underlying rule changes   | Store reviewer/date per article and revalidate material claims on a defined cadence                            |
| Thin/duplicate intent across 100 planned topics                                     | Similar pages may compete or become doorway content                 | Run a content-similarity review and use a redirect/canonical plan before consolidating; do not silently delete |
| Product-related articles mentioning virtual tours, CRM, response time, or workflows | Editorial topic may be read as live EstoSpaces functionality        | Qualify as industry guidance and remove any sentence that claims an unproven EstoSpaces capability             |

## Release interpretation

The blog passes the repository’s technical route/schema/SEO gate. It does not yet have the human legal/editorial evidence required to promote every article as current professional guidance. Preserve canonical URLs until a reviewed redirect/consolidation plan exists.
