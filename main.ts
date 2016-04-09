/// <reference path="phaser/phaser.d.ts"/>
/// <reference path="joypad/GamePad.ts"/>

class ShooterGame extends Phaser.Game {

    // Jugador, cursor y controles
    player:Phaser.Sprite;
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

    // Textos que mostramos en pantalla
    scoreText:Phaser.Text;
    livesText:Phaser.Text;
    stateText:Phaser.Text;

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
        super(800, 480, Phaser.CANVAS, 'gameDiv');
        this.state.add('main', mainState);
        this.state.start('main');
    }
}

class mainState extends Phaser.State {

    // Instanciamos nuestro shooter game para poder acceder a las variables
    shooterGame:ShooterGame;

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
            this.shooterGame.cursors = this.input.keyboard.createCursorKeys();
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

        this.shooterGame.scoreText = this.add.text(this.shooterGame.TEXT_MARGIN, this.shooterGame.TEXT_MARGIN, 'Score: ' + this.shooterGame.score,
            {font: "30px Arial", fill: "#ffffff"});
        this.shooterGame.scoreText.fixedToCamera = true;
        this.shooterGame.livesText = this.add.text(width - this.shooterGame.TEXT_MARGIN, this.shooterGame.TEXT_MARGIN, 'Lives: ' + this.shooterGame.player.health,
            {font: "30px Arial", fill: "#ffffff"});
        this.shooterGame.livesText.anchor.setTo(1, 0);
        this.shooterGame.livesText.fixedToCamera = true;

        this.shooterGame.stateText = this.add.text(width / 2, height / 2, '', {font: '84px Arial', fill: '#fff'});
        this.shooterGame.stateText.anchor.setTo(0.5, 0.5);
        this.shooterGame.stateText.visible = false;
        this.shooterGame.stateText.fixedToCamera = true;
    };

    // Con este
    private createExplosions() {
        this.shooterGame.explosions = this.add.group();
        this.shooterGame.explosions.createMultiple(20, 'explosion');

        this.shooterGame.explosions.setAll('anchor.x', 0.5);
        this.shooterGame.explosions.setAll('anchor.y', 0.5);

        this.shooterGame.explosions.forEach((explosion:Phaser.Sprite) => {
            explosion.loadTexture(this.rnd.pick(['explosion', 'explosion2', 'explosion3']));
        }, this);
    };

    // Método con el que creamos los muros y asignamos su tilemap y
    private createWalls() {
        this.shooterGame.walls = this.shooterGame.tilemap.createLayer('walls');
        this.shooterGame.walls.x = this.world.centerX;
        this.shooterGame.walls.y = this.world.centerY;
        this.shooterGame.walls.resizeWorld();
        this.shooterGame.tilemap.setCollisionBetween(1, 195, true, 'walls');
    };

    // Método con el que creamos el fondo y ajustamos las coordenadas
    private createBackground() {
        this.shooterGame.background = this.shooterGame.tilemap.createLayer('background');
        this.shooterGame.background.x = this.world.centerX;
        this.shooterGame.background.y = this.world.centerY;
    };


    private createTilemap() {
        this.shooterGame.tilemap = this.game.add.tilemap('tilemap');
        this.shooterGame.tilemap.addTilesetImage('tilesheet_complete', 'tiles');

    };

    private createMonsters() {
        this.shooterGame.monsters = this.add.group();
        this.shooterGame.monsters.enableBody = true;
        this.shooterGame.monsters.physicsBodyType = Phaser.Physics.ARCADE;

        this.shooterGame.tilemap.createFromObjects('monsters', 541, 'zombie1', 0, true, false, this.shooterGame.monsters);

        this.shooterGame.monsters.setAll('anchor.x', 0.5);
        this.shooterGame.monsters.setAll('anchor.y', 0.5);
        //this.monsters.setAll('scale.x', 2);
        //this.monsters.setAll('scale.y', 2);
        this.shooterGame.monsters.setAll('health', this.shooterGame.MONSTER_HEALTH);
        this.shooterGame.monsters.forEach(this.setRandomAngle, this);
        this.shooterGame.monsters.forEach((explosion:Phaser.Sprite) => {
            explosion.loadTexture(this.rnd.pick(['zombie1', 'zombie2', 'robot']));
        }, this);

        this.shooterGame.monsters.setAll('checkWorldBounds', true);
        this.shooterGame.monsters.callAll('events.onOutOfBounds.add', 'events.onOutOfBounds', this.resetMonster, this);
    };

    private setRandomAngle(monster:Phaser.Sprite) {
        monster.angle = this.rnd.angle();
    }

    private resetMonster(monster:Phaser.Sprite) {
        monster.rotation = this.physics.arcade.angleBetween(
            monster,
            this.shooterGame.player
        );
    }

    private createBullets() {
        this.shooterGame.bullets = this.add.group();
        this.shooterGame.bullets.enableBody = true;
        this.shooterGame.bullets.physicsBodyType = Phaser.Physics.ARCADE;
        this.shooterGame.bullets.createMultiple(20, 'bullet');

        this.shooterGame.bullets.setAll('anchor.x', 0.5);
        this.shooterGame.bullets.setAll('anchor.y', 0.5);
        this.shooterGame.bullets.setAll('scale.x', 0.5);
        this.shooterGame.bullets.setAll('scale.y', 0.5);
        this.shooterGame.bullets.setAll('outOfBoundsKill', true);
        this.shooterGame.bullets.setAll('checkWorldBounds', true);
    };

    private createVirtualJoystick() {
        this.shooterGame.gamepad = new Gamepads.GamePad(this.game, Gamepads.GamepadType.DOUBLE_STICK);
    };

    private setupCamera() {
        this.camera.follow(this.shooterGame.player);
    };

    private createPlayer() {
        this.shooterGame.player = this.add.sprite(this.world.centerX, this.world.centerY, 'player');
        this.shooterGame.player.anchor.setTo(0.5, 0.5);
        //this.player.scale.setTo(2, 2);
        this.shooterGame.player.health = this.shooterGame.LIVES;
        this.physics.enable(this.shooterGame.player, Phaser.Physics.ARCADE);

        this.shooterGame.player.body.maxVelocity.setTo(this.shooterGame.PLAYER_MAX_SPEED, this.shooterGame.PLAYER_MAX_SPEED); // x, y
        this.shooterGame.player.body.collideWorldBounds = true;
        this.shooterGame.player.body.drag.setTo(this.shooterGame.PLAYER_DRAG, this.shooterGame.PLAYER_DRAG); // x, y
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

        this.physics.arcade.collide(this.shooterGame.player, this.shooterGame.monsters, this.monsterTouchesPlayer, null, this);
        this.physics.arcade.collide(this.shooterGame.player, this.shooterGame.walls);
        this.physics.arcade.overlap(this.shooterGame.bullets, this.shooterGame.monsters, this.bulletHitMonster, null, this);
        this.physics.arcade.collide(this.shooterGame.bullets, this.shooterGame.walls, this.bulletHitWall, null, this);
        this.physics.arcade.collide(this.shooterGame.walls, this.shooterGame.monsters, this.resetMonster, null, this);
        this.physics.arcade.collide(this.shooterGame.monsters, this.shooterGame.monsters, this.resetMonster, null, this);
    }

    rotateWithRightStick() {
        var speed = this.shooterGame.gamepad.stick2.speed;

        if (Math.abs(speed.x) + Math.abs(speed.y) > 20) {
            var rotatePos = new Phaser.Point(this.shooterGame.player.x + speed.x, this.shooterGame.player.y + speed.y);
            this.shooterGame.player.rotation = this.physics.arcade.angleToXY(this.shooterGame.player, rotatePos.x, rotatePos.y);

            this.fire();
        }
    }

    fireWithRightStick() {
        //this.gamepad.stick2.
    }

    private monsterTouchesPlayer(player:Phaser.Sprite, monster:Phaser.Sprite) {
        monster.kill();

        player.damage(1);

        this.shooterGame.livesText.setText("Lives: " + this.shooterGame.player.health);

        this.blink(player);

        if (player.health == 0) {
            this.shooterGame.stateText.text = " GAME OVER \n Click to restart";
            this.shooterGame.stateText.visible = true;

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
            this.shooterGame.score += 10;
            this.shooterGame.scoreText.setText("Score: " + this.shooterGame.score);
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
        this.shooterGame.monsters.forEach(this.advanceStraightAhead, this)
    };

    // Metodo con el que hacemos avanzar los monstruos en dirección a su angulo
    private advanceStraightAhead(monster:Phaser.Sprite) {
        this.physics.arcade.velocityFromAngle(monster.angle, this.shooterGame.MONSTER_SPEED, monster.body.velocity);
    }

    // Función con la que disparamos al hacer clic
    private fireWhenButtonClicked() {
        if (this.input.activePointer.isDown) {
            this.fire();
        }
    };

    // Función con la que rotamos al jugador en dirección al puntero del ratón
    private rotatePlayerToPointer() {
        this.shooterGame.player.rotation = this.physics.arcade.angleToPointer(
            this.shooterGame.player,
            this.input.activePointer
        );
    };

    // Función para mover jugador
    private movePlayer() {
        // Controles de teclado
        var moveWithKeyboard = function () {
            if (this.shooterGame.cursors.left.isDown ||
                this.input.keyboard.isDown(Phaser.Keyboard.A)) {
                this.shooterGame.player.body.acceleration.x = -this.shooterGame.PLAYER_ACCELERATION;
            } else if (this.shooterGame.cursors.right.isDown ||
                this.input.keyboard.isDown(Phaser.Keyboard.D)) {
                this.shooterGame.player.body.acceleration.x = this.shooterGame.PLAYER_ACCELERATION;
            } else if (this.shooterGame.cursors.up.isDown ||
                this.shooterGame.input.keyboard.isDown(Phaser.Keyboard.W)) {
                this.shooterGame.player.body.acceleration.y = -this.shooterGame.PLAYER_ACCELERATION;
            } else if (this.shooterGame.cursors.down.isDown ||
                this.input.keyboard.isDown(Phaser.Keyboard.S)) {
                this.shooterGame.player.body.acceleration.y = this.shooterGame.PLAYER_ACCELERATION;
            } else {
                this.shooterGame.player.body.acceleration.x = 0;
                this.shooterGame.player.body.acceleration.y = 0;
            }
        };

        // Controles con joystick
        var moveWithVirtualJoystick = function () {
            if (this.shooterGame.gamepad.stick1.cursors.left) {
                this.shooterGame.player.body.acceleration.x = -this.shooterGame.PLAYER_ACCELERATION;}
            if (this.shooterGame.gamepad.stick1.cursors.right) {
                this.shooterGame.player.body.acceleration.x = this.shooterGame.PLAYER_ACCELERATION;
            } else if (this.shooterGame.gamepad.stick1.cursors.up) {
                this.shooterGame.player.body.acceleration.y = -this.shooterGame.PLAYER_ACCELERATION;
            } else if (this.shooterGame.gamepad.stick1.cursors.down) {
                this.shooterGame.player.body.acceleration.y = this.shooterGame.PLAYER_ACCELERATION;
            } else {
                this.shooterGame.player.body.acceleration.x = 0;
                this.shooterGame.player.body.acceleration.y = 0;
            }
        };

        // Comprobamos si la plataforma en la que se ejecuta el juego es escritorio o movil
        if (this.shooterGame.device.desktop) {
            moveWithKeyboard.call(this);
        } else {
            moveWithVirtualJoystick.call(this);
        }
    };

    // Función para disparar
    fire():void {

        // Usamos un if para respetar la cadencia de disparo
        if (this.time.now > this.shooterGame.nextFire) {

            // Sacamos el primer sprite muerto del group
            var bullet = this.shooterGame.bullets.getFirstDead();

            if (bullet) {

                // Colocamos la bala en su posición y angulo
                var length = this.shooterGame.player.width * 0.5 + 20;
                var x = this.shooterGame.player.x + (Math.cos(this.shooterGame.player.rotation) * length);
                var y = this.shooterGame.player.y + (Math.sin(this.shooterGame.player.rotation) * length);

                // Damos los valores a las balas, a las explosiones y el angulo
                bullet.reset(x, y);
                this.explosion(x, y);
                bullet.angle = this.shooterGame.player.angle;

                // Le damos bien la velocidad en relación al angulo para que la bala apunte bien
                var velocity = this.physics.arcade.velocityFromRotation(bullet.rotation, this.shooterGame.BULLET_SPEED);
                bullet.body.velocity.setTo(velocity.x, velocity.y);

                // Ajustamos la variable auxiliar nextFire usando la cadencia de fuego para saber cada cuando se puede disaprar
                this.shooterGame.nextFire = this.time.now + this.shooterGame.FIRE_RATE;
            }
        }
    }

    explosion(x:number, y:number):void {

        // Sacamos el primer sprite muerto del group
        var explosion:Phaser.Sprite = this.shooterGame.explosions.getFirstDead();

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

window.onload = () => {
    var game = new ShooterGame();
};