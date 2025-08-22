# GitHub Repository Settings Checklist

## 1. ✅ Check/Add SONAR_TOKEN Secret

### Navigate to:
**https://github.com/Koukkukasi/junior-football-nutrition-tracker/settings/secrets/actions**

### Check if SONAR_TOKEN exists:
- Look for "SONAR_TOKEN" in the repository secrets list
- If it's NOT there, you need to add it

### How to Add SONAR_TOKEN:

#### Option A: Quick Setup (Without SonarCloud)
If you want to test CI/CD without SonarCloud for now:
1. Click "New repository secret"
2. **Name**: `SONAR_TOKEN`
3. **Value**: `dummy-token-for-testing`
4. Click "Add secret"

This will let workflows run but skip actual SonarCloud analysis.

#### Option B: Full Setup (With SonarCloud) - Recommended
1. **Go to**: https://sonarcloud.io
2. **Sign in** with GitHub
3. Click **"+"** → **"Analyze new project"**
4. **Import** your repository: `Koukkukasi/junior-football-nutrition-tracker`
5. Go to **My Account** → **Security** → **Generate Token**
6. **Copy** the generated token
7. Go back to GitHub repository secrets
8. Click **"New repository secret"**
9. **Name**: `SONAR_TOKEN`
10. **Value**: [Paste the token from SonarCloud]
11. Click **"Add secret"**

---

## 2. ✅ Verify GitHub Actions is Enabled

### Navigate to:
**https://github.com/Koukkukasi/junior-football-nutrition-tracker/settings/actions/general**

### Check these settings:

#### Actions Permissions
- ✅ **Actions should be enabled**: "Allow all actions and reusable workflows"
- If disabled, select: **"Allow all actions and reusable workflows"**

#### Workflow Permissions
**IMPORTANT**: This is likely the issue!

Select:
- 🔘 **Read and write permissions**
- ☑️ **Allow GitHub Actions to create and approve pull requests**

These permissions allow workflows to:
- Post comments on PRs
- Update status checks
- Create artifacts
- Modify PR checks

#### Fork Pull Request Workflows
For public repos, consider:
- "Require approval for first-time contributors" (recommended)
- This prevents spam PRs from using your Actions minutes

### Click "Save" after making changes

---

## 3. ✅ Check Workflow Files Exist

### Navigate to:
**https://github.com/Koukkukasi/junior-football-nutrition-tracker/tree/main/.github/workflows**

### Verify these files exist:
- ✅ `code-review.yml` - Main PR analysis workflow
- ✅ `continuous-monitoring.yml` - Daily quality checks

If these files are visible, workflows should trigger.

---

## 4. 🔍 Quick Diagnostic

### Check if Actions are running:
**https://github.com/Koukkukasi/junior-football-nutrition-tracker/actions**

You should see:
- Workflow runs listed (even if failed)
- If completely empty, Actions might be disabled

### Check your PR:
**https://github.com/Koukkukasi/junior-football-nutrition-tracker/pulls**

Look for:
- Status checks section
- "Some checks haven't completed yet" or similar
- Bot comments (github-actions[bot])

---

## 🚀 Quick Fix Steps (Do This Now)

1. **Go to Settings → Actions → General**
   - Set to: "Allow all actions and reusable workflows"
   - Set Workflow permissions to: "Read and write permissions"
   - Check: "Allow GitHub Actions to create and approve pull requests"
   - Click **Save**

2. **Add SONAR_TOKEN (minimum for testing)**
   - Settings → Secrets → Actions
   - New repository secret
   - Name: `SONAR_TOKEN`
   - Value: `dummy-token-for-testing` (for quick test)
   - Add secret

3. **Re-run workflows**
   - Go to your PR
   - Close and reopen it (this retriggers workflows)
   - OR go to Actions tab → Click failed workflow → "Re-run all jobs"

---

## 🎯 Expected Result After Fix

Within 2-3 minutes of fixing permissions:
- ✅ Workflows appear in Actions tab
- ✅ Status checks show on PR
- ✅ Automated comment posted
- ✅ Quality analysis completes

---

## 💡 Most Common Issue

**90% of the time it's**: Workflow permissions not set to "Read and write"

This prevents GitHub Actions from posting comments and updating PR status.

---

*Last Updated: 2025-08-22*
*If workflows still don't run after these fixes, check if the repository has any branch protection rules that might be blocking.*