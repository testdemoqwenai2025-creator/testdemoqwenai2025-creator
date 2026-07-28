#!/usr/bin/env python3
"""Redact any GitHub PAT occurrences from worklog.md (and any other text file)."""
import re
import sys
from pathlib import Path

TARGET = Path(sys.argv[1] if len(sys.argv) > 1 else "/home/z/my-project/worklog.md")
PATTERNS = [
    re.compile(r"ghp_[A-Za-z0-9]{36,}"),
    re.compile(r"github_pat_[A-Za-z0-9_]{40,}"),
]

content = TARGET.read_text(encoding="utf-8")
original_len = len(content)
total_subs = 0
for pat in PATTERNS:
    new_content, n = pat.subn("[REDACTED:PAT]", content)
    content = new_content
    total_subs += n

if total_subs:
    TARGET.write_text(content, encoding="utf-8")
    print(f"redacted {total_subs} PAT occurrence(s) in {TARGET} ({original_len} -> {len(content)} bytes)")
else:
    print(f"no PAT occurrences found in {TARGET}")
