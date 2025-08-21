#!/bin/bash

# Setup Branch Protection Rules for Junior Football Nutrition Tracker
# This script configures branch protection using GitHub CLI

set -e

echo "🔒 Setting up branch protection rules..."

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed. Please install it first."
    echo "Visit: https://cli.github.com/"
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo "❌ Not authenticated with GitHub. Please run: gh auth login"
    exit 1
fi

# Get repository information
REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)
echo "📦 Repository: $REPO"

# Function to set branch protection
set_branch_protection() {
    local branch=$1
    local min_quality=$2
    local min_coverage=$3
    
    echo "🔧 Configuring protection for branch: $branch"
    
    # Create branch protection rule
    gh api -X PUT "repos/$REPO/branches/$branch/protection" \
        --input - <<EOF
{
  "required_status_checks": {
    "strict": true,
    "contexts": [
      "Code Quality Analysis",
      "Security Analysis",
      "Performance Testing",
      "Test Coverage",
      "Quality Gates"
    ]
  },
  "enforce_admins": false,
  "required_pull_request_reviews": {
    "required_approving_review_count": 1,
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": true
  },
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "required_conversation_resolution": true,
  "required_linear_history": false,
  "allow_squash_merge": true,
  "allow_merge_commit": true,
  "allow_rebase_merge": true,
  "delete_branch_on_merge": true
}
EOF
    
    echo "✅ Branch protection configured for: $branch"
}

# Function to create custom quality gate check
create_quality_gate() {
    local branch=$1
    
    echo "📊 Creating quality gate for branch: $branch"
    
    # Create a GitHub App or use Actions to enforce quality gates
    cat > .github/quality-gate-$branch.json <<EOF
{
  "branch": "$branch",
  "quality_gates": {
    "minimum_quality_score": ${2:-50},
    "maximum_issues": ${3:-100},
    "minimum_test_coverage": ${4:-70},
    "security_score_threshold": ${5:-85},
    "bundle_size_limit_mb": ${6:-2}
  },
  "enforcement": "strict"
}
EOF
    
    echo "✅ Quality gate configuration created"
}

# Function to setup CODEOWNERS
setup_codeowners() {
    echo "👥 Setting up CODEOWNERS..."
    
    cat > .github/CODEOWNERS <<EOF
# Code Owners for Junior Football Nutrition Tracker

# Global owners
* @your-github-username

# Frontend code
/client/ @frontend-team
/client/src/components/ @ui-team
/client/src/pages/ @frontend-team
/client/tests/ @qa-team

# Backend code
/server/ @backend-team
/server/src/routes/ @api-team
/server/prisma/ @database-team

# Agent system
/client/agents/ @ai-team
/client/agents/code-review-agent/ @devops-team

# Configuration files
/.github/ @devops-team
/docker-compose.yml @devops-team
/*.json @maintainers
/*.config.* @maintainers

# Documentation
/*.md @documentation-team
/docs/ @documentation-team
EOF
    
    echo "✅ CODEOWNERS file created"
}

# Function to create PR template
create_pr_template() {
    echo "📝 Creating PR template..."
    
    cat > .github/pull_request_template.md <<'EOF'
## 📋 Description
<!-- Provide a brief description of the changes -->

## 🎯 Type of Change
- [ ] 🐛 Bug fix
- [ ] ✨ New feature
- [ ] 🔧 Configuration change
- [ ] 📚 Documentation update
- [ ] ♻️ Code refactoring
- [ ] 🎨 Style/UI update
- [ ] ⚡ Performance improvement
- [ ] 🔒 Security fix

## ✅ Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated if needed
- [ ] Tests added/updated
- [ ] All tests passing locally
- [ ] No console.log statements
- [ ] No hardcoded values

## 🧪 Testing
<!-- Describe the tests you ran -->

## 📊 Code Quality Metrics
<!-- These will be auto-populated by CI/CD -->
- Quality Score: _Pending_
- Test Coverage: _Pending_
- Security Score: _Pending_
- Bundle Size Impact: _Pending_

## 📸 Screenshots (if applicable)
<!-- Add screenshots for UI changes -->

## 🔗 Related Issues
<!-- Link related issues: Closes #123 -->

## 💬 Additional Notes
<!-- Any additional information -->

---
*🤖 Automated checks will run upon submission*
EOF
    
    echo "✅ PR template created"
}

# Function to create issue templates
create_issue_templates() {
    echo "📝 Creating issue templates..."
    
    mkdir -p .github/ISSUE_TEMPLATE
    
    # Bug report template
    cat > .github/ISSUE_TEMPLATE/bug_report.yml <<'EOF'
name: 🐛 Bug Report
description: Report a bug in the application
title: "[BUG] "
labels: ["bug", "needs-triage"]
body:
  - type: markdown
    attributes:
      value: |
        Thanks for reporting a bug! Please fill out the sections below.
  
  - type: textarea
    id: description
    attributes:
      label: Bug Description
      description: A clear description of the bug
      placeholder: Tell us what happened
    validations:
      required: true
  
  - type: textarea
    id: reproduction
    attributes:
      label: Steps to Reproduce
      description: Steps to reproduce the behavior
      value: |
        1. Go to '...'
        2. Click on '...'
        3. Scroll down to '...'
        4. See error
    validations:
      required: true
  
  - type: textarea
    id: expected
    attributes:
      label: Expected Behavior
      description: What you expected to happen
    validations:
      required: true
  
  - type: dropdown
    id: severity
    attributes:
      label: Severity
      options:
        - Critical
        - High
        - Medium
        - Low
    validations:
      required: true
  
  - type: input
    id: version
    attributes:
      label: Version
      description: Application version
      placeholder: v1.0.0
  
  - type: textarea
    id: logs
    attributes:
      label: Console Logs
      description: Any relevant console output
      render: shell
EOF
    
    # Feature request template
    cat > .github/ISSUE_TEMPLATE/feature_request.yml <<'EOF'
name: ✨ Feature Request
description: Suggest a new feature
title: "[FEATURE] "
labels: ["enhancement", "needs-triage"]
body:
  - type: markdown
    attributes:
      value: |
        Thanks for suggesting a feature! Please provide details below.
  
  - type: textarea
    id: description
    attributes:
      label: Feature Description
      description: Clear description of the feature
    validations:
      required: true
  
  - type: textarea
    id: motivation
    attributes:
      label: Motivation
      description: Why is this feature needed?
    validations:
      required: true
  
  - type: textarea
    id: alternatives
    attributes:
      label: Alternatives Considered
      description: Any alternative solutions you've considered
  
  - type: dropdown
    id: priority
    attributes:
      label: Priority
      options:
        - High
        - Medium
        - Low
    validations:
      required: true
EOF
    
    echo "✅ Issue templates created"
}

# Function to setup GitHub Actions secrets reminder
setup_secrets_reminder() {
    echo "🔑 GitHub Secrets Required:"
    echo ""
    echo "Please add the following secrets to your repository:"
    echo "  1. SONAR_TOKEN - From SonarCloud"
    echo "  2. CODECOV_TOKEN - From Codecov (optional)"
    echo "  3. SLACK_WEBHOOK_URL - For notifications (optional)"
    echo ""
    echo "To add secrets:"
    echo "  1. Go to: https://github.com/$REPO/settings/secrets/actions"
    echo "  2. Click 'New repository secret'"
    echo "  3. Add each secret with its value"
}

# Main execution
echo "🚀 Starting branch protection setup..."
echo ""

# Setup main branch protection
set_branch_protection "main" 50 70

# Setup develop branch protection (if exists)
if git show-ref --verify --quiet refs/heads/develop; then
    set_branch_protection "develop" 40 60
fi

# Create quality gates
create_quality_gate "main" 50 100 70 85 2
create_quality_gate "develop" 40 150 60 75 3

# Setup CODEOWNERS
setup_codeowners

# Create templates
create_pr_template
create_issue_templates

# Setup reminders
setup_secrets_reminder

echo ""
echo "✅ Branch protection setup complete!"
echo ""
echo "📋 Next steps:"
echo "  1. Review and commit the generated files"
echo "  2. Push to your repository"
echo "  3. Add required secrets to GitHub"
echo "  4. Enable GitHub Pages for quality dashboard"
echo "  5. Configure SonarCloud project"
echo ""
echo "📊 Quality Dashboard will be available at:"
echo "   https://$(echo $REPO | cut -d'/' -f1).github.io/$(echo $REPO | cut -d'/' -f2)/quality-dashboard/"
echo ""
echo "🎉 Happy coding with automated quality monitoring!"