# Admin Guide - Junior Football Nutrition Tracker

## 🔐 Admin Access

### Quick Access Links
- **Admin Signup**: https://junior-football-nutrition-client.onrender.com/admin-signup
- **Admin Sign In**: https://junior-football-nutrition-client.onrender.com/sign-in
- **Dashboard**: https://junior-football-nutrition-client.onrender.com/dashboard

### Admin Credentials
- **Email**: admin@fcinter.fi
- **Password**: [You create this during signup]
- **Role**: ADMIN (Full system access)

## 📊 Admin Dashboard Features

### 1. Main Dashboard (`/dashboard`)
Once logged in as admin, you'll see an enhanced dashboard with:
- **System Overview**: Total users, teams, and activity metrics
- **Team Performance**: Average nutrition scores across all teams
- **User Activity**: Recent signups and active users
- **Quick Actions**: Direct links to admin functions

### 2. Admin Monitor (`/admin/monitor`)
Real-time system monitoring:
- **User Statistics**: Total players, coaches, parents
- **Database Health**: Connection status and performance
- **Activity Logs**: Recent user actions
- **System Alerts**: Any issues requiring attention
- **Performance Metrics**: API response times, database queries

### 3. Admin Invite (`/admin/invite`)
Bulk invitation system:
- **Send Team Invites**: Email invitations to entire teams
- **Coach Assignments**: Invite and assign coaches to teams
- **Parent Access**: Send parent account invitations
- **Track Invitations**: Monitor accepted/pending invites

### 4. Coach Dashboard (`/coach`)
View as admin overseeing all coaches:
- **All Teams Overview**: Performance across all teams
- **Coach Activity**: Which coaches are active
- **Team Comparisons**: Compare nutrition scores between teams
- **Generate Reports**: Export team performance data

### 5. Team Management (`/team`)
Complete team administration:
- **Create New Teams**: Set up new teams with invite codes
- **Manage Members**: Add/remove players and coaches
- **Team Settings**: Update team names, descriptions
- **Access Codes**: Generate and manage team invite codes

## 🎯 Admin Capabilities

### User Management
- ✅ View all registered users
- ✅ Update user roles (Player → Coach)
- ✅ Reset user passwords
- ✅ Delete inactive accounts
- ✅ View individual user nutrition data

### Team Management
- ✅ Create new teams
- ✅ Assign coaches to teams
- ✅ Move players between teams
- ✅ Generate team invite codes
- ✅ View team analytics

### System Administration
- ✅ Monitor system health
- ✅ View error logs
- ✅ Database management
- ✅ Generate system reports
- ✅ Configure global settings

### Analytics & Reporting
- ✅ System-wide nutrition trends
- ✅ Team performance comparisons
- ✅ User engagement metrics
- ✅ Export data to CSV/Excel
- ✅ Custom report generation

## 🚀 Getting Started as Admin

### First Time Setup
1. Go to: https://junior-football-nutrition-client.onrender.com/admin-signup
2. Enter email: `admin@fcinter.fi`
3. Create a strong password (minimum 8 characters)
4. Click "Create Admin Account"
5. You'll be redirected to the admin dashboard

### Daily Admin Tasks
1. **Check System Health**: Visit `/admin/monitor` to ensure everything is running
2. **Review New Users**: Check for new signups and team assignments
3. **Monitor Teams**: Review team nutrition scores and activity
4. **Respond to Issues**: Check for any user reports or system alerts

## 📈 Current System Status

### FC Inter p13 2012 Team
- **Status**: Active ✅
- **Team Code**: INTER-P13-C456
- **Expected Players**: 25+
- **Coach**: Assigned
- **Signup URL**: https://junior-football-nutrition-client.onrender.com/fc-inter-signup

### System Metrics
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Supabase Auth
- **Hosting**: Render.com
- **Frontend**: React + TypeScript
- **Backend**: Node.js + Express

## 🛠️ Admin Tools & Commands

### Database Access
If you need direct database access:
1. Log into Supabase Dashboard
2. Navigate to your project
3. Use SQL Editor for queries

### Common Admin Queries
```sql
-- View all users
SELECT * FROM "User" ORDER BY "createdAt" DESC;

-- View team members
SELECT u.name, u.email, t.name as team_name 
FROM "User" u 
JOIN "Team" t ON u."teamId" = t.id;

-- Check nutrition scores
SELECT AVG("nutritionScore") as avg_score 
FROM "FoodEntry" 
WHERE date >= CURRENT_DATE - INTERVAL '7 days';
```

## 🔔 Notifications & Alerts

As admin, you'll receive notifications for:
- New team registrations
- System errors or downtime
- Database capacity warnings
- Unusual user activity
- Coach requests for assistance

## 📱 Mobile Admin Access

The admin dashboard is fully responsive:
- Works on all devices (phone, tablet, desktop)
- Touch-optimized for mobile management
- Real-time updates on all platforms

## 🆘 Troubleshooting

### Common Issues

#### Can't Access Admin Features
- Ensure you're logged in with admin@fcinter.fi
- Clear browser cache and cookies
- Try incognito/private browsing mode

#### Team Not Showing Up
- Check team creation in database
- Verify invite codes are active
- Ensure team has assigned coach

#### User Can't Log In
- Check user exists in database
- Verify email is correct
- Reset password if needed

## 📞 Support Contacts

### Technical Support
- **System Issues**: Check Render.com dashboard
- **Database**: Supabase support
- **Application Bugs**: GitHub issues

### Team Support
For FC Inter p13 2012:
- Direct players to: https://junior-football-nutrition-client.onrender.com/fc-inter-signup
- Team code: INTER-P13-C456

## 🔒 Security Best Practices

1. **Password Security**
   - Use strong, unique password
   - Change password regularly
   - Never share admin credentials

2. **Access Control**
   - Only grant admin access when necessary
   - Review admin users regularly
   - Monitor admin activity logs

3. **Data Protection**
   - Regular backups (handled by Supabase)
   - Encrypted connections (HTTPS)
   - GDPR compliant data handling

## 📊 Weekly Admin Checklist

- [ ] Review system health metrics
- [ ] Check new user registrations
- [ ] Monitor team nutrition scores
- [ ] Review and respond to coach requests
- [ ] Generate weekly performance report
- [ ] Check for system updates
- [ ] Backup important data
- [ ] Review error logs

## 🚦 Quick Status Check

Current System Status:
- **Backend API**: ✅ Running at https://junior-football-nutrition-tracker.onrender.com
- **Frontend**: ✅ Live at https://junior-football-nutrition-client.onrender.com
- **Database**: ✅ Supabase PostgreSQL
- **Authentication**: ✅ Supabase Auth
- **FC Inter Team**: ✅ Created with code INTER-P13-C456

---

**Admin Dashboard URL**: https://junior-football-nutrition-client.onrender.com/dashboard

**Remember**: With great power comes great responsibility. As admin, you have full access to all user data and system functions. Use these privileges wisely to support the teams and improve their nutrition tracking experience!