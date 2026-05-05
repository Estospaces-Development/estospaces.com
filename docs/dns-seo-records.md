# DNS SEO Records

These records are managed outside this repository and are required for external SEO audit tools.

## SPF

Add exactly one TXT record at the root domain:

```txt
v=spf1 include:_spf.google.com include:sendgrid.net include:spf.resend.com ~all
```

Keep only the providers Estospaces actually uses. If Google Workspace is not used, remove `include:_spf.google.com`. If SendGrid or Resend is not used, remove that include.

## DMARC

Add a TXT record at `_dmarc.estospaces.com`:

```txt
v=DMARC1; p=none; rua=mailto:dmarc@estospaces.com; adkim=s; aspf=s
```

Move from `p=none` to `p=quarantine` or `p=reject` after legitimate mail sources are verified.

## Canonical Host

The app redirects `www.estospaces.com` and HTTP traffic to `https://estospaces.com`. DNS should point both apex and `www` to the same production deployment so the redirect can execute.
