/// <reference path="phaser/phaser.d.ts"/>
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var mainState = (function (_super) {
    __extends(mainState, _super);
    function mainState() {
        _super.apply(this, arguments);
        this.PLAYER_ACCELERATION = 500;
        this.PLAYER_MAX_SPEED = 300; // pixels/second
        this.PLAYER_DRAG = 600;
    }
    mainState.prototype.preload = function () {
        _super.prototype.preload.call(this);
        this.load.image('bg', 'assets/bg.png');
        this.load.image('player', 'assets/player.png');
        this.physics.startSystem(Phaser.Physics.ARCADE);
        this.cursors = this.input.keyboard.createCursorKeys();
    };
    mainState.prototype.create = function () {
        _super.prototype.create.call(this);
        this.add.tileSprite(0, 0, this.world.width, this.world.height, 'bg');
        this.player = this.add.sprite(this.world.centerX, this.world.centerY, 'player');
        this.player.anchor.setTo(0.5, 0.5);
        this.physics.enable(this.player, Phaser.Physics.ARCADE);
        this.player.body.maxVelocity.setTo(this.PLAYER_MAX_SPEED, this.PLAYER_MAX_SPEED); // x, y
        this.player.body.collideWorldBounds = true;
        this.player.body.drag.setTo(this.PLAYER_DRAG, this.PLAYER_DRAG); // x, y
    };
    mainState.prototype.update = function () {
        _super.prototype.update.call(this);
        if (this.cursors.left.isDown) {
            this.player.body.acceleration.x = -this.PLAYER_ACCELERATION;
        }
        else if (this.cursors.right.isDown) {
            this.player.body.acceleration.x = this.PLAYER_ACCELERATION;
        }
        else if (this.cursors.up.isDown) {
            this.player.body.acceleration.y = -this.PLAYER_ACCELERATION;
        }
        else if (this.cursors.down.isDown) {
            this.player.body.acceleration.y = this.PLAYER_ACCELERATION;
        }
        else {
            this.player.body.acceleration.x = 0;
            this.player.body.acceleration.y = 0;
        }
        this.player.rotation = this.physics.arcade.angleToPointer(this.player, this.input.activePointer);
    };
    return mainState;
}(Phaser.State));
var ShooterGame = (function (_super) {
    __extends(ShooterGame, _super);
    function ShooterGame() {
        _super.call(this, 806, 480, Phaser.AUTO, 'gameDiv');
        this.state.add('main', mainState);
        this.state.start('main');
    }
    return ShooterGame;
}(Phaser.Game));
window.onload = function () {
    var game = new ShooterGame();
};
//# sourceMappingURL=main.js.map