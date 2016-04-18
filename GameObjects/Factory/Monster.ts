/**
 * Created by 46465442z on 18/04/16.
 */
module MyGame{

    export abstract class Monster extends Phaser.Sprite {

        // Instanciamos el juego
        game:ShooterGame;

        // Comportamiento
        comportamiento:Comportamiento = new NoEnfadado();

        // Variables
        keyImagen:string;
        velocidadMonstruo:number;

        // Constructores
        constructor(game:ShooterGame, x:number, y:number, key:string|Phaser.RenderTexture|Phaser.BitmapData|PIXI.Texture, frame:string|number)  {
            super(game, x, y, key, frame);

            this.game.physics.enable(this, Phaser.Physics.ARCADE);
            this.body.enableBody = true;
            this.game = game;

            // En este caso no tenemos datos del Monstruo porque es una clase abstracta, los instanciaremos en las clases que hereden
        }

        update():void  {
            super.update();

            // Lógica de los zombies de Carles
            this.game.physics.arcade.velocityFromAngle(this.angle, this.velocidadMonstruo, this.body.velocity);
            this.events.onOutOfBounds.add(this.resetMonster, this);
        }

        // Metodos
        resetMonster(monster:Phaser.Sprite) {
            monster.rotation = this.game.physics.arcade.angleBetween(monster, this.game.player);
        }

        // Setters
        setComportamiento(comportamiento:Comportamiento):void {
            this.comportamiento = comportamiento;

            if(this.comportamiento.velocidad != null && this.comportamiento.key != null){
                this.velocidadMonstruo = this.comportamiento.velocidad;
                this.loadTexture(this.comportamiento.key);
            }
        }

        setEnfadado(valor:boolean) {
            if(valor == true){
                this.setComportamiento(new Enfadado());
            }
        }
    }

}