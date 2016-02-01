var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });

var score = 0;
var scoreText;
    
var life;
var lifeText;
    
var timer, timerEvent, timerText;
var time = 0;
    
var timeEnemyTouches = -1;
var playerRenderInOut = -1; //Render in and out player for one second when enemy touches
var diamondOut = -1;
var firstaidOut = -1;
    
var enemyToLeft = 1;
    
var diedText, timeoutText;

var numberOfStars = 12;
var collectedStars = 0;

var showMainMenu = 1;

var levelLife, levelDiamondOut, levelFirstAidOut, levelEnemyDamage, levelEnemySpeed;

function startGame() {
    showMainMenu = 0;
    
    if (this.startButton != null && this.startButton != undefined)
        this.startButton.kill();
    
    if (this.startMenuSky != null && this.startMenuSky != undefined)
        this.startMenuSky
    
    if (this.startMenuText != null && this.startMenuText != undefined)
        this.startMenuText
    
    game.state.start(game.state.current);
}

function restartGame() {
    showMainMenu = 0;
    die.stop();
    game.state.start(game.state.current);
}

function startGameEasy() {
    
    levelLife = 100;
    levelDiamondOut = 15; 
    levelFirstAidOut = 15; 
    levelEnemyDamage = 10; 
    levelEnemySpeed = 200;
    
    startGame();
}
function startGameMedium() {
    
    levelLife = 75;
    levelDiamondOut = 20; 
    levelFirstAidOut = 20; 
    levelEnemyDamage = 20; 
    levelEnemySpeed = 250;
    
    startGame();
}
function startGameHard() {
    
    levelLife = 50;
    levelDiamondOut = 30; 
    levelFirstAidOut = 30; 
    levelEnemyDamage = 30; 
    levelEnemySpeed = 300;
    
    startGame();
}

function preload() {
    
    game.load.image('sky', 'assets/sky.png');
    game.load.image('ground', 'assets/platform.png');
    game.load.image('star', 'assets/star.png');
    game.load.image('diamond', 'assets/diamond.png');
    game.load.image('firstaid', 'assets/firstaid.png');
    game.load.spritesheet('dude', 'assets/dude.png', 32, 48);
    game.load.spritesheet('enemy', 'assets/baddie.png', 32, 32);
    game.load.spritesheet('button-start', 'assets/buttonstart_sprite.png', 201, 73);
    game.load.spritesheet('button-restart', 'assets/buttonrestart_sprite.png', 201, 73);
    game.load.spritesheet('button-easy', 'assets/btnEasy_sprite.png', 201, 73);
    game.load.spritesheet('button-medium', 'assets/btnMedium_sprite.png', 201, 73);
    game.load.spritesheet('button-hard', 'assets/btnHard_sprite.png', 201, 73);
    
    game.load.audio('jump', ['sounds/smb_jump-small.wav', 'sounds/smb_jump-small.ogg']);
    game.load.audio('coin', ['sounds/smb_coin.wav', 'sounds/smb_coin.ogg']);
    game.load.audio('looseLife', ['sounds/smb_breakblock.wav', 'sounds/smb_breakblock.ogg']);
    game.load.audio('die', ['sounds/smb_mariodie.wav', 'sounds/smb_mariodie.ogg']);
    game.load.audio('life', ['sounds/smb_powerup.wav', 'sounds/smb_powerup.ogg']);
}

function create() {
    
    //CSS styles
    this._mainMenu =  {
        font:'28px Arial',
        fill: '#1b5c77'
    };
    this._instructions =  {
        font:'28px Arial',
        fill: '#a8dded'
    };
    this._timeOut =  {
        font:'30px Arial',
        fill: '#0d315e'
    };
    
    //Initializing vars
    score = 0;
    life = levelLife;
    time = 0;
    timeEnemyTouches = -1;
    playerRenderInOut = -1;
    diamondOut = -1;
    firstaidOut = -1;
    //enemyToLeft = 1;
    collectedStars = 0;
                
    //  We're going to be using physics, so enable the Arcade Physics system
    game.physics.startSystem(Phaser.Physics.ARCADE);

    //  A simple background for our game
    game.add.sprite(0, 0, 'sky');

    //  The platforms group contains the ground and the 2 ledges we can jump on
    platforms = game.add.group();

    //  We will enable physics for any object that is created in this group
    platforms.enableBody = true;

    // Here we create the ground.
    var ground = platforms.create(0, game.world.height - 80, 'ground');

    //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
    ground.scale.setTo(2, 2.5);

    //  This stops it from falling away when you jump on it
    ground.body.immovable = true;

    //  Now let's create two ledges
    var ledge = platforms.create(400, 370, 'ground');

    ledge.body.immovable = true;

    ledge = platforms.create(-180, 220, 'ground');

    ledge.body.immovable = true;

    // The player and its settings
    player = game.add.sprite(32, game.world.height - 150, 'dude');

    //  We need to enable physics on the player
    game.physics.arcade.enable(player);

    //  Player physics properties. Give the little guy a slight bounce.
    player.body.bounce.y = 0.2;
    player.body.gravity.y = 300;
    player.body.collideWorldBounds = true;

    //  Our two animations, walking left and right.
    player.animations.add('left', [0, 1, 2, 3], 10, true);
    player.animations.add('right', [5, 6, 7, 8], 10, true); 
    player.animations.add('enemyTouches', [4, 9], 10, true); 

    // The enemy and its settings
    enemy = game.add.sprite(600, game.world.height - 280, 'enemy');

    //  We need to enable physics on the enemy
    game.physics.arcade.enable(enemy);

    //  enemy physics properties. Give a slight bounce.
    enemy.body.bounce.y = 0.2;
    enemy.body.gravity.y = 400;
    enemy.body.collideWorldBounds = true;

    //  Our two animations, walking left and right.
    enemy.animations.add('left', [0, 1], 10, true);
    enemy.animations.add('right', [2, 3], 10, true);     
    enemy.enableBody = true;

    //Stars
    stars = game.add.group();
    stars.enableBody = true;

    //  Here we'll create 12 of them evenly spaced apart
    for (var i = 0; i < numberOfStars; i++)
    {
        collectedStars = 0;
        //  Create a star inside of the 'stars' group
        var star = stars.create(i * 70, 0, 'star');

        //  Let gravity do its thing
        star.body.gravity.y = 200;

        //  This just gives each star a slightly random bounce value
        star.body.bounce.y = 0.3 + Math.random() * 0.2;
    }

    //Diamonds
    diamonds = game.add.group();
    diamonds.enableBody = true;  

    //First aid
    firstaids = game.add.group();
    firstaids.enableBody = true;

    // Create a custom timer
    timer = game.time.create();

    // Create a delayed event 1m and 30s from now
    timerEvent = timer.add(Phaser.Timer.MINUTE * 1 + Phaser.Timer.SECOND * 30, this.endTimer, this);

    // Start the timer
    timer.start();

    scoreText = game.add.text(16, 16, 'Score: ' + score, { fontSize: '32px', fill: '#000' });
    lifeText = game.add.text(680, 16, 'Life: ' + life, { fontSize: '32px', fill: '#000' });
    timerText = game.add.text(340, 16, 'Time: ' + time, { fontSize: '32px', fill: '#000' });    

    //Instructions text, and restart button, on the floor
    game.add.text(16, game.world.height - 32, 'Left/Right arrows to move. Up arrow to jump.', this._instructions);    
    this.restartButton = game.add.button(game.world.width - 201, game.world.height - 73,'button-restart', 
                                        restartGame, this, 1, 0, 2);      

    jump = game.add.audio('jump');
    coin = game.add.audio('coin');
    looseLife = game.add.audio('looseLife');
    die = game.add.audio('die');
    die.onStop.add(dieSoundStopped, this);
    lifeSound = game.add.audio('life');
        
    //Paint in top another sky, explain text and start button 
    if (showMainMenu == 1){
        
        //  A simple background for our game
        this.startMenuSky = game.add.sprite(0, 0, 'sky');
        
        this.startMenuText = this.game.add.text(80,110, 'Pick up all the stars and diamonds you can on time!!\n'
                           + 'Also try to keep your life on the maximum level.\nIt will give you some extra points.\n', this._mainMenu);    
        this.levelMenuText = this.game.add.text((game.world.width / 2) - 120,320, 'Select difficulty level: ', this._mainMenu);  
        
        //this.startButton = game.add.button((game.world.width / 2) - 100, (game.world.height / 2) - 35,'button-start', 
        //                                    startGame, this, 1, 0, 2);
        this.easyLevelBtn = game.add.button((game.world.width / 2) - 350, (game.world.height / 2) + 80,'button-easy', 
                                            startGameEasy, this, 1, 0, 2);
        this.mediumLevelBtn = game.add.button((game.world.width / 2) - 100, (game.world.height / 2) + 80,'button-medium', 
                                            startGameMedium, this, 1, 0, 2);
        this.hardlevelBtn = game.add.button((game.world.width / 2) + 150, (game.world.height / 2) + 80,'button-hard', 
                                            startGameHard, this, 1, 0, 2);
    }
}

function update() {
    
    if (showMainMenu != 1){     
        
        //  Collide the player and the stars with the platforms
        game.physics.arcade.collide(player, platforms);
        game.physics.arcade.collide(stars, platforms);
        game.physics.arcade.collide(enemy, platforms);
        game.physics.arcade.collide(diamonds, platforms);
        game.physics.arcade.collide(firstaids, platforms);

        //Overlap detect between player and items, player and enemy
        game.physics.arcade.overlap(player, stars, collectStar, null, this);
        game.physics.arcade.overlap(player, enemy, enemyTouches, null, this);
        game.physics.arcade.overlap(player, diamonds, collectDiamond, null, this);
        game.physics.arcade.overlap(player, firstaids, collectFirstAid, null, this);

        cursors = game.input.keyboard.createCursorKeys();
        //  Reset the players velocity (movement)
        player.body.velocity.x = 0;

        if (timer.running) {
                time = (Math.round((timerEvent.delay - timer.ms) / 1000));
                timerText.text = "Time: " + time;
        }

        //Time out
        if (time <= 0){
            if (life > 0)
                timeoutText = game.add.text(280, 210, 'Time Out!! Your score is ' + score + '.\n'
                                            + 'Your life is ' + life + '.\n'
                                            + 'Your final score is: ' + (score + (life * 2)) + ' points.'
                                            , this._timeOut);

            timer.stop();
            player.kill();
            enemy.kill();
        }
        else {

            if (playerRenderInOut == -1) {
                if (cursors.left.isDown)
                {
                    //  Move to the left
                    player.body.velocity.x = -150;
                    player.animations.play('left');
                }
                else if (cursors.right.isDown)
                {
                    //  Move to the right
                    player.body.velocity.x = 150;
                    player.animations.play('right');
                }
                else
                {
                    //  Stand still
                    player.animations.stop();
                    player.frame = 4;
                }
                
                //  Allow the player to jump if they are touching the ground.
                if (cursors.up.isDown && player.body.touching.down)
                {
                    player.body.velocity.y = -350;
                    jump.play();
                }   
            }
            
            //Enemy position, top of the game world widht, change direction
            if (enemy.body.position.x == game.world.width - 32)
            {
                enemyToLeft = 1;
            }
            else if (enemy.body.position.x == 0) {
                enemyToLeft = 0;
            }

            //Enemy movement, depending direction set before
            if (enemyToLeft == 1)
            {
                //  Move to the left
                enemy.body.velocity.x = -1 * levelEnemySpeed;
                enemy.animations.play('left');
            }
            else 
            {
                //  Move to the right
                enemy.body.velocity.x = levelEnemySpeed;
                enemy.animations.play('right');
            }     

            //Every 4 seconds, enemy jumps
            if (time < 90 && time % 4 == 0 && enemy.body.touching.down)
            {
                enemy.body.velocity.y = -400;
            }

            //2 seconds between one enemy collides and the next to detect, allow the player to go away
            if (time == timeEnemyTouches - 2.0){
                timeEnemyTouches = -1;
            }
            else if (time == timeEnemyTouches - 1.0){ //Render in and out player for one second when enemy touches
                playerRenderInOut = -1;
            } 
        }

        //If all stars on the screen are recollected, generate more again
        if (collectedStars == numberOfStars) {

            //  Here we'll create 12 of them evenly spaced apart
            for (var i = 0; i < numberOfStars; i++)
            {
                collectedStars = 0;
                //  Create a star inside of the 'stars' group
                var star = stars.create(i * 70, 0, 'star');

                //  Let gravity do its thing
                star.body.gravity.y = 200;

                //  This just gives each star a slightly random bounce value
                star.body.bounce.y = 0.3 + Math.random() * 0.2;
            }
        }    

        //Time to show diamonds, every levelDiamondOut seconds
        if (diamondOut == -1 && time < 90 && time > 0 && time % levelDiamondOut == 0){

            diamondOut = time; //Just one diamond on screen each time

            //  Create a star inside of the 'stars' group
            var diamond = diamonds.create(Math.random() * (game.world.width - 32), 0, 'diamond');

            //  Let gravity do its thing
            diamond.body.gravity.y = 70;

            //  This just gives each star a slightly random bounce value
            diamond.body.bounce.y = 0.5;
        }

        //Time to show fist aid, every leveFirstAidOut seconds
        if (firstaidOut == -1 && time < 90 && time % levelFirstAidOut == 10 && time > 0 && life < levelLife){

            firstaidOut = time; //Just one diamond on screen each time

            //  Create a star inside of the 'stars' group
            var firstaid = firstaids.create(Math.random() * (game.world.width - 32), 0, 'firstaid');

            //  Let gravity do its thing
            firstaid.body.gravity.y = 70;

            //  This just gives each star a slightly random bounce value
            firstaid.body.bounce.y = 0.1;
        }
    }
}

function collectStar (player, star) {

    // Removes the star from the screen
    star.kill();
    collectedStars++;
    
    //Play sound for collecting item
    coin.play();
    
    //  Add and update the score
    score += 10;
    scoreText.text = 'Score: ' + score;
}

function collectDiamond (player, diamond) {

    // Removes the star from the screen
    diamond.kill();
    diamondOut = -1;
    
    //Play sound for collecting item
    coin.play();
    
    //  Add and update the score
    score += 50;
    scoreText.text = 'Score: ' + score;
    time += 10;
    timerText.text = "Time: " + time;    
}
    
function collectFirstAid (player, firstaid) {

    // Removes the star from the screen
    firstaid.kill();
    firstaidOut = -1;
    
    //Play sound for collecting item
    lifeSound.play();
    
    life += 10;
    lifeText.text = 'Life: ' + life;
}    
    
function enemyTouches (player, enemy) {
        
    //  Add and update the life
    if (timeEnemyTouches == -1){
        
        //Play sound for loosing life
        looseLife.play();  
        life -= levelEnemyDamage;      
        
        if (life <= 0){
            
            life = 0;
            timeEnemyTouches = -1;
            playerRenderInOut = -1;
            player.kill();
            
            //Play sound for dead
            die.play();
            diedText = game.add.text(player.x - 30, player.y, 'YOU DIED!!', { fontSize: '32px', fill: '#F00' });              
        }
        else{
            
            timeEnemyTouches = time;
            playerRenderInOut = time;
            player.animations.stop();
            player.animations.play('enemyTouches');
        }
        
        lifeText.text = 'Life: ' + life;
    }
}
     
function dieSoundStopped(sound) {

    //Restart game    
    game.state.start(game.state.current);

}