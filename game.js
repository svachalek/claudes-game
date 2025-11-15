class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        // We'll create simple graphics programmatically
    }

    create() {
        // Game state
        this.score = 0;
        this.coinsCollected = 0;
        this.highestPlatform = 600;
        this.gameOver = false;
        this.jumpCount = 0;
        this.flameEmitter = null;

        // Create sky background
        this.sky = this.add.rectangle(400, 300, 800, 600, 0x87ceeb);
        this.sky.setScrollFactor(0);

        // Define sky colors
        this.skyColorStart = Phaser.Display.Color.ValueToColor(0x87ceeb);
        this.skyColorEnd = Phaser.Display.Color.ValueToColor(0x1a1a2e);

        // Platform group
        this.platforms = this.physics.add.staticGroup();

        // Coin group
        this.coins = this.physics.add.group({
            allowGravity: false
        });

        // Spikes group
        this.spikes = this.physics.add.group({
            allowGravity: false
        });

        // Create flame texture
        if (!this.textures.exists('flame')) {
            const graphics = this.add.graphics();
            
            // Create blocky flame shape with multiple colors
            // Base orange
            graphics.fillStyle(0xff6600, 1);
            graphics.fillRect(4, 8, 8, 8);
            
            // Middle yellow
            graphics.fillStyle(0xffaa00, 1);
            graphics.fillRect(5, 10, 6, 4);
            graphics.fillRect(6, 8, 4, 2);
            
            // Tip white/yellow
            graphics.fillStyle(0xffff44, 1)
            graphics.fillRect(6, 6, 4, 2);
            graphics.fillRect(7, 4, 2, 2);
            
            graphics.generateTexture('flame', 16, 16);
            graphics.destroy();
        }

        // Create initial platforms
        this.createInitialPlatforms();

        // Create player
        this.createPlayer();

        // Physics collision
        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.overlap(this.player, this.coins, this.collectCoin, null, this);
        this.physics.add.collider(this.player, this.spikes, this.hitSpike, null, this);

        // Camera setup
        this.cameras.main.setBounds(0, -10000, 800, 10600);
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setDeadzone(800, 200);

        // Controls
        this.cursors = this.input.keyboard.createCursorKeys();

        // Score text
        this.scoreText = this.add.text(16, 16, 'Height: 0', {
            fontSize: '24px',
            fill: '#fff',
            stroke: '#000',
            strokeThickness: 4
        });
        this.scoreText.setScrollFactor(0);

        // Coin text
        this.coinText = this.add.text(16, 50, 'Coins: 0', {
            fontSize: '24px',
            fill: '#fff',
            stroke: '#000',
            strokeThickness: 4
        });
        this.coinText.setScrollFactor(0);

        // Instructions
        this.instructionsText = this.add.text(400, 550, 'Arrow Keys to Move • Space to Jump', {
            fontSize: '16px',
            fill: '#fff',
            stroke: '#000',
            strokeThickness: 3
        });
        this.instructionsText.setOrigin(0.5);
        this.instructionsText.setScrollFactor(0);

        // Game over text (hidden initially)
        this.gameOverText = this.add.text(400, 300, 'GAME OVER!\nPress R to Restart', {
            fontSize: '48px',
            fill: '#ff0000',
            stroke: '#000',
            strokeThickness: 6,
            align: 'center'
        });
        this.gameOverText.setOrigin(0.5);
        this.gameOverText.setScrollFactor(0);
        this.gameOverText.setVisible(false);

        // Restart key
        this.restartKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    }

    createPlayer() {
        // Create player as a blocky astronaut
        const graphics = this.add.graphics();

        // Body (white suit)
        graphics.fillStyle(0xe0e0e0, 1);
        graphics.fillRect(8, 10, 16, 18);

        // Helmet (white)
        graphics.fillStyle(0xffffff, 1);
        graphics.fillRect(10, 2, 12, 10);

        // Visor (dark grey)
        graphics.fillStyle(0x404040, 1);
        graphics.fillRect(12, 4, 8, 6);
        
        // Backpack
        graphics.fillStyle(0xb0b0b0, 1);
        graphics.fillRect(6, 12, 2, 12);

        // Arms
        graphics.fillStyle(0xe0e0e0, 1);
        graphics.fillRect(4, 14, 4, 4); // Left arm
        graphics.fillRect(24, 14, 4, 4); // Right arm

        // Legs
        graphics.fillStyle(0xe0e0e0, 1);
        graphics.fillRect(10, 28, 4, 4); // Left leg
        graphics.fillRect(18, 28, 4, 4); // Right leg

        graphics.generateTexture('player', 32, 32);
        graphics.destroy();

        // Create player sprite
        this.player = this.physics.add.sprite(400, 468, 'player');
        this.player.setBounce(0);
        this.player.setCollideWorldBounds(false);
        this.player.setGravityY(800);

        // Player physics body
        this.player.body.setSize(28, 32);
        this.player.body.setDragX(400);
        this.player.body.setMaxVelocityX(200);

        // Create flame particles
        this.flameEmitter = this.add.particles(0, 0, 'flame', {
            speed: { min: 50, max: 100 },
            angle: { min: 80, max: 100 },
            scale: { start: 1.5, end: 0 },
            blendMode: 'ADD',
            lifespan: 600,
            emitting: false
        });
    }

    createInitialPlatforms() {
        // Ground platform
        const ground = this.createPlatform(400, 600, 800, 20, 0x008000);

        // Starting platforms
        let p1 = this.createPlatform(300, 500, 200, 20, 0x8B4513);
        this.createCoin(p1.x + p1.width / 2, p1.y - 20);
        let p2 = this.createPlatform(600, 400, 150, 20, 0x8B4513);
        this.createCoin(p2.x + p2.width / 2, p2.y - 20);
        this.createPlatform(250, 300, 180, 20, 0x8B4513);
        let p3 = this.createPlatform(550, 200, 160, 20, 0x8B4513);
        this.createCoin(p3.x + p3.width / 2, p3.y - 20);
        this.createPlatform(350, 100, 140, 20, 0x8B4513);
        let p4 = this.createPlatform(600, 0, 150, 20, 0x8B4513);
        this.createCoin(p4.x + p4.width / 2, p4.y - 20);

        // Generate platforms going up
        this.generatePlatformsUp();
    }

    createPlatform(x, y, width, height, color) {
        const graphics = this.add.graphics();
        graphics.fillStyle(color, 1);
        graphics.fillRect(0, 0, width, height);

        // Add some detail
        graphics.lineStyle(2, 0x000000, 0.3);
        for (let i = 0; i < width; i += 20) {
            graphics.lineBetween(i, 0, i, height);
        }

        const key = 'platform_' + Math.random();
        graphics.generateTexture(key, width, height);
        graphics.destroy();

        const platform = this.platforms.create(x, y, key);
        platform.setOrigin(0, 0);
        platform.refreshBody();

        return platform;
    }

    generatePlatformsUp() {
        // Generate platforms going up to -10000
        let currentY = -100;

        while (currentY > -10000) {
            const x = Phaser.Math.Between(100, 650);
            const width = Phaser.Math.Between(120, 200);

            const platform = this.createPlatform(x, currentY, width, 20, 0x8B4513);

            // Add a coin or a spike on some platforms
            const chance = Phaser.Math.Between(1, 5);
            if (chance === 1) { // 1 in 5 chance for a coin
                this.createCoin(platform.x + platform.width / 2, platform.y - 20);
            } else if (chance === 2) { // 1 in 5 chance for a spike
                this.createSpike(platform.x + platform.width / 2, platform.y - 10);
            }

            // Spacing between platforms
            currentY -= Phaser.Math.Between(80, 140);
        }
    }

    createCoin(x, y) {
        // Create a simple yellow circle for the coin
        if (!this.textures.exists('coin')) {
            const graphics = this.add.graphics();
            graphics.fillStyle(0xffff00, 1);
            graphics.fillCircle(8, 8, 8);
            graphics.generateTexture('coin', 16, 16);
            graphics.destroy();
        }

        const coin = this.coins.create(x, y, 'coin');
        coin.body.setCircle(8);
    }

    collectCoin(player, coin) {
        coin.disableBody(true, true);
        this.coinsCollected++;
        this.coinText.setText('Coins: ' + this.coinsCollected);
    }

    createSpike(x, y) {
        // Create a simple grey triangle for the spike
        if (!this.textures.exists('spike')) {
            const graphics = this.add.graphics();
            graphics.fillStyle(0x808080, 1); // Grey color
            graphics.beginPath();
            graphics.moveTo(0, 20);
            graphics.lineTo(10, 0);
            graphics.lineTo(20, 20);
            graphics.closePath();
            graphics.fillPath();
            graphics.generateTexture('spike', 20, 20);
            graphics.destroy();
        }

        const spike = this.spikes.create(x, y, 'spike');
        spike.setImmovable(true);
        spike.body.setSize(16, 16).setOffset(2, 2);
    }

    hitSpike(player, spike) {
        this.triggerGameOver();
    }

    update() {
        if (this.gameOver) {
            if (Phaser.Input.Keyboard.JustDown(this.restartKey)) {
                this.scene.restart();
            }
            return;
        }

        // Player controls - Mario-style
        const acceleration = 1000;
        if (this.cursors.left.isDown) {
            this.player.setAccelerationX(-acceleration);
            this.player.setFlipX(true);
        } else if (this.cursors.right.isDown) {
            this.player.setAccelerationX(acceleration);
            this.player.setFlipX(false);
        } else {
            this.player.setAccelerationX(0);
        }

        // Reset jump counter if on the ground
        if (this.player.body.touching.down) {
            this.jumpCount = 0;
        }

        // Jump
        const isJumpKeyDown = Phaser.Input.Keyboard.JustDown(this.cursors.up) || Phaser.Input.Keyboard.JustDown(this.cursors.space);

        if (isJumpKeyDown) {
            if (this.player.body.touching.down) {
                // First jump
                this.player.setVelocityY(-400);
                this.jumpCount = 1;
                this.flameEmitter.emitParticleAt(this.player.x, this.player.y + 16, 16);
            } else if (this.jumpCount < 2) {
                // Second jump
                this.player.setVelocityY(-400);
                this.jumpCount++;
                this.flameEmitter.emitParticleAt(this.player.x, this.player.y + 16, 16);
            }
        }

        // Update score based on height reached
        const height = Math.max(0, Math.floor((600 - this.player.y) / 10));
        this.score = Math.max(this.score, height);
        this.scoreText.setText('Height: ' + this.score);

        // Update sky color based on height
        const transitionStartHeight = 600;
        const transitionEndHeight = -5000;
        const transitionProgress = Phaser.Math.Clamp((transitionStartHeight - this.player.y) / (transitionStartHeight - transitionEndHeight), 0, 1);
        const interpolatedColor = Phaser.Display.Color.Interpolate.ColorWithColor(this.skyColorStart, this.skyColorEnd, 100, transitionProgress * 100);
        this.sky.fillColor = Phaser.Display.Color.GetColor(interpolatedColor.r, interpolatedColor.g, interpolatedColor.b);

        // Check if player fell off the bottom
        if (this.player.y > 700) {
            this.triggerGameOver();
        }

        // Allow wrapping around screen edges
        if (this.player.x < 0) {
            this.player.x = 800;
        } else if (this.player.x > 800) {
            this.player.x = 0;
        }
    }

    triggerGameOver() {
        this.gameOver = true;
        this.gameOverText.setVisible(true);
        this.physics.pause();
    }
}

// Game configuration
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [GameScene]
};

const game = new Phaser.Game(config);
