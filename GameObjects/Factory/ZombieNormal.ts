/**
 * Created by 46465442z on 18/04/16.
 */
module MyGame{

    export class ZombieNormal extends Monster {

        // Zombie normal

        constructor(game:ShooterGame, key:string|Phaser.RenderTexture|Phaser.BitmapData|PIXI.Texture)  {
            super(game, 150, 150,key, 0);

            // Ajustamos el sprite
            this.anchor.setTo(0.5,0.5);
            this.angle = game.rnd.angle();

            // Datos del monstruo
            this.keyImagen="Zombie Normal";
            this.health = 3;
            this.velocidadMonstruo = 100;
        }

        update():void {
            super.update();
        }
    }


}