/// <reference path="phaser/phaser.d.ts"/>

class mainState extends Phaser.State {
    preload():void {
        super.preload();

        this.load.image('bg', 'assets/bg.png');
    }

    create():void {
        super.create();

        this.add.tileSprite(0, 0, this.world.width, this.world.height, 'bg');
    }

    update():void {
        super.update();
    }

}

class ShooterGame extends Phaser.Game {
    constructor() {
        super(806, 480, Phaser.AUTO, 'gameDiv');
        this.state.add('main', mainState);
        this.state.start('main');
    }
}

window.onload = () => {
    var game = new ShooterGame();
};
