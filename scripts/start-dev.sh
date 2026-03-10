#!/bin/bash
# Fix for "EMFILE: too many open files" - increases file descriptor limit
ulimit -n 10240 2>/dev/null || true
npm run dev
