// ===== GAME SYSTEM =====
class GameState {
    constructor() {
        this.health = 100;
        this.maxHealth = 100;
        this.kills = 0;
        this.currentWave = 1;
        this.ammo = 30;
        this.maxAmmo = 30;
        this.totalAmmo = 90;
        this.score = 0;
        this.accuracy = 0;
        this.shotsfired = 0;
        this.shotsFired = 0;
        this.shotsHit = 0;
        this.isGameOver = false;
        this.isPaused = false;
    }

    takeDamage(amount) {
        this.health = Math.max(0, this.health - amount);
    }

    addKill() {
        this.kills++;
        this.score += 100;
    }

    fireShot() {
        if (this.ammo > 0) {
            this.ammo--;
            this.shotsFired++;
            this.shotsHit++;
            return true;
        }
        return false;
    }

    hitEnemy() {
        this.shotsHit++;
    }

    reload() {
        if (this.totalAmmo > 0) {
            const needed = this.maxAmmo - this.ammo;
            const toReload = Math.min(needed, this.totalAmmo);
            this.ammo += toReload;
            this.totalAmmo -= toReload;
        }
    }

    updateAccuracy() {
        if (this.shotsFired > 0) {
            this.accuracy = Math.round((this.shotsHit / this.shotsFired) * 100);
        }
    }

    completeWave() {
        this.health = this.maxHealth; // Restore health on wave completion
        this.currentWave++;
        this.ammo = this.maxAmmo;
        this.totalAmmo = Math.min(90, this.totalAmmo + 30);
    }
}

// ===== HAND TRACKING SYSTEM =====
class HandTracker {
    constructor() {
        this.hands = null;
        this.camera = null;
        this.canvasElement = null;
        this.cameraStream = null;
        this.calibrationPoint = { x: 0.5, y: 0.5 };
        this.smoothedPosition = { x: 0.5, y: 0.5 };
        this.penDetected = false;
        this.lastGestureTime = 0;
        this.gestureDebounce = 300; // ms
        this.penVelocity = { x: 0, y: 0, z: 0 };
        this.lastPenPosition = { x: 0, y: 0, z: 0 };
    }

    async init() {
        try {
            // Create hidden canvas for hand detection
            this.canvasElement = document.createElement('canvas');
            this.canvasElement.style.display = 'none';
            this.canvasElement.width = 640;
            this.canvasElement.height = 480;
            document.body.appendChild(this.canvasElement);

            // Initialize MediaPipe Hands
            this.hands = new Hands({
                locateFile: (file) => {
                    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
                }
            });

            this.hands.setOptions({
                maxNumHands: 1,
                modelComplexity: 1,
                minDetectionConfidence: 0.5,
                minTrackingConfidence: 0.5
            });

            this.hands.onResults((results) => this.onHandsResults(results));

            // Get webcam
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 640, height: 480 }
            });

            this.cameraStream = stream;
            const video = document.createElement('video');
            video.srcObject = stream;
            video.play();
            video.style.display = 'none';
            document.body.appendChild(video);

            this.camera = new Camera(video, {
                onFrame: async () => {
                    await this.hands.send({ image: video });
                },
                width: 640,
                height: 480
            });

            this.camera.start();
            return true;
        } catch (error) {
            console.error('Hand tracking init error:', error);
            return false;
        }
    }

    onHandsResults(results) {
        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            this.penDetected = true;
            const landmarks = results.multiHandLandmarks[0];

            // Get pen tip position (index finger tip)
            const penTip = landmarks[8];
            const rawX = penTip.x;
            const rawY = penTip.y;
            const rawZ = penTip.z;

            // Smooth the position
            const smoothing = 0.7;
            this.smoothedPosition.x = this.smoothedPosition.x * smoothing + rawX * (1 - smoothing);
            this.smoothedPosition.y = this.smoothedPosition.y * smoothing + rawY * (1 - smoothing);

            // Calculate velocity for gesture detection
            this.penVelocity.x = rawX - this.lastPenPosition.x;
            this.penVelocity.y = rawY - this.lastPenPosition.y;
            this.penVelocity.z = rawZ - this.lastPenPosition.z;

            this.lastPenPosition = { x: rawX, y: rawY, z: rawZ };
        } else {
            this.penDetected = false;
        }
    }

    calibrate() {
        this.calibrationPoint = {
            x: this.smoothedPosition.x,
            y: this.smoothedPosition.y
        };
    }

    getNormalizedAim() {
        if (!this.penDetected) {
            return { x: 0.5, y: 0.5 };
        }

        // Normalize position relative to calibration point
        const x = (this.smoothedPosition.x - this.calibrationPoint.x) * 2 + 0.5;
        const y = (this.smoothedPosition.y - this.calibrationPoint.y) * 2 + 0.5;

        // Clamp to screen
        return {
            x: Math.max(0, Math.min(1, x)),
            y: Math.max(0, Math.min(1, y))
        };
    }

    detectShootingGesture() {
        if (!this.penDetected) return false;

        const now = Date.now();
        if (now - this.lastGestureTime < this.gestureDebounce) {
            return false;
        }

        // Shooting gesture: quick forward thrust (positive Z velocity toward camera)
        const shootThreshold = 0.15;
        if (this.penVelocity.z > shootThreshold) {
            this.lastGestureTime = now;
            return true;
        }

        return false;
    }

    stop() {
        if (this.camera) {
            this.camera.stop();
        }
        if (this.cameraStream) {
            this.cameraStream.getTracks().forEach(track => track.stop());
        }
    }
}

// ===== ENEMY CLASS =====
class Enemy {
    constructor(position, scene) {
        this.health = 50;
        this.maxHealth = 50;
        this.position = position.clone();
        this.speed = 0.05 + Math.random() * 0.03;
        this.attackRange = 10;
        this.detectionRange = 30;
        this.state = 'patrol'; // patrol, chase, attack
        this.patrolTarget = this.generatePatrolPoint();
        this.lastAttackTime = 0;
        this.attackCooldown = 1500; // ms
        this.takingDamage = false;
        this.damageFlashTime = 0;

        // Create 3D model
        const geometry = new THREE.BoxGeometry(1, 2, 1);
        const material = new THREE.MeshPhongMaterial({ color: 0x8B0000 });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(position);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        scene.add(this.mesh);

        // Add "head"
        const headGeometry = new THREE.SphereGeometry(0.5, 8, 8);
        const headMaterial = new THREE.MeshPhongMaterial({ color: 0xAA3333 });
        this.head = new THREE.Mesh(headGeometry, headMaterial);
        this.head.position.y = 1.2;
        this.head.castShadow = true;
        this.mesh.add(this.head);

        // Health bar background
        const healthBarBg = new THREE.Mesh(
            new THREE.BoxGeometry(2, 0.2, 0.1),
            new THREE.MeshBasicMaterial({ color: 0x333333 })
        );
        healthBarBg.position.y = 2.5;
        this.mesh.add(healthBarBg);

        // Health bar fill
        this.healthBar = new THREE.Mesh(
            new THREE.BoxGeometry(2, 0.2, 0.1),
            new THREE.MeshBasicMaterial({ color: 0x00FF00 })
        );
        this.healthBar.position.y = 2.5;
        this.healthBar.position.z = 0.05;
        this.mesh.add(this.healthBar);
    }

    generatePatrolPoint() {
        const angle = Math.random() * Math.PI * 2;
        const distance = 15 + Math.random() * 10;
        return new THREE.Vector3(
            Math.cos(angle) * distance,
            0,
            Math.sin(angle) * distance
        );
    }

    update(playerPosition, deltaTime) {
        const distanceToPlayer = this.position.distanceTo(playerPosition);

        // State management
        if (distanceToPlayer < this.detectionRange) {
            this.state = 'chase';
        } else if (distanceToPlayer > this.detectionRange * 1.5) {
            this.state = 'patrol';
        }

        // Movement
        let direction = new THREE.Vector3();

        if (this.state === 'patrol') {
            direction = this.patrolTarget.clone().sub(this.position);

            // Reached patrol point
            if (direction.length() < 1) {
                this.patrolTarget = this.generatePatrolPoint();
                direction = this.patrolTarget.clone().sub(this.position);
            }
        } else if (this.state === 'chase') {
            direction = playerPosition.clone().sub(this.position);

            // Enter attack state if close enough
            if (distanceToPlayer < this.attackRange) {
                this.state = 'attack';
            }
        }

        // Move
        if (direction.length() > 0) {
            direction.normalize();
            this.position.add(direction.multiplyScalar(this.speed * deltaTime));
            this.mesh.position.copy(this.position);
        }

        // Face player when chasing
        if (this.state === 'chase' || this.state === 'attack') {
            const lookTarget = playerPosition.clone();
            lookTarget.y = this.position.y;
            this.mesh.lookAt(lookTarget);
        }

        // Attack
        if (this.state === 'attack') {
            const now = Date.now();
            if (now - this.lastAttackTime > this.attackCooldown) {
                this.lastAttackTime = now;
                return true; // Signal attack to player
            }
        }

        // Update health bar
        const healthPercent = Math.max(0, this.health / this.maxHealth);
        this.healthBar.scale.x = healthPercent;

        // Damage flash
        if (this.takingDamage) {
            this.damageFlashTime -= deltaTime;
            if (this.damageFlashTime <= 0) {
                this.takingDamage = false;
                this.mesh.material.color.setHex(0x8B0000);
                this.head.material.color.setHex(0xAA3333);
            } else {
                this.mesh.material.color.setHex(0xFF6666);
                this.head.material.color.setHex(0xFF8888);
            }
        }

        return false;
    }

    takeDamage(amount) {
        this.health -= amount;
        this.takingDamage = true;
        this.damageFlashTime = 100;
    }

    isDead() {
        return this.health <= 0;
    }

    remove(scene) {
        scene.remove(this.mesh);
    }
}

// ===== MAIN GAME CLASS =====
class TacticalStrikeGame {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.gameState = new GameState();
        this.handTracker = new HandTracker();
        this.enemies = [];
        this.clock = new THREE.Clock();
        this.playerPosition = new THREE.Vector3(0, 1.5, 0);
        this.lastShotTime = 0;
        this.shotCooldown = 100; // ms between shots
        this.currentScreen = 'menu'; // menu, calibration, gameplay, gameOver, instructions
        this.waveEnemyCount = [3, 5, 7, 10];
        this.uiUpdateNeeded = true;
    }

    async init() {
        // Setup Three.js
        this.setupGraphics();

        // Setup scene
        this.createScene();

        // Setup hand tracking
        const trackingSuccess = await this.handTracker.init();
        if (!trackingSuccess) {
            console.warn('Hand tracking failed, using mouse fallback');
            this.setupMouseFallback();
        }

        // Setup UI
        this.setupUI();

        // Start render loop
        this.render();
    }

    setupGraphics() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x1a1a2e);
        this.scene.fog = new THREE.Fog(0x1a1a2e, 100, 150);

        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 1.5, 0);

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFShadowShadowMap;
        document.body.appendChild(this.renderer.domElement);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(30, 40, 20);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.left = -50;
        directionalLight.shadow.camera.right = 50;
        directionalLight.shadow.camera.top = 50;
        directionalLight.shadow.camera.bottom = -50;
        this.scene.add(directionalLight);

        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
    }

    createScene() {
        // Ground
        const groundGeometry = new THREE.PlaneGeometry(100, 100);
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: 0x444444,
            roughness: 0.8,
            metalness: 0.2
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);

        // Walls - Create a tactical arena
        this.createWalls();

        // Crates for cover
        this.createCover();
    }

    createWalls() {
        const wallMaterial = new THREE.MeshPhongMaterial({ color: 0x555555 });

        const walls = [
            { pos: [0, 2, -40], size: [100, 4, 2] }, // Back wall
            { pos: [0, 2, 40], size: [100, 4, 2] },  // Front wall
            { pos: [-40, 2, 0], size: [2, 4, 80] },  // Left wall
            { pos: [40, 2, 0], size: [2, 4, 80] }    // Right wall
        ];

        walls.forEach(wall => {
            const geometry = new THREE.BoxGeometry(...wall.size);
            const mesh = new THREE.Mesh(geometry, wallMaterial);
            mesh.position.set(...wall.pos);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            this.scene.add(mesh);
        });
    }

    createCover() {
        const crateMaterial = new THREE.MeshPhongMaterial({ color: 0x8B7355 });

        const coverPositions = [
            [-20, 0, 10],
            [20, 0, 10],
            [-15, 0, -15],
            [15, 0, -15],
            [0, 0, -25],
            [0, 0, 25]
        ];

        coverPositions.forEach(pos => {
            const geometry = new THREE.BoxGeometry(3, 3, 3);
            const mesh = new THREE.Mesh(geometry, crateMaterial);
            mesh.position.set(...pos);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            this.scene.add(mesh);
        });
    }

    setupUI() {
        document.getElementById('startGameBtn').addEventListener('click', () => this.startGame());
        document.getElementById('calibrateBtn').addEventListener('click', () => this.calibrationMode());
        document.getElementById('howToPlayBtn').addEventListener('click', () => this.showInstructions());
        document.getElementById('backBtn').addEventListener('click', () => this.backToMenu());
        document.getElementById('restartBtn').addEventListener('click', () => this.restartGame());
    }

    setupMouseFallback() {
        // Simple mouse-based aiming fallback
        document.addEventListener('mousemove', (e) => {
            this.mouseAim = {
                x: e.clientX / window.innerWidth,
                y: e.clientY / window.innerHeight
            };
        });

        document.addEventListener('click', () => {
            if (this.currentScreen === 'gameplay') {
                this.shoot();
            }
        });
    }

    startGame() {
        audioSystem.playClickSound();
        this.currentScreen = 'calibration';
        this.showCalibrationScreen();
    }

    calibrationMode() {
        audioSystem.playClickSound();
        this.currentScreen = 'calibration';
        this.showCalibrationScreen();
    }

    showCalibrationScreen() {
        document.getElementById('mainMenu').classList.add('hidden');
        document.getElementById('calibrationScreen').classList.add('active');

        let calibrationTime = 0;
        const calibrationDuration = 3000; // 3 seconds

        const calibrationInterval = setInterval(() => {
            if (this.currentScreen !== 'calibration' || calibrationTime >= calibrationDuration) {
                clearInterval(calibrationInterval);
                if (this.currentScreen === 'calibration') {
                    this.handTracker.calibrate();
                    document.getElementById('calibrationScreen').classList.remove('active');
                    this.startCountdown();
                }
                return;
            }
            calibrationTime += 16;
        }, 16);
    }

    startCountdown() {
        this.currentScreen = 'countdown';
        document.getElementById('countdownOverlay').classList.add('active');

        let count = 3;
        const countInterval = setInterval(() => {
            if (count <= 0) {
                clearInterval(countInterval);
                document.getElementById('countdownOverlay').classList.remove('active');
                this.startGameplay();
                return;
            }

            const countdownDiv = document.getElementById('countdownOverlay');
            countdownDiv.innerHTML = `<div class="countdown-number">${count}</div>`;
            audioSystem.playClickSound();
            count--;
        }, 1000);
    }

    startGameplay() {
        this.currentScreen = 'gameplay';
        this.gameState = new GameState();
        this.enemies = [];
        this.clock.start();
        this.spawnWave();
        audioSystem.playRoundStartSound();
    }

    spawnWave() {
        const enemyCount = this.waveEnemyCount[Math.min(this.gameState.currentWave - 1, this.waveEnemyCount.length - 1)];

        for (let i = 0; i < enemyCount; i++) {
            const angle = (i / enemyCount) * Math.PI * 2;
            const distance = 20 + Math.random() * 15;
            const position = new THREE.Vector3(
                Math.cos(angle) * distance,
                0,
                Math.sin(angle) * distance
            );

            const enemy = new Enemy(position, this.scene);
            this.enemies.push(enemy);
        }
    }

    update(deltaTime) {
        if (this.currentScreen !== 'gameplay') return;

        // Update enemies
        this.enemies.forEach(enemy => {
            const attacked = enemy.update(this.playerPosition, deltaTime);
            if (attacked) {
                this.gameState.takeDamage(10);
                audioSystem.playDamageSound();
                this.uiUpdateNeeded = true;

                if (this.gameState.health <= 0) {
                    this.endGame();
                } else if (this.gameState.health <= 25) {
                    audioSystem.playLowHealthWarning();
                }
            }
        });

        // Remove dead enemies
        this.enemies = this.enemies.filter(enemy => {
            if (enemy.isDead()) {
                enemy.remove(this.scene);
                this.gameState.addKill();
                audioSystem.playKillSound();
                this.showNotification('ENEMY ELIMINATED +1');
                this.uiUpdateNeeded = true;
                return false;
            }
            return true;
        });

        // Wave complete
        if (this.enemies.length === 0 && this.gameState.currentWave > 0) {
            this.completeWave();
        }

        // Check for shooting gesture
        if (this.handTracker.detectShootingGesture() || this.mouseAim) {
            this.shoot();
        }

        // Update UI
        if (this.uiUpdateNeeded) {
            this.updateHUD();
            this.uiUpdateNeeded = false;
        }
    }

    shoot() {
        const now = Date.now();
        if (now - this.lastShotTime < this.shotCooldown) return;

        if (!this.gameState.fireShot()) {
            // Out of ammo
            audioSystem.playReloadSound();
            this.gameState.reload();
            if (this.gameState.ammo === 0) return;
        }

        this.lastShotTime = now;

        // Sound and effects
        audioSystem.playGunshot();
        this.showMuzzleFlash();
        this.screenShake(0.05);

        // Get aim position
        const aim = this.handTracker.penDetected
            ? this.handTracker.getNormalizedAim()
            : this.mouseAim || { x: 0.5, y: 0.5 };

        // Raycast from camera to check hits
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2(aim.x * 2 - 1, -(aim.y * 2 - 1));
        raycaster.setFromCamera(mouse, this.camera);

        let hit = false;
        this.enemies.forEach(enemy => {
            const distance = raycaster.ray.distanceToPoint(enemy.position);
            if (distance < 1.5) { // Hit radius
                enemy.takeDamage(25);
                hit = true;
                audioSystem.playImpact();
                audioSystem.playHitMarker();
                this.showHitMarker();
                this.uiUpdateNeeded = true;
            }
        });

        this.uiUpdateNeeded = true;
    }

    showMuzzleFlash() {
        const flash = document.getElementById('muzzleFlash');
        flash.style.width = (40 + Math.random() * 20) + 'px';
        flash.style.height = (40 + Math.random() * 20) + 'px';
        flash.style.background = `radial-gradient(circle, rgba(255,200,0,0.8), rgba(255,100,0,0))`;
        flash.classList.add('active');

        setTimeout(() => {
            flash.classList.remove('active');
        }, 100);
    }

    showHitMarker() {
        const marker = document.getElementById('hitMarker');
        marker.classList.add('active');

        setTimeout(() => {
            marker.classList.remove('active');
        }, 300);
    }

    showNotification(text) {
        const hud = document.querySelector('.hud');
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = text;
        hud.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 500);
    }

    screenShake(intensity) {
        const originalX = this.camera.position.x;
        const originalY = this.camera.position.y;
        const originalZ = this.camera.position.z;

        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                this.camera.position.x = originalX + (Math.random() - 0.5) * intensity;
                this.camera.position.y = originalY + (Math.random() - 0.5) * intensity;
                this.camera.position.z = originalZ + (Math.random() - 0.5) * intensity;
            }, i * 16);
        }

        setTimeout(() => {
            this.camera.position.set(originalX, originalY, originalZ);
        }, 48);
    }

    completeWave() {
        this.gameState.completeWave();
        this.showNotification(`WAVE ${this.gameState.currentWave - 1} COMPLETE`);
        this.uiUpdateNeeded = true;

        setTimeout(() => {
            this.spawnWave();
            this.showNotification(`WAVE ${this.gameState.currentWave} START`);
        }, 2000);
    }

    endGame() {
        this.currentScreen = 'gameOver';
        this.gameState.updateAccuracy();

        document.getElementById('finalKills').textContent = this.gameState.kills;
        document.getElementById('finalWaves').textContent = this.gameState.currentWave - 1;
        document.getElementById('finalAccuracy').textContent = this.gameState.accuracy;

        document.getElementById('gameOverScreen').classList.add('active');
    }

    restartGame() {
        audioSystem.playClickSound();
        document.getElementById('gameOverScreen').classList.remove('active');
        this.startGame();
    }

    showInstructions() {
        audioSystem.playClickSound();
        document.getElementById('mainMenu').classList.add('hidden');
        document.getElementById('instructionsScreen').classList.add('active');
    }

    backToMenu() {
        audioSystem.playClickSound();
        document.getElementById('instructionsScreen').classList.remove('active');
        document.getElementById('mainMenu').classList.remove('hidden');
    }

    updateHUD() {
        document.getElementById('healthDisplay').textContent = Math.max(0, this.gameState.health);
        document.getElementById('killsDisplay').textContent = String(this.gameState.kills).padStart(2, '0');
        document.getElementById('waveDisplay').textContent = this.gameState.currentWave;
        document.getElementById('ammoDisplay').textContent = this.gameState.ammo;
        document.getElementById('ammoMaxDisplay').textContent = this.gameState.totalAmmo;

        // Update camera status
        if (this.handTracker.penDetected) {
            document.getElementById('penStatus').textContent = '✓ PEN DETECTED';
            document.getElementById('penStatus').style.color = '#0f0';
        } else {
            document.getElementById('penStatus').textContent = 'PEN NOT DETECTED';
            document.getElementById('penStatus').style.color = '#f00';
        }
    }

    onWindowResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    render() {
        requestAnimationFrame(() => this.render());

        const deltaTime = this.clock.getDelta();
        this.update(deltaTime);

        this.renderer.render(this.scene, this.camera);
    }
}

// ===== INITIALIZATION =====
let game;

window.addEventListener('load', async () => {
    game = new TacticalStrikeGame();
    await game.init();
});

// Fallback mouse aiming
let mouseAim = null;
