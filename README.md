# Mod Day Planner

Shows today's letter day (A–F), the bell schedule, and your classes by mod.
Each mod ends 3 minutes before the next mod or activity starts. The letter day and
schedule are read from the school's Google Calendar twice a day.

## One-time setup (about 10 minutes, all in a web browser)

### 1. Create the repository
1. Sign in at github.com and click **+** (top right) → **New repository**.
2. Name it `mod-day` (or anything you like). Choose **Public**. Click **Create repository**.

> GitHub Pages is free on public repositories. Only letter days and schedule
> names are published. Your classes stay on your own devices, and the
> calendar address is kept as a hidden secret.

### 2. Upload the files
1. On the new repository's page, click **uploading an existing file**.
2. Unzip `mod-day-planner-site.zip` on your computer. Open the folder, select **everything
   inside it** (including the `.github` folder), and drag it all into the upload area.
   - On a Mac, press **Cmd + Shift + .** in Finder to show the hidden `.github` folder.
   - On Windows, turn on **View → Show → Hidden items** in File Explorer.
3. Click **Commit changes**.
4. Check that the file list shows `.github/workflows/update-calendar.yml`. If it's missing,
   click **Add file → Create new file**, type `.github/workflows/update-calendar.yml` as
   the name, paste in that file's contents, and commit.

### 3. Give it the calendar address (kept secret)
1. In Google Calendar on a computer, hover over the school calendar → **⋮** → **Settings and sharing**.
2. Scroll to **Integrate calendar** and copy **Public address in iCal format**. If that isn't
   there, copy **Secret address in iCal format**. Either one ends in `.ics`.
3. In your GitHub repository: **Settings → Secrets and variables → Actions → New repository secret**.
4. Name: `ICS_URL`. Secret: paste the address. Click **Add secret**.

### 4. Turn on the website
1. **Settings → Pages**.
2. Under **Build and deployment**, set Source to **Deploy from a branch**, Branch to **main**, folder **/ (root)**. Click **Save**.

### 5. Load the calendar the first time
1. Click the **Actions** tab. If asked, click **I understand my workflows, go ahead and enable them**.
2. Click **Update school calendar** → **Run workflow** → **Run workflow**.
3. After about a minute it shows a green check, and `calendar.json` now has the letter days.
   After this it runs by itself every day at about 5:15 am and 12:15 pm.

Your app is at **https://YOUR-USERNAME.github.io/mod-day/** (Settings → Pages shows the exact link).
The first time, it can take a few minutes to appear.

## Put it on your phone or laptop
- **iPhone:** open the link in Safari → Share → **Add to Home Screen**.
- **Android:** open it in Chrome → ⋮ → **Add to Home screen** (or **Install app**).
- **Laptop (Chrome or Edge):** click the install icon at the right end of the address bar.

Once installed, it opens like an app and still works without a connection, showing the most recent calendar it downloaded.

## Your classes on more than one device
Classes are saved on each device. Enter them once, then go to **Calendar → Move my classes to
another device → Copy my code**. On your other device, paste the code in the same box and tap **Load a code**.

## If something looks wrong
- **The letter day is missing or wrong:** open **Actions → Update school calendar** and check
  whether the last run has a red X. Click it to see the message (most often the `ICS_URL` secret is wrong).
- **The calendar titles don't match:** the app looks for titles like "B Day", "Day B", "Activity #4",
  "Activity Schedule 7", or "Homeroom #2". A letter day with no schedule named uses the daily
  schedule. The matching rules are in `ics-parse.js` (`findLetter` and `findSched`).
- **A one-day change:** on the Today screen, use **Change letter day or schedule for this date**.
- **Schedule times change:** they're listed at the top of the script in `index.html` (`RAW`).
