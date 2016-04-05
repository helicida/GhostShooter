/// <reference path="phaser/phaser.d.ts"/>
/// <reference path="joypad/GamePad.ts"/>

class mainState extends Phaser.State {

    // Jugador, cursor y controles
    private player:Phaser.Sprite;
    private cursors:Phaser.CursorKeys;
    private gamepad:Gamepads.GamePad;

    // Tilemaps y TileLayers
    private tilemap:Phaser.Tilemap;
    private background:Phaser.TilemapLayer;
    private walls:Phaser.TilemapLayer;

    // Grupos para hacer monstruos
    private monsters:Phaser.Group;
    private explosions:Phaser.Group;
    private bullets:Phaser.Group;

    // Textos que mostramos en pantalla
    private scoreText:Phaser.Text;
    private livesText:Phaser.Text;
    private stateText:Phaser.Text;

    // Constantes
    private PLAYER_ACCELERATION = 500;  // aceleración del jugador
    private PLAYER_MAX_SPEED = 400;     // pixels/second
    private PLAYER_DRAG = 600;          // rozamiento del jugador
    private MONSTER_SPEED = 100;        // velocidad de los monstruos
    private BULLET_SPEED = 800;         // velocidad de las balas
    private MONSTER_HEALTH = 3;         // golpes que aguantan los monstruos
    private FIRE_RATE = 200;            // cadencia de disparo
    private LIVES = 3;                  // vidas
    private TEXT_MARGIN = 50;           // margen de los textos

    // Variables
    private nextFire = 0;   // Variable auxiliar para calcular el tiempo de disparo
    private score = 0;      // Puntuación

    preload():void {

        super.preload();

        // Cargamos las imagenes y el json que incorpora el Tile
        this.load.image('bg', 'assets/bg.png');
        this.load.image('player', 'assets/survivor1_machine.png');
        this.load.image('bullet', 'assets/bulletBeigeSilver_outline.png');
        this.load.image('zombie1', 'assets/zoimbie1_hold.png');
        this.load.image('zombie2', 'assets/zombie2_hold.png');
        this.load.image('robot', 'assets/robot1_hold.png');

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
            this.cursors = this.input.keyboard.createCursorKeys();
        } else {
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
        this.createMonsters();

        // Importante crear en último lugar los textos para que el resto de elementos de la pantalla no los pisen
        this.createTexts();

        // Comprobamos en qué plataforma estámos jugando
        if (!this.game.device.desktop) {
            this.createVirtualJoystick();
        }
    }

    private createTexts() {
        // Mostramos los textos
        var width = this.scale.bounds.width;
        var height = this.scale.bounds.height;

        this.scoreText = this.add.text(this.TEXT_MARGIN, this.TEXT_MARGIN, 'Score: ' + this.score,
            {font: "30px Arial", fill: "#ffffff"});
        this.scoreText.fixedToCamera = true;
        this.livesText = this.add.text(width - this.TEXT_MARGIN, this.TEXT_MARGIN, 'Lives: ' + this.player.health,
            {font: "30px Arial", fill: "#ffffff"});
        this.livesText.anchor.setTo(1, 0);
        this.livesText.fixedToCamera = true;

        this.stateText = this.add.text(width / 2, height / 2, '', {font: '84px Arial', fill: '#fff'});
        this.stateText.anchor.setTo(0.5, 0.5);
        this.stateText.visible = false;
        this.stateText.fixedToCamera = true;
    };

    // Con este
    private createExplosions() {
        this.explosions = this.add.group();
        this.explosions.createMultiple(20, 'explosion');

        this.explosions.setAll('anchor.x', 0.5);
        this.explosions.setAll('anchor.y', 0.5);

        this.explosions.forEach((explosion:Phaser.Sprite) => {
            explosion.loadTexture(this.rnd.pick(['explosion', 'explosion2', 'explosion3']));
        }, this);
    };

    // Método con el que creamos los muros y asignamos su tilemap y
    private createWalls() {
        this.walls = this.tilemap.createLayer('walls');
        this.walls.x = this.world.centerX;
        this.walls.y = this.world.centerY;
        this.walls.resizeWorld();
        this.tilemap.setCollisionBetween(1, 195, true, 'walls');
    };

    // Método con el que creamos el fondo y ajustamos las coordenadas
    private createBackground() {
        this.background = this.tilemap.createLayer('background');
        this.background.x = this.world.centerX;
        this.background.y = this.world.centerY;
    };


    private createTilemap() {
        this.tilemap = this.game.add.tilemap('tilemap');
        this.tilemap.addTilesetImage('tilesheet_complete', 'tiles');

    };

    private createMonsters() {
        this.monsters = this.add.group();
        this.monsters.enableBody = true;
        this.monsters.physicsBodyType = Phaser.Physics.ARCADE;

        this.tilemap.createFromObjects('monsters', 541, 'zombie1', 0, true, false, this.monsters);

        this.monsters.setAll('anchor.x', 0.5);
        this.monsters.setAll('anchor.y', 0.5);
        //this.monsters.setAll('scale.x', 2);
        //this.monsters.setAll('scale.y', 2);
        this.monsters.setAll('health', this.MONSTER_HEALTH);
        this.monsters.forEach(this.setRandomAngle, this);
        this.monsters.forEach((explosion:Phaser.Sprite) => {
            explosion.loadTexture(this.rnd.pick(['zombie1', 'zombie2', 'robot']));
        }, this);

        this.monsters.setAll('checkWorldBounds', true);
        this.monsters.callAll('events.onOutOfBounds.add', 'events.onOutOfBounds', this.resetMonster, this);
    };

    private setRandomAngle(monster:Phaser.Sprite) {
        monster.angle = this.rnd.angle();
    }

    private resetMonster(monster:Phaser.Sprite) {
        monster.rotation = this.physics.arcade.angleBetween(
            monster,
            this.player
        );
    }

    private createBullets() {
        this.bullets = this.add.group();
        this.bullets.enableBody = true;
        this.bullets.physicsBodyType = Phaser.Physics.ARCADE;
        this.bullets.createMultiple(20, 'bullet');

        this.bullets.setAll('anchor.x', 0.5);
        this.bullets.setAll('anchor.y', 0.5);
        this.bullets.setAll('scale.x', 0.5);
        this.bullets.setAll('scale.y', 0.5);
        this.bullets.setAll('outOfBoundsKill', true);
        this.bullets.setAll('checkWorldBounds', true);
    };

    private createVirtualJoystick() {
        this.gamepad = new Gamepads.GamePad(this.game, Gamepads.GamepadType.DOUBLE_STICK);
    };

    private setupCamera() {
        this.camera.follow(this.player);
    };

    private createPlayer() {
        this.player = this.add.sprite(this.world.centerX, this.world.centerY, 'player');
        this.player.anchor.setTo(0.5, 0.5);
        //this.player.scale.setTo(2, 2);
        this.player.health = this.LIVES;
        this.physics.enable(this.player, Phaser.Physics.ARCADE);

        this.player.body.maxVelocity.setTo(this.PLAYER_MAX_SPEED, this.PLAYER_MAX_SPEED); // x, y
        this.player.body.collideWorldBounds = true;
        this.player.body.drag.setTo(this.PLAYER_DRAG, this.PLAYER_DRAG); // x, y
    };

    update():void {
        super.update();
        this.movePlayer();
        this.moveMonsters();
        if (this.game.device.desktop) {
            this.rotatePlayerToPointer();
            this.fireWhenButtonClicked();
        } else {
            this.rotateWithRightStick();
            this.fireWithRightStick();
        }

        this.physics.arcade.collide(this.player, this.monsters, this.monsterTouchesPlayer, null, this);
        this.physics.arcade.collide(this.player, this.walls);
        this.physics.arcade.overlap(this.bullets, this.monsters, this.bulletHitMonster, null, this);
        this.physics.arcade.collide(this.bullets, this.walls, this.bulletHitWall, null, this);
        this.physics.arcade.collide(this.walls, this.monsters, this.resetMonster, null, this);
        this.physics.arcade.collide(this.monsters, this.monsters, this.resetMonster, null, this);
    }

    rotateWithRightStick() {
        var speed = this.gamepad.stick2.speed;

        if (Math.abs(speed.x) + Math.abs(speed.y) > 20) {
            var rotatePos = new Phaser.Point(this.player.x + speed.x, this.player.y + speed.y);
            this.player.rotation = this.physics.arcade.angleToXY(this.player, rotatePos.x, rotatePos.y);

            this.fire();
        }
    }

    fireWithRightStick() {
        //this.gamepad.stick2.
    }

    private monsterTouchesPlayer(player:Phaser.Sprite, monster:Phaser.Sprite) {
        monster.kill();

        player.damage(1);

        this.livesText.setText("Lives: " + this.player.health);

        this.blink(player);

        if (player.health == 0) {
            this.stateText.text = " GAME OVER \n Click to restart";
            this.stateText.visible = true;

            //the "click to restart" handler
            this.input.onTap.addOnce(this.restart, this);
        }
    }

    // metodo para reiniciar el juego de cero (cuidado con las variables)
    restart() {
        this.game.state.restart();
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
            this.score += 10;
            this.scoreText.setText("Score: " + this.score);
        }
    }

    blink(sprite:Phaser.Sprite) {
        var tween = this.add.tween(sprite)
            .to({alpha: 0.5}, 100, Phaser.Easing.Bounce.Out)
            .to({alpha: 1.0}, 100, Phaser.Easing.Bounce.Out);

        tween.repeat(3);
        tween.start();
    }

    // Función para mover los monstruos
    private moveMonsters() {
        this.monsters.forEach(this.advanceStraightAhead, this)
    };

    // Metodo con el que hacemos avanzar los monstruos en dirección a su angulo
    private advanceStraightAhead(monster:Phaser.Sprite) {
        this.physics.arcade.velocityFromAngle(monster.angle, this.MONSTER_SPEED, monster.body.velocity);
    }

    // Función con la que disparamos al hacer clic
    private fireWhenButtonClicked() {
        if (this.input.activePointer.isDown) {
            this.fire();
        }
    };

    // Función con la que rotamos al jugador en dirección al puntero del ratón
    private rotatePlayerToPointer() {
        this.player.rotation = this.physics.arcade.angleToPointer(
            this.player,
            this.input.activePointer
        );
    };

    // Función para mover jugador
    private movePlayer() {
        // Controles de teclado
        var moveWithKeyboard = function () {
            if (this.cursors.left.isDown ||
                this.input.keyboard.isDown(Phaser.Keyboard.A)) {
                this.player.body.acceleration.x = -this.PLAYER_ACCELERATION;
            } else if (this.cursors.right.isDown ||
                this.input.keyboard.isDown(Phaser.Keyboard.D)) {
                this.player.body.acceleration.x = this.PLAYER_ACCELERATION;
            } else if (this.cursors.up.isDown ||
                this.input.keyboard.isDown(Phaser.Keyboard.W)) {
                this.player.body.acceleration.y = -this.PLAYER_ACCELERATION;
            } else if (this.cursors.down.isDown ||
                this.input.keyboard.isDown(Phaser.Keyboard.S)) {
                this.player.body.acceleration.y = this.PLAYER_ACCELERATION;
            } else {
                this.player.body.acceleration.x = 0;
                this.player.body.acceleration.y = 0;
            }
        };

        // Controles con joystick
        var moveWithVirtualJoystick = function () {
            if (this.gamepad.stick1.cursors.left) {
                this.player.body.acceleration.x = -this.PLAYER_ACCELERATION;}
            if (this.gamepad.stick1.cursors.right) {
                this.player.body.acceleration.x = this.PLAYER_ACCELERATION;
            } else if (this.gamepad.stick1.cursors.up) {
                this.player.body.acceleration.y = -this.PLAYER_ACCELERATION;
            } else if (this.gamepad.stick1.cursors.down) {
                this.player.body.acceleration.y = this.PLAYER_ACCELERATION;
            } else {
                this.player.body.acceleration.x = 0;
                this.player.body.acceleration.y = 0;
            }
        };

        // Comprobamos si la plataforma en la que se ejecuta el juego es escritorio o movil
        if (this.game.device.desktop) {
            moveWithKeyboard.call(this);
        } else {
            moveWithVirtualJoystick.call(this);
        }
    };

    // Función para disparar
    fire():void {

        // Usamos un if para respetar la cadencia de disparo
        if (this.time.now > this.nextFire) {

            // Sacamos el primer sprite muerto del group
            var bullet = this.bullets.getFirstDead();

            if (bullet) {

                // Colocamos la bala en su posición y angulo
                var length = this.player.width * 0.5 + 20;
                var x = this.player.x + (Math.cos(this.player.rotation) * length);
                var y = this.player.y + (Math.sin(this.player.rotation) * length);

                // Damos los valores a las balas, a las explosiones y el angulo
                bullet.reset(x, y);
                this.explosion(x, y);
                bullet.angle = this.player.angle;

                // Le damos bien la velocidad en relación al angulo para que la bala apunte bien
                var velocity = this.physics.arcade.velocityFromRotation(bullet.rotation, this.BULLET_SPEED);
                bullet.body.velocity.setTo(velocity.x, velocity.y);

                // Ajustamos la variable auxiliar nextFire usando la cadencia de fuego para saber cada cuando se puede disaprar
                this.nextFire = this.time.now + this.FIRE_RATE;
            }
        }
    }

    explosion(x:number, y:number):void {

        // Sacamos el primer sprite muerto del group
        var explosion:Phaser.Sprite = this.explosions.getFirstDead();

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
}

class ShooterGame extends Phaser.Game {
    constructor() {
        super(800, 480, Phaser.CANVAS, 'gameDiv');
        this.state.add('main', mainState);
        this.state.start('main');
    }
}

window.onload = () => {
    var game = new ShooterGame();
};
