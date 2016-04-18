/**
 * Created by 46465442z on 18/04/16.
 */

module MyGame {

    export class BootState extends Phaser.State {

        preload():void {
            super.preload();
            this.load.image('progressBar', 'assets/progressBar.png');
        }

        create():void {
            super.create();

            this.inicializaCampoDeJuego();
            this.game.state.start('load');
        }

        private inicializaCampoDeJuego() {
            this.stage.backgroundColor = "#000000";
            this.physics.startSystem(Phaser.Physics.ARCADE);
        };
    }
}
