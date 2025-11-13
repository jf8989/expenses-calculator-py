# Vercel Deployment Guide

This guide explains how to deploy the ExpenseSplit Pro application to Vercel.

## Prerequisites

1. A Vercel account (sign up at https://vercel.com)
2. Firebase project with service account credentials
3. Git repository connected to Vercel

## Environment Variables

You need to set the following environment variables in your Vercel project settings:

### Required Variables

1. `FIREBASE_SERVICE_ACCOUNT_KEY` - Path to your Firebase service account JSON file
   - **Important**: You need to upload your service account key JSON file or convert it to base64 and decode it at runtime

### Setting Environment Variables in Vercel

1. Go to your project in Vercel dashboard
2. Navigate to Settings > Environment Variables
3. Add each variable with appropriate values for each environment (Production, Preview, Development)

## Firebase Service Account Setup

For Vercel deployment, you have two options:

### Option 1: Using Vercel Secrets (Recommended)

1. Convert your service account JSON to a single-line string:
   ```bash
   cat path/to/serviceAccountKey.json | tr -d '\n'
   ```

2. Add it as an environment variable in Vercel:
   - Variable name: `FIREBASE_SERVICE_ACCOUNT_KEY`
   - Value: The single-line JSON string

3. Update `app.py` to handle the JSON string:
   ```python
   import json
   import os

   # In app.py, update the Firebase initialization:
   cred_json = os.environ.get('FIREBASE_SERVICE_ACCOUNT_KEY')
   if cred_json:
       # Parse JSON string
       cred_dict = json.loads(cred_json)
       cred = credentials.Certificate(cred_dict)
   else:
       # Fallback to file path for local development
       cred_path = os.environ.get('FIREBASE_SERVICE_ACCOUNT_KEY_PATH')
       cred = credentials.Certificate(cred_path)
   ```

### Option 2: Using Vercel Storage

1. Upload your service account key file to Vercel's storage
2. Reference the file path in your environment variable

## Deployment Steps

### 1. Connect Repository

1. Log in to Vercel
2. Click "Add New Project"
3. Import your Git repository
4. Vercel will automatically detect the `vercel.json` configuration

### 2. Configure Project

1. Framework Preset: Other
2. Build Command: Leave empty (not needed for Flask)
3. Output Directory: Leave empty
4. Install Command: `pip install -r requirements.txt`

### 3. Add Environment Variables

Add the required environment variables as described above.

### 4. Deploy

Click "Deploy" and Vercel will:
1. Install dependencies from `requirements.txt`
2. Build the project according to `vercel.json`
3. Deploy your application

## File Structure

```
expenses-calculator-py/
├── api/
│   └── index.py          # Vercel serverless function entry point
├── static/               # Static files (CSS, JS)
├── templates/            # HTML templates
├── app.py               # Main Flask application
├── requirements.txt     # Python dependencies
├── vercel.json          # Vercel configuration
└── .vercelignore        # Files to ignore during deployment
```

## Important Notes

1. **Serverless Environment**: Vercel runs Flask in a serverless environment. Each request may spawn a new instance.

2. **Cold Starts**: First requests after inactivity may be slower due to cold starts.

3. **Stateless**: Your application must be stateless. Use Firebase/Firestore for data persistence.

4. **Timeouts**: Vercel serverless functions have a 10-second execution timeout on Hobby plan, 60 seconds on Pro plan.

5. **File System**: The file system is read-only except for `/tmp` directory.

## Troubleshooting

### Issue: Module not found errors

**Solution**: Ensure all dependencies are in `requirements.txt`

### Issue: Firebase initialization fails

**Solution**:
- Check that `FIREBASE_SERVICE_ACCOUNT_KEY` environment variable is set correctly
- Verify the JSON format is valid
- Ensure Firebase Admin SDK is installed

### Issue: Static files not loading

**Solution**:
- Check `vercel.json` routes configuration
- Verify static files are in the `static/` directory
- Check browser console for 404 errors

### Issue: Application works locally but not on Vercel

**Solution**:
- Check Vercel function logs in the dashboard
- Verify all environment variables are set in Vercel
- Ensure no local file paths are hardcoded

## Testing Deployment

After deployment:

1. Visit your Vercel URL (e.g., `your-project.vercel.app`)
2. Test authentication with Google
3. Verify all features work correctly
4. Check browser console for any errors
5. Test on mobile devices

## Custom Domain

To use a custom domain:

1. Go to Project Settings > Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Wait for DNS propagation (can take up to 48 hours)

## Continuous Deployment

Vercel automatically deploys:
- **Production**: When you push to the `main` branch
- **Preview**: When you push to other branches or open PRs

## Monitoring

Monitor your application:
1. Vercel Dashboard > Analytics
2. Vercel Dashboard > Logs (check function execution logs)
3. Set up alerts for errors

## Support

For issues:
- Vercel Documentation: https://vercel.com/docs
- Firebase Documentation: https://firebase.google.com/docs
- Project Issues: Create an issue in the repository
