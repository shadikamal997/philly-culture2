#!/bin/bash

# Load environment variables from .env.local
export $(cat .env.local | grep -v '^#' | xargs)

# Run the TypeScript script with tsx
npx tsx set-admin-role.ts
