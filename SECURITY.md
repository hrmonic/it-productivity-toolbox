# Security policy

IT Productivity Toolbox is a local browser application. There is no hosted authentication service or remote analysis endpoint in this repository. This is not a claim that the application has received an independent security audit.

## Reporting a vulnerability

Please report vulnerabilities privately through [GitHub’s private vulnerability reporting flow](https://github.com/hrmonic/it-productivity-toolbox/security/advisories/new). If that flow is unavailable, open an issue asking the maintainer for a private contact channel without including exploit details or sensitive data. Do not attach real project backups to public reports.

Include affected version or commit, reproduction steps with fictional data, expected and observed behavior, and the impact you can demonstrate. There is no guaranteed response SLA at this early stage.

## Security boundaries

- Project text is rendered as text. No user-controlled HTML renderer is provided.
- Decision reference URLs accept HTTP and HTTPS only.
- Backup import is limited to 5 MiB, schema-validated, and checked for broken or duplicate references before transactional insertion.
- Restore creates new projects; it does not overwrite existing projects.
- CSV text cells that could execute spreadsheet formulas are prefixed with an apostrophe.
- Frozen baselines and accepted/rejected change entries are protected at the persistence boundary.
- No analytics, API keys, remote AI calls, or runtime CDN resources are included.

IndexedDB and exported backups are **not encrypted**. A person with access to the browser profile, a malicious extension, or a compromised device may read the records. Browser eviction and site-data deletion can remove local data. Keep backups and apply your organization’s information-handling rules.

Hosted deployments should serve over HTTPS and configure suitable response headers; see [deployment guidance](docs/DEPLOYMENT.md). Dependency audit results are a point-in-time signal, not proof of application security.
