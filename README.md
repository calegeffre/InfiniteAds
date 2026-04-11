# Pop-Up Panic

**Congratulations! You are the 1,000,000th visitor! 🎉 Click here to claim your prize!**

Pop-Up Panic is a lovingly AI-crafted descent into digital madness — a browser experience written almost entirely by Copilot CLI and various models (mainly claude-opus-4.5) that weaponizes your internet childhood against you. Remember dial-up modems? Dancing banana GIFs? Ads that screamed "YOUR COMPUTER HAS A VIRUS" in Comic Sans? This app remembers. This app *is* those ads.

Every era of internet advertising — from the blinking GeoCities banners of the 90s to the passive-aggressive cookie consent popups of today — has been painstakingly recreated by an AI that has read far too many terrible websites and now wants to share the trauma. The result is a relentless, anxiety-inducing parade of nostalgia that asks the deep question: *was the internet always this chaotic, or did we just get used to it?*

The answer is yes.

![Pop-Up Panic Screenshot](PopUpPanic.png)

Pull Requests are welcome to add in additional internet eras, jokes, or deceiving ad mechanics.

---

## 🏗️ Project Structure

Everything lives in a single file: **`index.html`** — HTML, CSS, and all JavaScript together, no build step required.  
The only dependency is `playwright` (a dev dependency used by `preview.js` for screenshot validation).

### Key Concepts

**Eras** are the visual and tonal themes of the popups, modeled after real periods of internet history.  
**Mechanisms** are the close interactions the player must perform to dismiss each popup.  
**Ad objects** are the individual popup instances, defined inside each era as an `examples[]` array entry with a `text` field and optional `trapButtons`, `safeButtons`, and `buttons` arrays.  
**Virus popups** are special red popups where clicking any button is an instant game-over; the close mechanism is the only escape.

---

## 🌐 Eras

Each era is a key in the `ERAS` object. To add a new era, add a new entry there.

| Key | Name | Period |
|---|---|---|
| `earlyWeb` | Early Web | 1990s |
| `myspaceAim` | MySpace/AIM | 2003–2010 |
| `aolDialup` | AOL/Dial-up | Late 1990s |
| `windows95` | 90s Windows | 1995–2005 |
| `windowsXP` | Windows XP | 2001–2009 |
| `flash` | Flash Era | 2000–2010 |
| `mobile` | Mobile Era | 2010s |
| `genZ` | Gen-Z | 2020s |
| `ai` | AI Era | Present |
| `retroArcade` | Retro Arcade | 1980s |
| `aiAgents` | AI Agents | Near Future |
| `apple` | Apple/Mac | All Time |

---

## 🎮 Close Mechanisms

Each mechanism is a key in the `CLOSE_MECHANISMS` object and maps to a `createXxxPopup()` function. To add a new mechanic, add a key to `CLOSE_MECHANISMS` and write the corresponding `create` function.

### Basic Mechanics
Simple close interactions that require minimal extra UI:

| Key | Description |
|---|---|
| `simpleX` | Red × button — just click it |
| `disabledX` | The `(x)` is hidden inside the ad text |
| `movingX` | × moves away when you hover |
| `fakeX` | Fake × in the corner; real one is hidden |
| `multipleX` | Multiple × buttons — click them all |
| `keyboardTab` | Tab then Enter to close |
| `puzzle` | Click a specific sequence to close |

### Interactive Mechanics
Require deliberate, multi-step interaction:

| Key | Description |
|---|---|
| `holdX` | Hold the × button for 1 second |
| `doubleClick` | Double-click the × |
| `typeX` | Press the `x` key on your keyboard |
| `declineBtn` | No ×; click the sassy "Decline" button |
| `endlessScroll` | Scroll to the bottom of a feed |
| `aiPicker` | Pick your favorite AI chatbot |

### Minigame Mechanics
Full mini-games that must be completed to close the popup:

| Key | Description |
|---|---|
| `angryBird` | Shoot the pig with a bird |
| `minesweeper` | Reveal all safe cells |
| `luigisMansion` | Flashlight find-the-object game |
| `marioKart` | Click-to-race mini-game |
| `riddleChoice` | Answer the riddle with the correct emoji |
| `youtubeAd` | Wait (or skip) a YouTube-style video ad |
| `adBlocker` | An ad blocker installs and wipes all current ads |
| `bouncingX` | × bounces around; click it |
| `spinX` | × spins; click during the brief green window |
| `rightClickX` | Right-click the × to close |
| `simonSays` | Watch a color sequence, then repeat it |
| `memoryMatch` | Flip cards to find all matching pairs |

---

## 🗺️ Code Sections

All JavaScript is in the `<script>` tag near the bottom of `index.html`. Each major section starts with a clearly marked comment block — search for `// ──` to jump between them:

- **`ERA & AD DATA`** — the `ERAS` object: one entry per era with styling and `examples[]`
- **`GAME CONSTANTS`** — `TRAP_BUTTONS`, `CLOSE_MECHANISMS`, `BUTTON_PAIRS`, `ERA_FAKE_BUTTONS`
- **`GAME STATE & CORE LOOP`** — runtime state, `startGame`, `restartGame`, random pickers
- **`BUTTON & POSITION HELPERS`** — factories for trap, fake, safe, and distraction buttons
- **`CLOSE MECHANICS — BASIC`** — `createSimpleXPopup` through `createPuzzlePopup`
- **`CLOSE MECHANICS — INTERACTIVE`** — `createHoldXPopup` through `createAiPickerPopup`
- **`MINIGAME MECHANICS`** — `createAngryBirdPopup` through `createMemoryMatchPopup`, plus per-era flavor theme tables
- **`AD SPAWNING & SCORING`** — `createAd` dispatcher, `adClosed`, `endGame`, spawn loop
- **`PREVIEW MODE`** — `?preview=eraKey:mechanism:adIndex` URL parameter handler

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
| `era` | Era key (see table above or `--list`). Default: `earlyWeb` |
| `mechanism` | Close-mechanism key. Default: `simpleX` |
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

# Gen-Z Strava endless-scroll feed
node preview.js genZ:endlessScroll

# AI era with the AI-picker close mechanism
node preview.js ai:aiPicker

# Save to a custom path
node preview.js earlyWeb:simpleX:credit screenshots/my-preview.png
```

Screenshots are saved to the `screenshots/` folder by default.
