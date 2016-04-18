/**
 * Created by 46465442z on 18/04/16.
 */
module MyGame{

    export class PartesDelTesoro extends Recolectable {

        numeroParteDelTesoro:number=0;

        constructor(game:Phaser.Game, tipoRecolectable:string, numeroParteDelTesoro:number, x:number, y:number, key:string|Phaser.RenderTexture|Phaser.BitmapData|PIXI.Texture, frame:string|number) {
            super(game, tipoRecolectable, x, y, key, frame);

            // Neceistamos todas las partes del tesoro
            this.numeroParteDelTesoro = numeroParteDelTesoro;

            // Sprite
            this.anchor.setTo(0.5, 0.5);
            this.body.angularVelocity = 150;

        }

        // Getters
        getNumeroParteDelTesoro():number{
            return this.numeroParteDelTesoro;
        }
    }

}