# Network Access Guide - Elisa Kotinetti 5G

## ✅ Your App is Now Accessible on Your Local Network!

### 📱 Access URLs from Any Device on Your Network:

**From your phone, tablet, or another computer connected to the same WiFi:**

1. **Main App**: http://192.168.68.104:5176
2. **Dashboard**: http://192.168.68.104:5176/dashboard
3. **Test Invite**: http://192.168.68.104:5176/test-invite
4. **Admin Monitor**: http://192.168.68.104:5176/admin/monitor

### 📧 Updated Invitation URL for ilmivalta@gmail.com:

Since the port changed to 5176, use this updated invitation URL:
```
http://192.168.68.104:5176/sign-up?invite=baeff9d5b153471d&email=ilmivalta%40gmail.com&role=PLAYER&team=TEST-TEAM-2024
```

### 🔧 Server Status:
- **Frontend**: Running on port 5176 (network accessible)
- **Backend**: Running on port 3001 (API server)
- **Database**: PostgreSQL on port 5433

### 📱 How to Test on Mobile:

1. **Make sure your phone is connected to the same WiFi** (Elisa Kotinetti 5G)
2. **Open your mobile browser** (Chrome, Safari, etc.)
3. **Enter the URL**: `http://192.168.68.104:5176`
4. **Sign in or sign up** to test the app

### 🎯 Testing Tips:

1. **Test responsiveness**: The app should work well on mobile screens
2. **Test offline mode**: Try turning off WiFi briefly after loading
3. **Test different browsers**: Chrome, Safari, Firefox
4. **Share with test users**: Anyone on your network can access it

### ⚠️ Important Notes:

- **Windows Firewall**: If you can't connect, Windows Firewall might be blocking it
  - Allow Node.js through Windows Firewall when prompted
  - Or temporarily disable Windows Firewall for testing
  
- **IP might change**: If your computer restarts or network changes, run `ipconfig` again to get the new IP

- **Port conflicts**: The app is using port 5176 (not 5174) because other ports were in use

### 🚀 Quick Test Links:

Test these on your phone right now:
- Homepage: http://192.168.68.104:5176
- Sign Up: http://192.168.68.104:5176/sign-up
- Sign In: http://192.168.68.104:5176/sign-in

### 📲 Share with Test Users:

You can now share these URLs with anyone on your Elisa Kotinetti 5G network for testing!