# Git History Cleanup Guide - Removing Exposed Email Addresses

**Date:** November 7, 2025
**Reason:** Remove hardcoded email addresses from git history before making repository public
**Status:** ⚠️ REQUIRES CAREFUL EXECUTION

---

## ⚠️ WARNING: Force Push Required

This process **rewrites git history** and requires **force pushing**. This will:

- Change all commit hashes from the point of change onward
- Require all collaborators to re-clone the repository
- Make old clones incompatible with the rewritten history

**Only proceed if:**

- ✅ You have backups of the repository
- ✅ All team members are aware of the history rewrite
- ✅ You understand the consequences of force pushing

---

## 📋 Files to Clean

The following file contains exposed email addresses in git history:

```
src/lib/auth/allowlist.ts
```

**Exposed emails:**

- `REDACTED@example.com`
- `REDACTED@example.com`
- `REDACTED@example.com`
- `test@example.com` (safe, but will be removed anyway)

---

## 🔧 Cleanup Methods

### Option 1: BFG Repo-Cleaner (Recommended - Fastest)

**Why BFG:** Faster than git-filter-branch, designed for this purpose.

#### Step 1: Install BFG

```bash
# On Ubuntu/Debian
sudo apt-get install bfg

# Or download directly
wget https://repo1.maven.org/maven2/com/madgag/bfg/1.14.0/bfg-1.14.0.jar
alias bfg='java -jar bfg-1.14.0.jar'
```

#### Step 2: Create Replacement File

```bash
# Create a file with email replacements
cat > emails-to-replace.txt <<EOF
REDACTED@example.com==>user@example.com
REDACTED@example.com==>user@example.com
REDACTED@example.com==>user@example.com
EOF
```

#### Step 3: Clone Fresh Copy

```bash
# Clone a fresh mirror of the repo
cd /tmp
git clone --mirror https://github.com/roofsonfire/chat.git chat-cleanup
cd chat-cleanup
```

#### Step 4: Run BFG

```bash
# Replace emails in all files and commits
bfg --replace-text emails-to-replace.txt

# OR remove the entire file from history
bfg --delete-files allowlist.ts
```

#### Step 5: Clean Up and Force Push

```bash
# Clean up loose objects
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Verify changes
git log --all --oneline --graph

# Push changes (THIS REWRITES HISTORY)
git push --force --all
git push --force --tags
```

---

### Option 2: git-filter-repo (Alternative)

**Why filter-repo:** Modern replacement for git-filter-branch.

#### Step 1: Install git-filter-repo

```bash
pip3 install git-filter-repo
```

#### Step 2: Create Replacement File

```bash
# Create replacements file
cat > emails-replacement.txt <<EOF
REDACTED@example.com==>REDACTED@example.com
REDACTED@example.com==>REDACTED@example.com
REDACTED@example.com==>REDACTED@example.com
EOF
```

#### Step 3: Run filter-repo

```bash
# Fresh clone
cd /tmp
git clone https://github.com/roofsonfire/chat.git chat-cleanup
cd chat-cleanup

# Replace emails in file contents
git filter-repo --replace-text emails-replacement.txt

# Verify
git log --all --oneline --stat | grep allowlist
```

#### Step 4: Force Push

```bash
# Add remote back (filter-repo removes it)
git remote add origin https://github.com/roofsonfire/chat.git

# Force push
git push --force --all
git push --force --tags
```

---

### Option 3: Manual git-filter-branch (Not Recommended)

**Use only if other options fail.**

```bash
git filter-branch --tree-filter '
  if [ -f src/lib/auth/allowlist.ts ]; then
    sed -i "s/REDACTED@example.com/REDACTED@example.com/g" src/lib/auth/allowlist.ts
    sed -i "s/REDACTED@example.com/REDACTED@example.com/g" src/lib/auth/allowlist.ts
    sed -i "s/REDACTED@example.com/REDACTED@example.com/g" src/lib/auth/allowlist.ts
  fi
' --all

# Clean up
rm -rf .git/refs/original/
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push
git push --force --all
git push --force --tags
```

---

## 🔍 Verification Steps

After cleanup, verify emails are removed:

```bash
# Search for exposed emails in history
git log --all -S "REDACTED@example.com"
git log --all -S "REDACTED@example.com"
git log --all -S "REDACTED@example.com"

# Should return NO results if successful

# Check current file
cat src/lib/auth/allowlist.ts
# Should use environment variables, not hardcoded emails

# Verify all branches
git branch -a

# Check commit hashes changed
git log --oneline -5
```

---

## 📢 Team Communication

**Before starting:**

1. Notify all team members
2. Ask them to commit and push their work
3. Schedule the cleanup for a time when no one is actively working

**After cleanup:**

1. Notify team that history has been rewritten
2. Provide instructions for updating their clones

---

## 🔄 Team Member Update Instructions

Send this to all collaborators:

````markdown
## Repository History Updated - Action Required

The git history has been rewritten to remove exposed email addresses.

### Update Your Local Repository

**Option 1: Fresh Clone (Recommended)**

```bash
# Backup your work
cd ~/Projects/roofs/chat
git stash  # Save any uncommitted changes
cd ..
mv chat chat-old-backup

# Fresh clone
git clone https://github.com/roofsonfire/chat.git
cd chat

# Apply your stashed changes if needed
# (manually copy from chat-old-backup)
```
````

**Option 2: Force Pull (Advanced)**

```bash
# WARNING: This will delete any uncommitted changes
cd ~/Projects/roofs/chat

# Backup first!
git stash

# Reset to new history
git fetch origin
git reset --hard origin/develop

# Verify
git log --oneline -5
```

```

---

## 🎯 Recommended Approach

**For this repository, I recommend:**

1. **Use BFG Repo-Cleaner** (fastest and safest)
2. **Replace emails with REDACTED@example.com** (maintains file structure)
3. **Do it on a Friday evening** (less disruption)
4. **Verify thoroughly** before and after

---

## 🚨 Post-Cleanup Checklist

After successful cleanup:

- [ ] Verify emails removed from history (`git log -S "email@example.com"`)
- [ ] Check current file uses environment variables
- [ ] All tests passing
- [ ] Production deployment updated with new env var
- [ ] Staging deployment updated
- [ ] `.env.example` updated with `ALLOWED_EMAILS`
- [ ] Documentation updated
- [ ] Team notified
- [ ] ADR 006 marked as implemented
- [ ] Security audit updated

---

## 📚 References

- [BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/)
- [git-filter-repo](https://github.com/newren/git-filter-repo)
- [GitHub: Removing sensitive data](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)
- [Git Tools - Rewriting History](https://git-scm.com/book/en/v2/Git-Tools-Rewriting-History)

---

## ⏭️ Next Steps

1. **Review this guide** with team
2. **Schedule cleanup time**
3. **Execute cleanup** (follow Option 1 - BFG)
4. **Verify** thoroughly
5. **Update deployments** with new `ALLOWED_EMAILS` env var
6. **Make repository public** (now safe!)

---

**Created:** 2025-11-07
**Last Updated:** 2025-11-07
**Status:** Ready for execution
```
