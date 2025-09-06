# Firebase CLI Guide

Panduan lengkap untuk menggunakan Firebase CLI dalam proyek SisaPlus.

## 1. Installation & Setup

### Install Firebase CLI
```bash
# Install globally
npm install -g firebase-tools

# Verify installation
firebase --version
```

### Login & Authentication
```bash
# Login ke Firebase
firebase login

# Login dengan browser tertentu
firebase login --reauth

# Logout
firebase logout

# Check login status
firebase login:list
```

## 2. Project Management

### Initialize Project
```bash
# Initialize Firebase in current directory
firebase init

# Initialize dengan features tertentu
firebase init firestore
firebase init hosting
firebase init emulators
```

### Project Selection
```bash
# List semua projects
firebase projects:list

# Show current project
firebase use

# Switch ke project lain
firebase use project-id

# Add project alias
firebase use --add

# Use alias
firebase use staging
firebase use production
```

## 3. Firestore Commands

### Deploy Rules & Indexes
```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Firestore indexes
firebase deploy --only firestore:indexes

# Deploy both
firebase deploy --only firestore
```

### Data Management
```bash
# Delete all collections (DANGEROUS!)
firebase firestore:delete --all-collections --yes

# Delete specific collection
firebase firestore:delete --shallow collection-name --yes

# Delete specific document
firebase firestore:delete collection-name/document-id --yes
```

## 4. Emulators

### Start Emulators
```bash
# Start all configured emulators
firebase emulators:start

# Start specific emulators
firebase emulators:start --only firestore,auth

# Start with UI
firebase emulators:start --import=./emulator-data

# Start on different ports
firebase emulators:start --only firestore --port=8081
```

### Emulator Data Management
```bash
# Export emulator data
firebase emulators:export ./emulator-data

# Import emulator data
firebase emulators:start --import=./emulator-data

# Clear emulator data
rm -rf ./emulator-data
```

### Emulator Configuration
```json
// firebase.json
{
  "emulators": {
    "auth": {
      "port": 9099
    },
    "firestore": {
      "port": 8080
    },
    "hosting": {
      "port": 5000
    },
    "ui": {
      "enabled": true,
      "port": 4000
    }
  }
}
```

## 5. Hosting Commands

### Deploy Website
```bash
# Deploy hosting
firebase deploy --only hosting

# Deploy with message
firebase deploy --only hosting -m "Deploy message"

# Preview before deploy
firebase hosting:channel:deploy preview
```

### Hosting Management
```bash
# List hosting sites
firebase hosting:sites:list

# Create new site
firebase hosting:sites:create site-name

# Delete site
firebase hosting:sites:delete site-name
```

## 6. Functions Commands (Jika menggunakan)

```bash
# Deploy functions
firebase deploy --only functions

# Deploy specific function
firebase deploy --only functions:functionName

# View function logs
firebase functions:log

# Delete function
firebase functions:delete functionName
```

## 7. Debugging & Monitoring

### Logs
```bash
# View deployment logs
firebase deploy --debug

# View function logs
firebase functions:log

# View hosting logs
firebase hosting:channel:list
```

### Testing
```bash
# Test security rules
firebase emulators:exec "npm test" --only firestore

# Validate firebase.json
firebase use --add
```

## 8. Common Workflows

### Development Workflow
```bash
# 1. Start emulators for development
firebase emulators:start --import=./emulator-data

# 2. Develop and test locally
# ... your development work ...

# 3. Export data if needed
firebase emulators:export ./emulator-data

# 4. Deploy when ready
firebase deploy --only firestore:rules,firestore:indexes
```

### Production Deployment
```bash
# 1. Switch to production
firebase use production

# 2. Deploy rules and indexes
firebase deploy --only firestore

# 3. Deploy hosting (if applicable)
firebase deploy --only hosting

# 4. Verify deployment
firebase projects:list
```

## 9. Troubleshooting

### Common Issues

**Permission Denied:**
```bash
# Re-authenticate
firebase login --reauth

# Check project permissions
firebase projects:list
```

**Emulator Issues:**
```bash
# Kill processes on ports
lsof -ti:8080 | xargs kill -9
lsof -ti:9099 | xargs kill -9

# Clear emulator data
rm -rf ./emulator-data
```

**Deploy Issues:**
```bash
# Check firebase.json syntax
cat firebase.json | jq .

# Validate rules
firebase deploy --only firestore:rules --debug
```

### Useful Debug Commands
```bash
# Debug mode
firebase --debug command

# Check configuration
firebase list

# Check current directory setup
ls -la firebase.json .firebaserc
```

## 10. Best Practices

1. **Always use aliases for different environments:**
   ```bash
   firebase use --add  # Add staging and production aliases
   ```

2. **Export emulator data regularly:**
   ```bash
   firebase emulators:export ./emulator-data
   ```

3. **Test rules before deploying:**
   ```bash
   firebase emulators:start --only firestore
   # Test your app
   firebase deploy --only firestore:rules
   ```

4. **Use specific deploy targets:**
   ```bash
   firebase deploy --only firestore:rules  # Instead of firebase deploy
   ```

5. **Keep firebase.json in version control:**
   ```bash
   git add firebase.json .firebaserc
   ```

## 11. Configuration Files

### firebase.json
```json
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  },
  "emulators": {
    "auth": {
      "port": 9099
    },
    "firestore": {
      "port": 8080
    },
    "hosting": {
      "port": 5000
    },
    "ui": {
      "enabled": true
    }
  }
}
```

### .firebaserc
```json
{
  "projects": {
    "default": "your-project-id",
    "staging": "your-project-staging",
    "production": "your-project-prod"
  }
}
```

Dengan panduan ini, Anda dapat mengelola proyek Firebase dengan efisien menggunakan Firebase CLI.