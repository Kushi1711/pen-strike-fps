# TACTICAL STRIKE - Camera Controlled FPS

A fully playable first-person shooter controlled by your webcam and a pen. Point your pen at enemies and use a quick forward gesture to fire. This is a browser-based tactical FPS experience inspired by classic competitive shooters.

## 🎮 Live Demo

Open `index.html` in a modern web browser to play immediately.

**Requirements:**
- Chrome, Firefox, Edge, or Safari (latest versions)
- Webcam
- A pen or similar object to use as a weapon pointer
- Adequate lighting for hand detection

## 🎯 Core Features

### Pen-Based Aiming
- **Hand Detection**: Uses MediaPipe to detect your hand and pen in real-time
- **Position Tracking**: Smooth tracking of pen movement converts to crosshair aiming
- **Calibration**: 3-second calibration phase to establish your natural hand position
- **Fallback**: Mouse aiming if hand detection fails

### Shooting Mechanics
- **Gesture Detection**: Quick forward thrust of pen toward camera triggers firing
- **Debouncing**: 300ms cooldown prevents accidental repeated firing
- **Ammunition System**: 30 rounds per magazine, 90 total ammo
- **Auto-Reload**: Automatically reload when ammo runs out

### Sound Design
- **Gunshot**: Deep, punchy firearm sound with multiple frequency layers
- **Hit Marker**: Bright confirmation beep when bullet hits enemy
- **Kill Sound**: Satisfying ascending tone when enemy is eliminated
- **Damage Alert**: Low-frequency buzz when player takes damage
- **Low Health Warning**: Pulsing beep when health drops below 25%
- **Reload Sound**: Mechanical multi-click reload sequence
- **Round Start**: Dramatic ascending tone at game start
- **UI Clicks**: Subtle feedback for menu interactions

All sounds are synthesized using Web Audio API (no external audio files needed).

### Visual Effects
- **Muzzle Flash**: Quick radial gradient appears at center of screen
- **Screen Shake**: Subtle camera vibration on each shot
- **Hit Marker**: Red crosshair pulse on hit confirmation
- **Enemy Hit Flash**: Enemies briefly turn red when damaged
- **Health Bars**: 3D health bars above each enemy

### Enemy AI
- **Patrol Behavior**: Enemies wander patrol points when unaware
- **Detection**: Enemies detect player and enter chase state within 30 units
- **Attack**: Close-range melee attack with 1.5 second cooldown
- **Cover Awareness**: Enemies can navigate around environmental obstacles
- **Death Animation**: Enemies flash red briefly then disappear with kill sound

### Gameplay Loop
- **Wave System**: Increasingly difficult waves (3 → 5 → 7 → 10 enemies)
- **Health System**: 100 HP, regenerates fully between waves
- **Scoring**: 100 points per kill
- **Wave Progression**: Complete all enemies to progress
- **Difficulty Scaling**: More enemies and faster AI with each wave

### HUD & UI
- **Health Display**: Top-left corner shows current HP
- **Kill Counter**: Top-right shows total kills
- **Wave Indicator**: Current wave number
- **Ammo Counter**: Bottom-right shows rounds/total ammo
- **Center Crosshair**: Green reticle with dot
- **Hit Marker**: Red crosshair appears on successful hits
- **Notifications**: On-screen messages for kills and wave progression
- **Camera Status**: Bottom-left indicator showing tracking status

## 🚀 How to Launch

### Step 1: Open the Game
Simply open `index.html` in your browser:
```bash
# Navigate to the repository folder and open
open index.html  # macOS
start index.html # Windows
xdg-open index.html # Linux
```

Or use a local web server:
```bash
python -m http.server 8000
# Then visit http://localhost:8000
```

### Step 2: Grant Camera Permission
When the game starts, you'll see a browser prompt requesting webcam access.
- Click **"Allow"** to grant permission
- Make sure your camera has a clear view of your hand/pen
- Position yourself with adequate lighting

### Step 3: Choose Your Path
From the main menu, select:
- **[START GAME]** - Begin gameplay with automatic calibration
- **[CALIBRATE CAMERA]** - Recalibrate your hand position
- **[HOW TO PLAY]** - Review the complete guide

### Step 4: Calibration
When you see **"POINT YOUR PEN AT THE CENTER OF THE SCREEN"**:
1. Hold your pen (or pointer object) at the screen center
2. Keep it steady for 3 seconds
3. The game automatically captures your calibration point
4. This establishes your natural hand resting position

### Step 5: Countdown & Game Start
After calibration:
1. See the 3-second countdown: **3 → 2 → 1**
2. Hear the dramatic round-start sound
3. Enemies spawn around you
4. Begin combat

## 🎮 Gameplay Controls

### Aiming
**Physical Motion:**
- Move your pen in front of the camera to aim
- Movement maps to crosshair position
- Smooth tracking reduces jitter
- Aim velocity determines recoil recovery

### Shooting
**Shooting Gesture:**
- Make a **quick forward thrust** with your pen toward the camera
- Detect as approximately 0.15+ Z-axis velocity (toward camera)
- Automatic 100ms cooldown between shots
- 300ms gesture debounce prevents accidental repeats

**Mouse Fallback** (if hand tracking unavailable):
- Move mouse to aim
- Click to fire

### Ammunition Management
- Start each wave with 30 rounds
- 90 total ammo available
- Auto-reload when magazine empty
- Manual reload between waves

## 📊 HUD Guide

### Top-Left Corner
```
HEALTH 87
```
Shows your current health (0-100 HP). Regenerates to full after each wave completes.

### Top-Right Corner
```
KILLS 12
WAVE 2
```
- **KILLS**: Total enemies eliminated (max 99)
- **WAVE**: Current wave number (1, 2, 3, ...)

### Bottom-Right Corner
```
AMMO 18 / 42
```
- First number: Rounds in current magazine (0-30)
- Second number: Reserve ammunition (0-90)

### Center Screen
- **Green Crosshair**: Standard aiming reticle
- **Red Crosshair**: Appears on hit confirmation
- **Muzzle Flash**: Orange/yellow burst on each shot

### Bottom-Left Corner
```
● CAMERA ACTIVE
✓ PEN DETECTED
```
Status indicators:
- **● CAMERA ACTIVE**: Green dot = webcam running
- **✓ PEN DETECTED**: Green text = hand visible; Red text = hand out of view

## 🎯 Combat Strategy

### Effective Aiming
1. **Calibrate properly** - Your resting pen position should be centered
2. **Small movements** - The game smooths tracking; large motions work better
3. **Anticipatory aiming** - Enemies move between positions; lead your shots
4. **Stay centered** - Keep your hand in camera view to maintain aim accuracy

### Shooting Tips
1. **Decisive gestures** - Use clear, quick forward thrusts to shoot
2. **Avoid jitter** - Hold pen relatively still between shots
3. **Magazine discipline** - Track your ammo and reload proactively
4. **Cooldown timing** - 100ms between shots; wait for impact sounds

### Tactical Defense
1. **Use cover** - Move your aim around wooden crates in the arena
2. **Range advantage** - Enemies must be close to attack; stay mobile
3. **Health priority** - Health regenerates after wave; play cautiously
4. **Wave planning** - Difficulty increases; adapt aim speed each wave

## 🏗️ Technical Architecture

### File Structure
```
pen-strike-fps/
├── index.html          # Main HTML, menu UI, HUD elements
├── audio.js            # Web Audio API sound synthesis
├── game.js             # Game logic, rendering, AI
└── README.md           # This file
```

### Key Technologies
- **Three.js**: 3D scene rendering and camera management
- **MediaPipe Hands**: Real-time hand detection and landmark tracking
- **Web Audio API**: Procedurally generated sound effects
- **WebGL**: GPU-accelerated rendering

### Performance
- **Hand Tracking**: ~30 FPS processing (60 FPS rendering separate)
- **Enemy AI**: O(n) per frame (n = enemy count)
- **Rendering**: 60 FPS target on modern hardware
- **Memory**: ~50-80MB typical usage

### Browser Compatibility
| Browser | Support | Notes |
|---------|---------|-------|
| Chrome | ✓ Full | Best performance |
| Firefox | ✓ Full | Excellent support |
| Edge | ✓ Full | Same engine as Chrome |
| Safari | ✓ Full | iOS 14.5+ for webcam |
| Opera | ✓ Full | Chromium-based |

## 🔧 Troubleshooting

### Hand Tracking Not Working
**Problem**: "PEN NOT DETECTED" stays red
- **Solution 1**: Improve lighting (hand tracking needs clear visibility)
- **Solution 2**: Move closer to camera (within ~2 feet)
- **Solution 3**: Use a higher-contrast object (white pen on dark hand works better)
- **Solution 4**: Click "CALIBRATE CAMERA" to restart detection
- **Fallback**: Game automatically switches to mouse aiming

### Gesture Not Firing
**Problem**: Forward pen motion doesn't trigger shots
- **Solution 1**: Use faster, more deliberate thrust toward camera
- **Solution 2**: Verify at least 300ms since last shot (cooldown)
- **Solution 3**: Check that gesture velocity is sufficient (0.15+ Z-axis)
- **Solution 4**: Try clicking mouse as fallback

### Webcam Permission Denied
**Problem**: "Permission denied" error on startup
- **Solution 1**: Check browser permissions settings
- **Solution 2**: Reload page and retry
- **Solution 3**: Try incognito/private browsing mode
- **Solution 4**: Check OS-level camera privacy settings

### Aiming Feels Jittery
**Problem**: Crosshair moves erratically
- **Solution 1**: Ensure steady lighting on hand
- **Solution 2**: Move slowly with pen (smoothing is built-in)
- **Solution 3**: Re-calibrate to adjust baseline position
- **Solution 4**: Reduce camera movement (minimize hand shake)

### Low FPS / Performance Issues
**Problem**: Game stutters or lags
- **Solution 1**: Close other browser tabs (reduce CPU load)
- **Solution 2**: Lower browser graphics settings
- **Solution 3**: Reduce enemy count manually (edit waveEnemyCount in game.js)
- **Solution 4**: Try a different browser

### Audio Not Playing
**Problem**: No sound effects during gameplay
- **Solution 1**: Unmute browser tab
- **Solution 2**: Check system volume
- **Solution 3**: Try clicking on page to wake audio context
- **Solution 4**: Test Web Audio in browser console (audioSystem.playGunshot())

## 🎨 Customization

### Adjust Game Difficulty
Edit `game.js`, line ~520:
```javascript
this.waveEnemyCount = [3, 5, 7, 10]; // Change these numbers
```

### Change Enemy Behavior
In `Enemy` class (~line 120 in game.js):
```javascript
this.speed = 0.05 + Math.random() * 0.03;           // Movement speed
this.detectionRange = 30;                            // When to chase
this.attackRange = 10;                               // When to attack
this.attackCooldown = 1500;                          // Time between attacks (ms)
```

### Modify Weapon Balance
In `TacticalStrikeGame` class (~line 360):
```javascript
this.shotCooldown = 100;                             // Time between shots (ms)
this.gameState.maxAmmo = 30;                         // Rounds per magazine
this.gameState.totalAmmo = 90;                       // Total ammunition
```

In `Enemy.takeDamage()` call (~line 560):
```javascript
enemy.takeDamage(25);  // Damage per hit - change this number
```

### Adjust Gesture Detection
In `HandTracker.detectShootingGesture()` (~line 85):
```javascript
const shootThreshold = 0.15;  // Lower = more sensitive, Higher = less sensitive
```

## 🐛 Known Limitations

1. **Hand Occlusion**: If your other hand blocks the pen, tracking fails
2. **Lighting Dependency**: Low-light environments reduce detection accuracy
3. **Single Hand**: Only one hand is tracked (MediaPipe configured for 1 hand)
4. **No Reload Animation**: Reload is instant (could add visual feedback)
5. **Basic AI**: Enemies use simple pathfinding (no tactical formations)
6. **Static Map**: Single arena (could create multiple maps)
7. **No Multiplayer**: Single-player only
8. **No Persistence**: High scores not saved (could add local storage)

## 🚀 Future Enhancements

### Planned Features
- [ ] Multiple map environments (warehouse, compound, urban)
- [ ] Weapon selection and upgrades
- [ ] Boss enemies with special abilities
- [ ] Local high score leaderboard
- [ ] Sound volume/mute controls
- [ ] Difficulty settings (Easy/Normal/Hard)
- [ ] Tutorial/training mode
- [ ] Enemy variety (different models/weapons)
- [ ] Environmental destructibles
- [ ] Power-ups (health packs, ammo, slow-motion)

### Technical Improvements
- [ ] Worker thread for hand tracking (separate from render loop)
- [ ] Advanced pathfinding for enemy AI
- [ ] Particle effects system
- [ ] Better shadow quality
- [ ] Post-processing effects (bloom, chromatic aberration)
- [ ] Haptic feedback for mobile devices

## 📜 License

This project is open source and available for personal and educational use.

All code is original. No copyrighted Counter-Strike assets are included.

## 🎓 Learning Resources

This project demonstrates:
- **Computer Vision**: Hand detection and tracking with MediaPipe
- **3D Graphics**: Scene setup, lighting, and camera control with Three.js
- **Audio Synthesis**: Procedural sound generation with Web Audio API
- **Game Development**: State management, AI, collision detection, and game loops
- **Browser APIs**: Webcam access, gesture recognition, event handling

## 👨‍💻 Technical Details

### Hand Tracking Pipeline
1. Capture video frame from webcam (30 FPS)
2. Detect hand landmarks using MediaPipe (21 points per hand)
3. Extract index finger tip (landmark #8)
4. Smooth position using exponential moving average
5. Calculate velocity for gesture detection
6. Normalize aim relative to calibration point
7. Map to screen coordinates (0-1 range)

### Shooting Physics
1. Create raycaster from camera through crosshair
2. Check distance from ray to each enemy center
3. If distance < 1.5 units, register hit
4. Apply damage, play sounds, show visual feedback
5. Decrement ammo counter

### Enemy AI State Machine
```
PATROL ←→ CHASE ← ATTACK
  ↓        ↓        ↓
PATROL   CHASE   ATTACK
(unaware) (aware) (close)
```

### Audio Synthesis Approach
- **No external files**: All sounds generated at runtime
- **Oscillators**: Sine, square, triangle waves for tones
- **Noise**: White noise buffer for impact and gunshot crispness
- **Envelopes**: ADSR-style gain ramps
- **Layering**: Multiple oscillators per sound for richness

## 🎬 Gameplay Example

```
1. Click [START GAME]
2. Grant webcam permission
3. Point pen at screen center
4. Wait for 3-second calibration
5. 3 → 2 → 1 → SOUND → BEGIN!
6. Enemies spawn in circle around you
7. Move pen to aim at enemy
8. Quick forward thrust to fire
9. Hit! Red crosshair appears, beep sound
10. Enemy takes damage, flashes red
11. Hit multiple times → Enemy dies
12. Kill sound plays, +1 on counter
13. Continue until all enemies defeated
14. Wave complete! Health restored, more enemies spawn
15. Repeat with harder waves
16. Get hit 6+ times → Game Over
17. See final score and restart
```

## 📱 Mobile / Touch Considerations

This game works best on:
- Desktop/Laptop with external webcam
- Tablets with cameras (limited by gesture detection on touch)

Mobile phones are NOT recommended because:
- Internal cameras have limited viewing angle
- Hand gestures are harder to detect reliably
- Aiming precision is reduced

## 🎤 Audio Troubleshooting

If you want to adjust audio:
1. Open browser console (F12 → Console tab)
2. Test individual sounds:
   ```javascript
   audioSystem.playGunshot()
   audioSystem.playKillSound()
   audioSystem.playHitMarker()
   ```
3. Adjust gain in `audio.js`:
   ```javascript
   this.masterGain.gain.value = 0.7; // Range: 0.0 to 1.0
   ```

---

**Enjoy TACTICAL STRIKE! May your aim be true and your pen hand steady. 🎯**
