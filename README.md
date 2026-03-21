# Pop-Up Panic

**Congratulations! You are the 1,000,000th visitor! 🎉 Click here to claim your prize!**

Pop-Up Panic is a lovingly AI-crafted descent into digital madness — a browser experience written almost entirely by Copilot CLI and various models (mainly claude-opus-4.5) that weaponizes your internet childhood against you. Remember dial-up modems? Dancing banana GIFs? Ads that screamed "YOUR COMPUTER HAS A VIRUS" in Comic Sans? This app remembers. This app *is* those ads.

Every era of internet advertising — from the blinking GeoCities banners of the 90s to the passive-aggressive cookie consent popups of today — has been painstakingly recreated by an AI that has read far too many terrible websites and now wants to share the trauma. The result is a relentless, anxiety-inducing parade of nostalgia that asks the deep question: *was the internet always this chaotic, or did we just get used to it?*

The answer is yes.

![Pop-Up Panic Screenshot](PopUpPanic.png)

Pull Requests are welcome to add in additional internet eras, jokes, or deceiving ad mechanics.

---

## 🖼️ Recent Ads

| Ad | Preview |
|---|---|
| 💳 Early Web — Credit Card Scam | ![Credit card scam ad](https://github.com/user-attachments/assets/5c13656e-d72b-4c6b-b973-074f1ce75f0d) |
| 📸 Gen-Z — BeReal ALERT! | ![BeReal standalone ad](https://github.com/user-attachments/assets/b60f64d9-33e5-4aac-b023-7f66d8340bc3) |
| 🏃 Gen-Z — Strava Feed (endless scroll) | ![Strava feed endless scroll](https://github.com/user-attachments/assets/c23bc8c7-18ca-428f-9859-83fbbc5a3aa8) |

---

## 🛠️ Preview Script

`preview.js` lets you open a specific ad popup in a headless browser and save a screenshot — useful for validating new ads without having to play through the game.

### Setup

```bash
npm install
```

> Requires [Node.js](https://nodejs.org) 18+ and a system Chromium/Chrome browser.

### Usage

```
node preview.js [era[:mechanism[:adIndex]]] [outputFile]
node preview.js --list
```

| Argument | Description |
|---|---|
| `era` | Era key (see `--list`). Default: `earlyWeb` |
| `mechanism` | Close-mechanism key (see `--list`). Default: `simpleX` |
| `adIndex` | Index number **or** keyword to search in ad text. Default: `0` |
| `outputFile` | Output PNG path. Default: `screenshots/<era>-<mechanism>-<adIndex>.png` |

### Examples

```bash
# List all available era and mechanism keys
node preview.js --list

# First ad from the Early Web era (default simpleX mechanism)
node preview.js earlyWeb

# Specific ad by index
node preview.js earlyWeb:simpleX:2

# Search for an ad by keyword in its text
node preview.js earlyWeb:simpleX:credit
node preview.js earlyWeb:simpleX:SSN

# Gen-Z Strava endless-scroll feed (auto-clicks × to reveal the feed)
node preview.js genZ:endlessScroll

# BeReal standalone popup
node preview.js genZ:simpleX:BeReal

# AI era with the AI-picker close mechanism
node preview.js ai:aiPicker

# Save to a custom path
node preview.js earlyWeb:simpleX:credit screenshots/my-preview.png
```

Screenshots are saved to the `screenshots/` folder by default.
