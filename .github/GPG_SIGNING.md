# GPG Release Signing Setup Guide

## Purpose
Enable GPG-signed release artifacts so consumers can verify binary authenticity.

## Quick Setup (5 minutes)

### 1. Generate a GPG Key Pair
```bash
gpg --full-generate-key
# Select: (1) RSA and RSA
# Key size: 4096
# Expiry: 1y (or 0 for no expiry)
# Real name: "Compliance Dashboard Bot"
# Email: bot@example.com
```

### 2. Export Keys
```bash
# Export public key (for users to verify)
gpg --armor --export bot@example.com > PUBLIC_KEY.asc

# Export private key (base64-encoded for GitHub Secret)
gpg --armor --export-secret-keys bot@example.com | base64 > PRIVATE_KEY_B64.txt
```

### 3. Add GitHub Secrets
Go to: **Settings → Secrets and variables → Actions → New repository secret**

| Secret Name | Value |
|-------------|-------|
| `GPG_PRIVATE_KEY` | The **raw ASCII-armored** private key (NOT the base64 version) |
| `GPG_PASSPHRASE` | Your GPG key passphrase (if set) |

```bash
# To get the raw armored key for the secret:
gpg --armor --export-secret-keys bot@example.com
```

### 4. Configure Git Signing (optional — for signed commits)
```bash
git config --global user.signingkey <KEY_ID>
git config --global commit.gpgsign true
git config --global tag.gpgsign true
```

### 5. Add Public Key to GitHub Account
Upload `PUBLIC_KEY.asc` to your GitHub profile under **Settings → SSH and GPG keys → New GPG key**.

### 6. Verify It Works
```bash
# Create and push a signed tag
git tag -s v9.0.0 -m "Release v9.0.0"
git push origin v9.0.0
```

The release workflow will:
1. Build the standalone binary
2. Sign it with your GPG key → `.tar.gz.asc`
3. Generate SHA-256 checksum → `.tar.gz.sha256`
4. Generate SLSA provenance → `.intoto.jsonl`

### Users Verify With:
```bash
# Import the public key
gpg --import PUBLIC_KEY.asc

# Verify the signature
gpg --verify release.tar.gz.asc release.tar.gz

# Verify the checksum
sha256sum -c release.tar.gz.sha256
```

## Without GPG Setup
The release pipeline works **without** GPG keys configured. It will simply skip the `.asc` signature file. SHA-256 checksums and SLSA provenance are always generated.
