# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in this project, please report it responsibly.

**Do not open a public issue.**

Instead, send an email to **engineering@newo.ai** with:

- A description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

We will acknowledge receipt within 48 hours and provide a timeline for resolution.

## Supported Versions

| Version | Supported |
|---------|-----------|
| 0.2.x | Yes |
| 0.1.x | No |

## Security Practices

- All dependencies are reviewed before inclusion
- Schema files do not contain customer data
- The extension runs in VS Code's sandboxed extension host
- The LSP server operates locally with no network access required
