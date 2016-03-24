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
    }
    mainState.prototype.preload = function () {
        _super.prototype.preload.call(this);
        this.load.image('bg', 'assets/bg.png');
        this.load.image('player', 'assets/player.png');
    };
    mainState.prototype.create = function () {
        _super.prototype.create.call(this);
        this.add.tileSprite(0, 0, this.world.width, this.world.height, 'bg');
        this.player = this.add.sprite(this.world.centerX, this.world.centerY, 'player');
        this.player.anchor.setTo(0.5, 0.5);
    };
    mainState.prototype.update = function () {
        _super.prototype.update.call(this);
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