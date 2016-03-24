/// <reference path="phaser/phaser.d.ts"/>
/// <reference path="joypad/GamePad.ts"/>

class mainState extends Phaser.State {
    private player:Phaser.Sprite;
    private cursors:Phaser.CursorKeys;

    private PLAYER_ACCELERATION = 500;
    private PLAYER_MAX_SPEED = 300; // pixels/second
    private PLAYER_DRAG = 600;

    preload():void {
        super.preload();

        this.load.image('bg', 'assets/bg.png');
        this.load.image('player', 'assets/player.png');
        this.load.image('bullet', 'assets/bullet.png');

        this.physics.startSystem(Phaser.Physics.ARCADE);

        this.cursors = this.input.keyboard.createCursorKeys();

        if (!this.game.device.desktop) {
            this.load.image('joystick_base', 'assets/transparentDark05.png');
            this.load.image('joystick_segment', 'assets/transparentDark09.png');
            this.load.image('joystick_knob', 'assets/transparentDark49.png');
        }
    }

    create():void {
        super.create();

        this.createWorld();
        this.createTiledBackground();
        this.createPlayer();
        this.setupCamera();
        this.createVirtualJoystick();
    }

    private createVirtualJoystick() {
        if (!this.game.device.desktop) {
            var g = new Gamepads.GamePad(this.game, Gamepads.GamepadType.DOUBLE_STICK);
        }
    };

    private setupCamera() {
        this.camera.follow(this.player);
    };

    private createPlayer() {
        this.player = this.add.sprite(this.world.centerX, this.world.centerY, 'player');
        this.player.anchor.setTo(0.5, 0.5);
        this.physics.enable(this.player, Phaser.Physics.ARCADE);

        this.player.body.maxVelocity.setTo(this.PLAYER_MAX_SPEED, this.PLAYER_MAX_SPEED); // x, y
        this.player.body.collideWorldBounds = true;
        this.player.body.drag.setTo(this.PLAYER_DRAG, this.PLAYER_DRAG); // x, y
    };

    private createTiledBackground() {
        this.add.tileSprite(0, 0, this.world.width, this.world.height, 'bg');
    };

    private createWorld() {
        this.world.setBounds(0, 0, 2000, 2000);
    };

    update():void {
        super.update();
        this.movePlayer();
        this.rotatePlayerToPointer();
        this.fireWhenButtonClicked();
    }

    private fireWhenButtonClicked() {
        if (this.input.activePointer.isDown) {
            this.fire();
        }
    };

    private rotatePlayerToPointer() {
        this.player.rotation = this.physics.arcade.angleToPointer(
            this.player,
            this.input.activePointer
        );
    };

    private movePlayer() {
        if (this.cursors.left.isDown) {
            this.player.body.acceleration.x = -this.PLAYER_ACCELERATION;
        } else if (this.cursors.right.isDown) {
            this.player.body.acceleration.x = this.PLAYER_ACCELERATION;
        } else if (this.cursors.up.isDown) {
            this.player.body.acceleration.y = -this.PLAYER_ACCELERATION;
        } else if (this.cursors.down.isDown) {
            this.player.body.acceleration.y = this.PLAYER_ACCELERATION;
        } else {
            this.player.body.acceleration.x = 0;
            this.player.body.acceleration.y = 0;
        }
    };

    fire():void {

    }
}

class ShooterGame extends Phaser.Game {
    constructor() {
        super(800, 480, Phaser.AUTO, 'gameDiv');
        this.state.add('main', mainState);
        this.state.start('main');
    }
}

window.onload = () => {
    var game = new ShooterGame();
};
