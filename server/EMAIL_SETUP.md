# Email Configuration Guide

## Quick Setup for Gmail

### Step 1: Enable 2-Factor Authentication
1. Go to your Google Account settings
2. Security → 2-Step Verification
3. Follow the setup process

### Step 2: Generate App Password
1. Go to: https://myaccount.google.com/apppasswords
2. Select "Mail" as the app
3. Select "Windows Computer" as device
4. Click "Generate"
5. Copy the 16-character password

### Step 3: Add to .env file
```env
# Add these lines to your server/.env file
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=xxxx-xxxx-xxxx-xxxx  # The 16-character app password
```

### Step 4: Run the invitation script
```bash
cd server
npx ts-node src/scripts/send-email-invite.ts
```

## Alternative: Manual Sending

The invitation has been prepared and saved to:
- HTML version: `server/emails/invitation_ilmivalta@gmail.com_[timestamp].html`
- Text version: `server/emails/invitation_ilmivalta@gmail.com_[timestamp].txt`

You can:
1. Open the HTML file in a browser
2. Copy the content to your email client
3. Send manually to ilmivalta@gmail.com

## Invitation URL for ilmivalta@gmail.com

```
http://localhost:5174/sign-up?invite=baeff9d5b153471d&email=ilmivalta%40gmail.com&role=PLAYER&team=TEST-TEAM-2024
```

This URL will:
- Pre-fill the email address
- Set role as PLAYER
- Assign to TEST-TEAM-2024
- Valid for 7 days

## Testing Without Email

You can also share the invitation URL directly via:
- WhatsApp
- Slack
- Discord
- SMS
- Or any messaging platform

The recipient just needs to click the link to start the signup process!