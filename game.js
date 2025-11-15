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
        this.highestPlatform = 600;
        this.gameOver = false;

        // Create sky background
        this.add.rectangle(400, 300, 800, 600, 0x87ceeb);

        // Platform group
        this.platforms = this.physics.add.staticGroup();

        // Create initial platforms
        this.createInitialPlatforms();

        // Create player
        this.createPlayer();

        // Physics collision
        this.physics.add.collider(this.player, this.platforms);

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
        // Create player as a simple rectangle (Mario-style)
        const graphics = this.add.graphics();

        // Red body
        graphics.fillStyle(0xff0000, 1);
        graphics.fillRect(0, 8, 32, 24);

        // Blue overalls
        graphics.fillStyle(0x0000ff, 1);
        graphics.fillRect(4, 16, 24, 16);

        // Skin tone for head
        graphics.fillStyle(0xffdbac, 1);
        graphics.fillCircle(16, 8, 8);

        // Cap
        graphics.fillStyle(0xff0000, 1);
        graphics.fillCircle(16, 6, 8);
        graphics.fillRect(8, 6, 16, 4);

        graphics.generateTexture('player', 32, 32);
        graphics.destroy();

        // Create player sprite
        this.player = this.physics.add.sprite(400, 500, 'player');
        this.player.setBounce(0);
        this.player.setCollideWorldBounds(false);
        this.player.setGravityY(800);

        // Player physics body
        this.player.body.setSize(28, 32);
    }

    createInitialPlatforms() {
        // Ground platform
        const ground = this.createPlatform(400, 600, 800, 20, 0x008000);

        // Starting platforms
        this.createPlatform(300, 500, 200, 20, 0x8B4513);
        this.createPlatform(600, 400, 150, 20, 0x8B4513);
        this.createPlatform(250, 300, 180, 20, 0x8B4513);
        this.createPlatform(550, 200, 160, 20, 0x8B4513);
        this.createPlatform(350, 100, 140, 20, 0x8B4513);
        this.createPlatform(600, 0, 150, 20, 0x8B4513);

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

            this.createPlatform(x, currentY, width, 20, 0x8B4513);

            // Spacing between platforms
            currentY -= Phaser.Math.Between(80, 140);
        }
    }

    update() {
        if (this.gameOver) {
            if (Phaser.Input.Keyboard.JustDown(this.restartKey)) {
                this.scene.restart();
            }
            return;
        }

        // Player controls - Mario-style
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-200);
            this.player.setFlipX(true);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(200);
            this.player.setFlipX(false);
        } else {
            this.player.setVelocityX(0);
        }

        // Jump - can only jump when touching a platform
        if ((this.cursors.up.isDown || this.cursors.space?.isDown || this.input.keyboard.addKey('SPACE').isDown) && this.player.body.touching.down) {
            this.player.setVelocityY(-500);
        }

        // Update score based on height reached
        const height = Math.max(0, Math.floor((600 - this.player.y) / 10));
        this.score = Math.max(this.score, height);
        this.scoreText.setText('Height: ' + this.score);

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
