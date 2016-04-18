/**
 * Created by 46465442z on 18/04/16.
 */

module MyGame {

    export class LoadState extends Phaser.State {

        preload():void {
            super.preload();

            // Agregamos un texto de cargando a la pantalla
            var etiquetaCargando = this.add.text(this.world.centerX, 150, 'Cargando...',
                {font: '30px Arial', fill: '#ffffff'});
            etiquetaCargando.anchor.setTo(0.5, 0.5);

            // Muestra la barra de progreso
            var progressBar = this.add.sprite(this.world.centerX, 200, 'progressBar');
            progressBar.anchor.setTo(0.5, 0.5);
            this.load.setPreloadSprite(progressBar);

            // Cargamos las imagenes y el json que incorpora el Tile
            this.load.image('bg', 'assets/bg.png');
            this.load.image('player', 'assets/survivor1_machine.png');
            this.load.image('bullet', 'assets/bulletBeigeSilver_outline.png');
            this.load.image('Zombie Normal', 'assets/zoimbie1_hold.png');
            this.load.image('Zombie Runner', 'assets/zombie2_hold.png');
            this.load.image('robot', 'assets/robot1_hold.png');
            this.load.image('recolectable', 'assets/PickupLow.png');
            this.load.image('angryZombie', 'assets/angryZombie.png')

            this.load.image('explosion', 'assets/smokeWhite0.png');
            this.load.image('explosion2', 'assets/smokeWhite1.png');
            this.load.image('explosion3', 'assets/smokeWhite2.png');
            this.load.tilemap('tilemap', 'assets/tiles.json', null, Phaser.Tilemap.TILED_JSON);
            this.load.image('tiles', 'assets/tilesheet_complete.png');

            this.load.image('joystick_base', 'assets/transparentDark05.png');
            this.load.image('joystick_segment', 'assets/transparentDark09.png');
            this.load.image('joystick_knob', 'assets/transparentDark49.png');
        }

        create():void {
            super.create();
            this.game.state.start('play');
        }
    }
}