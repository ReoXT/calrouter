# How to Create Your CRON_SECRET

A simple guide to generate and configure your cron secret for the trial expiry job.

## What is CRON_SECRET?

It's a random password that prevents unauthorized access to your cron job endpoint. Think of it like a secret API key that only Vercel knows.

**Why do we need this?**
- Vercel Cron Jobs don't automatically authenticate requests
- Anyone with your URL could trigger the cron endpoint
- The secret ensures only authorized requests (from Vercel or you) can run the job

**Note:** Vercel also provides `CRON_SECRET` in their headers automatically, but we're using our own for better control and local testing.

---

## Quick Setup (3 Steps)

### Step 1: Generate a Random Secret

Choose **ONE** of these methods:

#### Option A: Using Node.js (Recommended - Works Everywhere)
Since you already have Node.js installed for this project:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

**Example output (no `=` padding):**
```
Xk7vN2pQwR8yH4mL9cT6bF3sA1dG5jK0uVwE8mN3pL2qR7sT9x
```

**Note:** We use `base64url` instead of `base64` to avoid `=` padding characters that can confuse syntax highlighters in `.env` files.

#### Option B: Using OpenSSL (Mac/Linux/Git Bash)
```bash
openssl rand -base64 32
```

#### Option C: Using Windows PowerShell
```powershell
$bytes = New-Object byte[] 32
[System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
[Convert]::ToBase64String($bytes)
```

#### Option D: Using Online Tool
1. Go to: **https://www.uuidgenerator.net/api/guid** (generates a random UUID)
2. Or use: **https://1password.com/password-generator/** (set to 32 characters)
3. Copy the generated secret

### Step 2: Add to Local Environment

1. Open your `.env.local` file (create it if it doesn't exist)
2. Add this line:
```bash
CRON_SECRET=paste_your_generated_secret_here
```

**Example:**
```bash
CRON_SECRET=Xk7vN2pQwR8yH4mL9cT6bF3sA1dG5jK0
```

3. Save the file

### Step 3: Add to Vercel (Production)

1. Go to your Vercel Dashboard: https://vercel.com
2. Click on your **CalRouter** project
3. Go to **Settings** → **Environment Variables**
4. Click **Add New**
5. Fill in:
   - **Key:** `CRON_SECRET`
   - **Value:** `paste_your_generated_secret_here`
   - **Environment:** Select all (Production, Preview, Development)
6. Click **Save**
7. **Redeploy** your project for changes to take effect

---

## Testing Your Setup

### Test Locally

```bash
# Replace YOUR_SECRET with your actual secret
curl -X GET http://localhost:3000/api/cron/check-trials \
  -H "Authorization: Bearer YOUR_SECRET"
```

**Expected response (success):**
```json
{
  "success": true,
  "message": "Trial check completed successfully",
  "summary": { ... }
}
```

**If unauthorized:**
```json
{
  "error": "Unauthorized"
}
```
👆 This means your secret doesn't match

### Test on Vercel (Production)

```bash
# Replace YOUR_SECRET and YOUR_DOMAIN
curl -X GET https://your-app.vercel.app/api/cron/check-trials \
  -H "Authorization: Bearer YOUR_SECRET"
```

---

## Security Best Practices

✅ **DO:**
- Keep your secret private (never commit to Git)
- Use a long random string (at least 32 characters)
- Store it in environment variables only
- Use different secrets for development and production

❌ **DON'T:**
- Use simple passwords like "password123"
- Share your secret publicly
- Hardcode it in your source code
- Commit `.env.local` to Git (it's in `.gitignore` by default)

---

## Troubleshooting

### "Unauthorized" Error
**Problem:** The secret doesn't match

**Solution:**
1. Check your `.env.local` or Vercel environment variables
2. Make sure there are no extra spaces
3. Verify the secret is exactly the same in both places
4. Redeploy after changing Vercel environment variables

### Secret has `=` at the end (syntax highlighting issue)
**Problem:** Your secret ends with `=` or `==` and looks weird in your editor (blue color instead of purple)

**Why it happens:**
- Standard Base64 encoding adds `=` padding
- Your editor's syntax highlighter sees `=` as the end of the variable

**Solution (choose one):**

**Option 1:** Regenerate with URL-safe Base64 (no padding):
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

**Option 2:** Keep it as-is (it still works perfectly!):
```bash
# Both are equally valid and secure:
CRON_SECRET=Xk7vN2pQwR8yH4mL9cT6bF3sA1dG5jK0==  # Works fine ✅
CRON_SECRET=Xk7vN2pQwR8yH4mL9cT6bF3sA1dG5jK0    # No padding ✅
```

**Option 3:** Wrap in quotes (fixes syntax highlighting):
```bash
CRON_SECRET="Xk7vN2pQwR8yH4mL9cT6bF3sA1dG5jK0=="
```
⚠️ Be careful with quotes - some parsers include them in the value!

### Cron Not Running
**Problem:** The cron job isn't executing automatically

**Solution:**
1. Check that `vercel.json` exists in your project root
2. Verify you're on a Vercel Pro plan (crons require paid plan)
3. Check **Vercel Dashboard** → **Settings** → **Cron Jobs** to see if it's scheduled
4. Wait for the scheduled time (cron runs at 2 AM UTC daily)

### Can't Find the Secret
**Problem:** You forgot your CRON_SECRET

**Solution:**
1. Generate a new one using Step 1
2. Update both `.env.local` and Vercel environment variables
3. Redeploy

---

## Complete Example

### Full `.env.local` File
```bash
# Cron Secret (for Vercel cron jobs)
CRON_SECRET=Xk7vN2pQwR8yH4mL9cT6bF3sA1dG5jK0

# Other environment variables...
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
RESEND_API_KEY=re_xxxxx
```

### Vercel Environment Variables Dashboard
```
CRON_SECRET = Xk7vN2pQwR8yH4mL9cT6bF3sA1dG5jK0
  ✓ Production
  ✓ Preview
  ✓ Development
```

---

## Need Help?

- Check the full documentation: `/app/api/cron/check-trials/README.md`
- **Vercel Cron Jobs Official Docs:** https://vercel.com/docs/cron-jobs
- **Vercel Cron Security:** https://vercel.com/docs/cron-jobs/manage-cron-jobs#securing-cron-jobs
- Create an issue on GitHub if you're stuck

## Alternative: Use Vercel's Built-in Cron Secret

Vercel automatically provides a `CRON_SECRET` environment variable when you deploy. You can use that instead:

1. In your Vercel Dashboard, the `CRON_SECRET` is auto-generated
2. Use it in your code (already set up in Vercel's environment)
3. No need to create your own!

**However, we recommend creating your own** for:
- Better control
- Easier local development and testing
- Consistent behavior across environments

---

**That's it!** Your cron secret is now set up and ready to protect your trial expiry endpoint. 🎉
