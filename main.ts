/// <reference path="phaser/phaser.d.ts"/>
/// <reference path="joypad/GamePad.ts"/>

import game = PIXI.game;
import Point = Phaser.Point;
class ShooterGame extends Phaser.Game {

    // Jugador, cursor y controles
    player:Player;
    cursors:Phaser.CursorKeys;
    gamepad:Gamepads.GamePad;

    // Tilemaps y TileLayers
    tilemap:Phaser.Tilemap;
    background:Phaser.TilemapLayer;
    walls:Phaser.TilemapLayer;

    // Grupos para hacer monstruos
    monsters:Phaser.Group;
    explosions:Phaser.Group;
    bullets:Phaser.Group;
    recolectables:Phaser.Group; // Recolectables

    // Textos que mostramos en pantalla
    scoreText:Phaser.Text;
    livesText:Phaser.Text;
    stateText:Phaser.Text;
    recolectableText:Phaser.Text;

    // Constantes
    PLAYER_ACCELERATION = 500;  // aceleración del jugador
    PLAYER_MAX_SPEED = 400;     // pixels/second
    PLAYER_DRAG = 600;          // rozamiento del jugador
    MONSTER_SPEED = 100;        // velocidad de los monstruos
    BULLET_SPEED = 800;         // velocidad de las balas
    MONSTER_HEALTH = 3;         // golpes que aguantan los monstruos
    FIRE_RATE = 200;            // cadencia de disparo
    LIVES = 3;                  // vidas
    TEXT_MARGIN = 50;           // margen de los textos

    // Variables
    nextFire = 0;   // Variable auxiliar para calcular el tiempo de disparo
    score = 0;      // Puntuación

    constructor() {
        super(1000, 850, Phaser.CANVAS, 'gameDiv');
        this.state.add('main', mainState);
        this.state.start('main');
    }
}

class mainState extends Phaser.State {

    // Instanciamos nuestro shooter game para poder acceder a las variables
    game:ShooterGame;

    preload():void {

        super.preload();

        // Cargamos las imagenes y el json que incorpora el Tile
        this.load.image('bg', 'assets/bg.png');
        this.load.image('player', 'assets/survivor1_machine.png');
        this.load.image('bullet', 'assets/bulletBeigeSilver_outline.png');
        this.load.image('Zombie Normal', 'assets/zoimbie1_hold.png');
        this.load.image('Zombie Runner', 'assets/zombie2_hold.png');
        this.load.image('robot', 'assets/robot1_hold.png');
        this.load.image('recolectable', 'assets/PickupLow.png');

        this.load.image('explosion', 'assets/smokeWhite0.png');
        this.load.image('explosion2', 'assets/smokeWhite1.png');
        this.load.image('explosion3', 'assets/smokeWhite2.png');
        this.load.tilemap('tilemap', 'assets/tiles.json', null, Phaser.Tilemap.TILED_JSON);
        this.load.image('tiles', 'assets/tilesheet_complete.png');

        this.load.image('joystick_base', 'assets/transparentDark05.png');
        this.load.image('joystick_segment', 'assets/transparentDark09.png');
        this.load.image('joystick_knob', 'assets/transparentDark49.png');

        // Arrancamos el sistema de físicas
        this.physics.startSystem(Phaser.Physics.ARCADE);

        // Comprobamos la plataforma y ajustamos las teclas y las dimensiones de la pantalla
        if (this.game.device.desktop) {
            this.game.cursors = this.input.keyboard.createCursorKeys();
        }
        else {
            this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
            this.scale.pageAlignHorizontally = true;
            this.scale.pageAlignVertically = true;
            this.scale.pageAlignHorizontally = true;
            this.scale.pageAlignVertically = true;
            this.scale.forceOrientation(true);
            this.scale.startFullScreen(false);
        }
    }

    create():void {
        super.create();

        // Llamámos a todos los metodos de los creates
        this.createTilemap();
        this.createBackground();
        this.createWalls();
        this.createExplosions();
        this.createBullets();
        this.createPlayer();
        this.setupCamera();
        this.createRecolectables();
        this.createMonsters();

        // Importante crear en último lugar los textos para que el resto de elementos de la pantalla no los pisen
        this.createTexts();

        // Comprobamos en qué plataforma estámos jugando
        if (!this.game.device.desktop) {
            this.createVirtualJoystick();
        }
    }

    //-------------------------------------------------------------------------------
    // Create elementos fisicos: Jugadores, monstruos, balas, recolectables y explosiones
    //-------------------------------------------------------------------------------

    // Jugador principal
    private createPlayer() {

        var jugador = new Player('J1', 5, this.game, this.world.centerX, this.world.centerY, 'player', 0);
        this.game.player = this.add.existing(jugador);

        // Nota: importante asignar el jugador con add.existing. Si se referencia directamente la variable causará problemas
    };

    // Generamos los monstruos cdel tipo que nos interese
    private createMonsters() {

        this.game.monsters = this.add.group();

        // Instanciamos la clase factory que es con la que construiremos los zombies
        var factory = new MonsterFactory(this.game);

        // Generamos 10 zombies rápidos
        for (var iterador = 0; iterador < 10; iterador++) {

            var monster1 = factory.generarMonstruo('Zombie Runner');

            // Anyadimos los zombies al grupo
            this.game.add.existing(monster1);
            this.game.monsters.add(monster1)
        }

        // Generamos 15 normales
        for (var iterador = 0; iterador < 15; iterador++) {

            var monster2 = factory.generarMonstruo('Zombie Normal');

            // Anyadimos los zombies al grupo
            this.game.add.existing(monster2);
            this.game.monsters.add(monster2)
        }
    };

    // Le damos las propiedades a las balas
    private createBullets() {
        this.game.bullets = this.add.group();
        this.game.bullets.enableBody = true;
        this.game.bullets.physicsBodyType = Phaser.Physics.ARCADE;
        this.game.bullets.createMultiple(20, 'bullet');

        this.game.bullets.setAll('anchor.x', 0.5);
        this.game.bullets.setAll('anchor.y', 0.5);
        this.game.bullets.setAll('scale.x', 0.5);
        this.game.bullets.setAll('scale.y', 0.5);
        this.game.bullets.setAll('outOfBoundsKill', true);
        this.game.bullets.setAll('checkWorldBounds', true);
    };

    // Con este metodo se generan las explosiones, existen tres tipos y se escogen de manera al azar
    private createExplosions() {
        this.game.explosions = this.add.group();
        this.game.explosions.createMultiple(20, 'explosion');

        this.game.explosions.setAll('anchor.x', 0.5);
        this.game.explosions.setAll('anchor.y', 0.5);

        this.game.explosions.forEach((explosion:Phaser.Sprite) => {
            explosion.loadTexture(this.rnd.pick(['explosion', 'explosion2', 'explosion3']));
        }, this);
    };

    // Método con el que creamos los muros y marcamos los limites del mapa
    private createWalls() {
        this.game.walls = this.game.tilemap.createLayer('walls');
        this.game.walls.x = this.world.centerX;
        this.game.walls.y = this.world.centerY;
        this.game.walls.resizeWorld();
        this.game.tilemap.setCollisionBetween(1, 195, true, 'walls');
    };

    createRecolectables():void {

        // Anyadimos el recolectable a un grupo
        this.game.recolectables = this.add.group();
        this.game.recolectables.enableBody = true;

        // Posiciones en las que generaremos los recolectables
        var positions:Point[] = [
            new Point(500, 295),
            new Point(390, 335), new Point(610, 335),
            new Point(320, 400), new Point(680, 400),
            new Point(295, 500), new Point(705, 500),
            new Point(320, 605), new Point(680, 605),
            new Point(390, 665), new Point(610, 665),
            new Point(500, 705),
        ];

        // Colocamos los sprites en sus coordenadas a traves de un for
        for (var i = 0; i < positions.length; i++) {

            var position = positions[i];

            // instanciamos el Sprite
            var recolectable = new PartesDelTesoro(this.game, "Pieza del tesoro", i, position.x, position.y, 'recolectable', 0);

            // mostramos el Sprite por pantalla
            this.add.existing(recolectable);
            this.game.recolectables.add(recolectable);
        }
    }

    //---------------------------------------------------------
    // Textos, mapa... Parte gráfica del juego
    //---------------------------------------------------------

    // En este metodo generamos los textos que mostraremos por pantalla
    private createTexts() {

        var width = this.scale.bounds.width;
        var height = this.scale.bounds.height;

        this.game.recolectableText = this.add.text(300, 20, 'Recolectables: ',
            {font: "30px Arial", fill: "#ffffff"});
        this.game.recolectableText.fixedToCamera = true;


        this.game.scoreText = this.add.text(this.game.TEXT_MARGIN, this.game.TEXT_MARGIN, 'Score: ' + this.game.score,
            {font: "30px Arial", fill: "#ffffff"});
        this.game.scoreText.fixedToCamera = true;
        this.game.livesText = this.add.text(width - this.game.TEXT_MARGIN, this.game.TEXT_MARGIN, 'Lives: ' + this.game.player.health,
            {font: "30px Arial", fill: "#ffffff"});
        this.game.livesText.anchor.setTo(1, 0);
        this.game.livesText.fixedToCamera = true;

        this.game.stateText = this.add.text(width / 2, height / 2, '', {font: '84px Arial', fill: '#fff'});
        this.game.stateText.anchor.setTo(0.5, 0.5);
        this.game.stateText.visible = false;
        this.game.stateText.fixedToCamera = true;
    };

    // Método con el que creamos el fondo y ajustamos las coordenadas
    private createBackground() {
        this.game.background = this.game.tilemap.createLayer('background');
        this.game.background.x = this.world.centerX;
        this.game.background.y = this.world.centerY;
    };

    // Incorpora el mapa al juego a partir de un tileMap
    private createTilemap() {
        this.game.tilemap = this.game.add.tilemap('tilemap');
        this.game.tilemap.addTilesetImage('tilesheet_complete', 'tiles');

    };

    //---------------------------------------------------------
    //  Movimiento jugador, monstruos y lógica general del juego
    //---------------------------------------------------------

    // ----- Monstruos ------ //

    private setRandomAngle(monster:Phaser.Sprite) {
        monster.angle = this.rnd.angle();
    }

    private resetMonster(monster:Phaser.Sprite) {
        monster.rotation = this.physics.arcade.angleBetween(monster, this.game.player);
    }

    // Función para mover los monstruos
    private moveMonsters() {
        this.game.monsters.forEach(this.advanceStraightAhead, this)
    };

    // Metodo con el que hacemos avanzar los monstruos en dirección a su angulo
    private advanceStraightAhead(monster:Phaser.Sprite) {
        this.physics.arcade.velocityFromAngle(monster.angle, this.game.MONSTER_SPEED, monster.body.velocity);
    }

    // ------ Jugador ----- //

    // Función para mover jugador
    private movePlayer() {

        // Controles de teclado
        var moveWithKeyboard = function () {
            if (this.game.cursors.left.isDown ||
                this.input.keyboard.isDown(Phaser.Keyboard.A)) {
                this.game.player.body.acceleration.x = -this.game.PLAYER_ACCELERATION;
            } else if (this.game.cursors.right.isDown ||
                this.input.keyboard.isDown(Phaser.Keyboard.D)) {
                this.game.player.body.acceleration.x = this.game.PLAYER_ACCELERATION;
            } else if (this.game.cursors.up.isDown ||
                this.game.input.keyboard.isDown(Phaser.Keyboard.W)) {
                this.game.player.body.acceleration.y = -this.game.PLAYER_ACCELERATION;
            } else if (this.game.cursors.down.isDown ||
                this.input.keyboard.isDown(Phaser.Keyboard.S)) {
                this.game.player.body.acceleration.y = this.game.PLAYER_ACCELERATION;
            } else {
                this.game.player.body.acceleration.x = 0;
                this.game.player.body.acceleration.y = 0;
            }
        };

        // Controles con joystick
        var moveWithVirtualJoystick = function () {
            if (this.game.gamepad.stick1.cursors.left) {
                this.game.player.body.acceleration.x = -this.game.PLAYER_ACCELERATION;}
            if (this.game.gamepad.stick1.cursors.right) {
                this.game.player.body.acceleration.x = this.game.PLAYER_ACCELERATION;
            } else if (this.game.gamepad.stick1.cursors.up) {
                this.game.player.body.acceleration.y = -this.game.PLAYER_ACCELERATION;
            } else if (this.game.gamepad.stick1.cursors.down) {
                this.game.player.body.acceleration.y = this.game.PLAYER_ACCELERATION;
            } else {
                this.game.player.body.acceleration.x = 0;
                this.game.player.body.acceleration.y = 0;
            }
        };

        // Comprobamos si la plataforma en la que se ejecuta el juego es escritorio o movil
        if (this.game.device.desktop) {
            moveWithKeyboard.call(this);
        } else {
            moveWithVirtualJoystick.call(this);
        }
    };

    rotateWithRightStick() {
        var speed = this.game.gamepad.stick2.speed;

        if (Math.abs(speed.x) + Math.abs(speed.y) > 20) {
            var rotatePos = new Phaser.Point(this.game.player.x + speed.x, this.game.player.y + speed.y);
            this.game.player.rotation = this.physics.arcade.angleToXY(this.game.player, rotatePos.x, rotatePos.y);

            this.fire();
        }
    }

    // Función con la que rotamos al jugador en dirección al puntero del ratón
    private rotatePlayerToPointer() {
        this.game.player.rotation = this.physics.arcade.angleToPointer(
            this.game.player,
            this.input.activePointer
        );
    };

    // ---- Cámara y controles ----//

    private createVirtualJoystick() {
        this.game.gamepad = new Gamepads.GamePad(this.game, Gamepads.GamepadType.DOUBLE_STICK);
    };

    private setupCamera() {
        this.camera.follow(this.game.player);
    };


    //---------------------------------------------------------
    //  Tweens, efectos, animaciones del juego.
    //---------------------------------------------------------

    explosion(x:number, y:number):void {

        // Sacamos el primer sprite muerto del group
        var explosion:Phaser.Sprite = this.game.explosions.getFirstDead();

        if (explosion) {

            // Colocamos la explosión con su transpariencia y posición
            explosion.reset(
                x - this.rnd.integerInRange(0, 5) + this.rnd.integerInRange(0, 5),
                y - this.rnd.integerInRange(0, 5) + this.rnd.integerInRange(0, 5)
            );
            explosion.alpha = 0.6;
            explosion.angle = this.rnd.angle();
            explosion.scale.setTo(this.rnd.realInRange(0.5, 0.75));

            // Hacemos que varíe su tamaño para dar la sensación de que el humo se disipa
            this.add.tween(explosion.scale).to({x: 0, y: 0}, 500).start();
            var tween = this.add.tween(explosion).to({alpha: 0}, 500);

            // Una vez terminado matámos la explosión
            tween.onComplete.add(() => {
                explosion.kill();
            });
            tween.start();
        }
    }

    blink(sprite:Phaser.Sprite) {
        var tween = this.add.tween(sprite)
            .to({alpha: 0.5}, 100, Phaser.Easing.Bounce.Out)
            .to({alpha: 1.0}, 100, Phaser.Easing.Bounce.Out);

        tween.repeat(3);
        tween.start();
    }

    //---------------------------------------------------------
    //  Colisiones y limites del mapa
    //---------------------------------------------------------

    private monsterTouchesPlayer(player:Phaser.Sprite, monster:Phaser.Sprite) {
        monster.kill();

        player.damage(1);

        this.game.livesText.setText("Lives: " + this.game.player.health);

        this.blink(player);

        if (player.health == 0) {
            this.game.stateText.text = " GAME OVER \n Click to restart";
            this.game.stateText.visible = true;

            //the "click to restart" handler
            this.input.onTap.addOnce(this.restart, this);
        }
    }

    private bulletHitWall(bullet:Phaser.Sprite, walls:Phaser.TilemapLayer) {
        this.explosion(bullet.x, bullet.y);
        bullet.kill();
    }

    private bulletHitMonster(bullet:Phaser.Sprite, monster:Phaser.Sprite) {
        bullet.kill();
        monster.damage(1);


        this.explosion(bullet.x, bullet.y);

        if (monster.health > 0) {
            this.blink(monster)
        } else {
            this.game.score += 10;
            // this.game.scoreText.setText("Score: " + this.game.score);
        }
    }

    private recogerTesoro(player:Player, recolectable:PartesDelTesoro) {

        // Anyadimos el recolectable al array
        player.anyadirTesoro(recolectable);
        player.mostrarTextoRecolectables();

        // Nos cargamos el sprite
        recolectable.kill();
    }

    //---------------------------------------------------------
    //  Update principal del juego
    //---------------------------------------------------------

    update():void {
        super.update();

        this.movePlayer();
        this.moveMonsters();

        // Controles
        if (this.game.device.desktop) {
            this.rotatePlayerToPointer();
            this.fireWhenButtonClicked();
        } else {
            this.rotateWithRightStick();
            this.fireWithRightStick();
        }

        // Colisiones
        this.physics.arcade.collide(this.game.player, this.game.monsters, this.monsterTouchesPlayer, null, this);
        this.physics.arcade.collide(this.game.player, this.game.walls);
        this.physics.arcade.overlap(this.game.bullets, this.game.monsters, this.bulletHitMonster, null, this);
        this.physics.arcade.collide(this.game.bullets, this.game.walls, this.bulletHitWall, null, this);
        this.physics.arcade.collide(this.game.walls, this.game.monsters, this.resetMonster, null, this);
        this.physics.arcade.collide(this.game.monsters, this.game.monsters, this.resetMonster, null, this);
        this.physics.arcade.overlap(this.game.player, this.game.recolectables, this.recogerTesoro, null, this);
    }

    // Método para reiniciar el juego de cero (cuidado con las variables de puntuacion, vidas, etc...)
    restart() {
        this.game.state.restart();
        this.game.score = 0;
    }

    //---------------------------------------------------------
    // Balas y disparos
    //---------------------------------------------------------

    fireWithRightStick() {
        //this.gamepad.stick2.
    }

    // Función con la que disparamos al hacer clic
    private fireWhenButtonClicked() {
        if (this.input.activePointer.isDown && this.game.player.health > 0) {
            this.fire();
        }
    };

    // Función para disparar
    fire():void {

        // Usamos un if para respetar la cadencia de disparo
        if (this.time.now > this.game.nextFire) {

            // Sacamos el primer sprite muerto del group
            var bullet = this.game.bullets.getFirstDead();

            if (bullet) {

                // Colocamos la bala en su posición y angulo
                var length = this.game.player.width * 0.5 + 20;
                var x = this.game.player.x + (Math.cos(this.game.player.rotation) * length);
                var y = this.game.player.y + (Math.sin(this.game.player.rotation) * length);

                // Damos los valores a las balas, a las explosiones y el angulo
                bullet.reset(x, y);
                this.explosion(x, y);
                bullet.angle = this.game.player.angle;

                // Le damos bien la velocidad en relación al angulo para que la bala apunte bien
                var velocity = this.physics.arcade.velocityFromRotation(bullet.rotation, this.game.BULLET_SPEED);
                bullet.body.velocity.setTo(velocity.x, velocity.y);

                // Ajustamos la variable auxiliar nextFire usando la cadencia de fuego para saber cada cuando se puede disaprar
                this.game.nextFire = this.time.now + this.game.FIRE_RATE;
            }
        }
    }
}

//------------------------------------------------------------------------ //
// --------- Patrón Decorator para recoger coleccionables y extras ------- //
//------------------------------------------------------------------------ //
abstract class Recolectable extends Phaser.Sprite{

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

class PartesDelTesoro extends Recolectable {

    numeroParteDelTesoro:number;

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


//---------------------------------------------------------------------- //
// --------- Patrón Factory para el comportamiento de los zombies ------ //
//---------------------------------------------------------------------- //

abstract class Monster extends Phaser.Sprite {

    // Instanciamos el juego
    game:ShooterGame;

    // Variables
    keyImagen:string;
    velocidadMonstruo:number;

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

    resetMonster(monster:Phaser.Sprite) {
        monster.rotation = this.game.physics.arcade.angleBetween(monster, this.game.player);
    }
}

class ZombieNormal extends Monster {

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

class ZombieRunner extends Monster {

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

class MonsterFactory {

    // Instanciamos el juego
    game:ShooterGame;

    // Constructores
    constructor(game:ShooterGame) {
        this.game = game;
    }

    // Con este metodo
    generarMonstruo(key:string|Phaser.RenderTexture|Phaser.BitmapData|PIXI.Texture):Monster {

        if (key =='Zombie Normal'){
            return new ZombieNormal(this.game, key);
        }
        else if (key =='Zombie Runner'){
            return new ZombieRunner(this.game, key);
        }
        else{
            return null;
        }
    }
}

//------------------------------------------------------------------ //
// --------- Patrón Observer para la puntuación del jugador -------- //
//------------------------------------------------------------------ //

class Player extends Phaser.Sprite {

    // Instanciamos el juego
    game:ShooterGame;

    // Codigo al que suscribiremos nuestro jugador
    ScoreBackend:ScoreBackend = new ScoreBackend();

    // Le vamos guardando a nuestro personaje los recolectables
    partesDelTesoro:Array<PartesDelTesoro> = [];
    contador:number; // Contador para saber en que posicion del arrayEscribir

    // Variables
    id:string;              // ID con la que identificaremos al jugador
    puntuacion:number = 0;  // Puntos que lleva

    // Constructores
    constructor(id:string, numeroVidas:number, game:ShooterGame, x:number, y:number, key:string|Phaser.RenderTexture|Phaser.BitmapData|PIXI.Texture, frame:string|number)  {
        super(game, x, y, key, frame);

        // Ajustamos el sprite
        this.anchor.setTo(0.5, 0.5);
        this.game.physics.enable(this, Phaser.Physics.ARCADE);
        this.body.maxVelocity.setTo(this.game.PLAYER_MAX_SPEED, this.game.PLAYER_MAX_SPEED);
        this.body.collideWorldBounds = true;
        this.body.drag.setTo(this.game.PLAYER_DRAG, this.game.PLAYER_DRAG);

        // Datos del jugador
        this.game = game;
        this.id = id;
        this.health = numeroVidas;

        // Finalmente suscribimos el jugador a nuestro codigo que monitoriza las puntuaciones
        this.ScoreBackend.suscribirJugador(this);
    }

    // Update
    update():void  {
        super.update();
        this.ScoreBackend.update(this);
    }

    // Metodos
    notificarPuntuacion():void {
         this.game.scoreText.setText("Score: " + this.game.score);
    }

    anyadirTesoro(recolectable:PartesDelTesoro)  {
        this.partesDelTesoro[this.contador] = recolectable;
        this.contador++;
    }

    mostrarTextoRecolectables(){
        var textoRecolectables;

        for (var iterador = 0; iterador < this.partesDelTesoro.length; iterador++) {
            textoRecolectables = textoRecolectables + "Tesoro " + this.partesDelTesoro[iterador].getNumeroParteDelTesoro() + " - ";
        }

        this.game.recolectableText.setText("Recolectables: " + textoRecolectables);
    }

    // Getters
    getId():String{
        return this.id;
    }

    getPuntuacion():number{
        return this.puntuacion;
    }

}

class ScoreBackend {
    
    // Array que contiene todos los jugadores suscritos
    jugadores:Array<Player> = [];

    // Contador auxiliar para saber en que posición del array escribir
    contador:number = 0;
    
    // Constructor
    constructor(){
    }
    
    // Update
    update(jugador:Player):void {

        // Comprobamos si el jugador que recibimos está suscrito, es decir, si figura en el array
        for (var iterador = 0; iterador < this.jugadores.length; iterador++) {

            // Y si lo está notificamos al jugador el canvio pertinente
            if (this.jugadores[iterador].id == jugador.id) {
               jugador.notificarPuntuacion();
            }
        }
    }
    
    // Metodos
    suscribirJugador(player:Player) {
        this.jugadores[this.contador] = player;
        this.contador++;
    }
}

window.onload = () => {
     new ShooterGame();
};