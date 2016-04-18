/**
 * Created by 46465442z on 18/04/16.
 */
module MyGame{

    export abstract class Recolectable extends Phaser.Sprite{

        tipoRecolectable:string;

        // Constructor con una velocidad angular fija y las fisicas activadas
        constructor(game:Phaser.Game, tipoRecolectable:string, x:number, y:number, key:string|Phaser.RenderTexture|Phaser.BitmapData|PIXI.Texture, frame:string|number) {
            super(game, x, y, key, frame);

            this.tipoRecolectable = tipoRecolectable;

            // Sprite
            this.game.physics.enable(this);
        }

        // Metodo update
        update():void {
            super.update();

        }

        // Getters
        getTipoRecolectable():String{
            return this.tipoRecolectable;
        }
    }
}