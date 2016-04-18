/**
 * Created by 46465442z on 18/04/16.
 */
module MyGame{

    export class ZombieRunner extends Monster {

        // Els zombieRunner son més ràpids peró suporten menys trets

        constructor(game:ShooterGame, key:string|Phaser.RenderTexture|Phaser.BitmapData|PIXI.Texture)  {
            super(game, 900, 150,key, 0);

            // Ajustamos el sprite
            this.anchor.setTo(0.5,0.5);
            this.angle = game.rnd.angle();

            // Datos del monstruo
            this.keyImagen="Zombie Runner";
            this.health = 2;
            this.velocidadMonstruo = 250;
        }

        update():void {
            super.update();
        }
    }

}