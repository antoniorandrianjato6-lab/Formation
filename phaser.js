const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600, 
    parent: 'game-container',
    backgroundColor: '#21223a',
    scene: {
        preload: preload, 
        create: create, 
        update: update
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    }
};

// Variables globales
let score = 0;
let scoreText;
let timerText;
let gameScene; // Pour référencer la scène
let timeEdvent; // Evenement du timer
let gameActive = true; // Etat du jeu

const game = new Phaser.Game(config);

function preload() {
}

function create() {
    gameScene = this; // Stocke la référence à la scène actuelle

    gameActive = true;
    score = 0;
    
    // Création du carré (UNE SEULE FOIS)
    this.carre = this.add.rectangle(200, 300, 20, 20, 0x00ff00);
    this.physics.add.existing(this.carre);
    this.carre.body.setCollideWorldBounds(true);
    this.carre.body.setBounce(0.2);
        
    // Creation de l'objet à collecter
    this.object = this.add.circle(0, 0, 25, 0xff0000);
    this.physics.add.existing(this.object);
    
    // Positionnement aléatoire de l'objet
    randomizeObjectPosition.call(this); // Appel avec le bon contexte
    
    // Contrôles clavier
    this.cursors = this.input.keyboard.createCursorKeys();

    // Collision entre le carré et l'objet
    this.physics.add.overlap(this.carre, this.object, collectObject, null, this);

    // Texte d'instructions
    this.add.text(10, 10, 'Utilisez les flèches du clavier pour déplacer le carré.', { 
        font: '16px Arial', 
        fill: '#00ff22',
        backgroundColor: '#000000',
        padding: { x: 8, y: 4}
    }).setScrollFactor(0);

    // Texte du score 
    scoreText = this.add.text(10, 40, 'Score: 0', {
        font: '20px Arial',
        fill: '#ffff00'
    }).setScrollFactor(0);

    // UI du timer
    timerText = this.add.text(700, 40, '60', {
        font: '20px Arial',
        fill: '#ff3333',
        align: 'right'
    }).setOrigin(1, 0).setScrollFactor(0);

    // Timer de 60 secondes
    timeEdvent = this.time.addEvent({
        delay: 1000, 
        callback: updateTimer,
        callbackScope: this,
        loop: true
    });

    // Initialisation du timer
    this.remainingTime = 60;
    updateTimer.call(this);
}

function update() {
    if (!gameActive) return; // Si le jeu est terminé, ne rien faire

    // Réinitialisation de la vélocité
    this.carre.body.setVelocity(0);
    
    // Déplacement avec les touches
    if (this.cursors.left.isDown) {
        this.carre.body.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
        this.carre.body.setVelocityX(200);
    }
    if (this.cursors.up.isDown) {
        this.carre.body.setVelocityY(-200);
    } else if (this.cursors.down.isDown) {
        this.carre.body.setVelocityY(200);
    }
}

function updateTimer() {
    this.remainingTime -= 1;
    
    updateTimerText.call(this);

    if (this.remainingTime <= 0) {
        gameOver.call(this);
    }
}

function updateTimerText() {
    timerText.setText(this.remainingTime);
    // Effet clignotant si < 10 secondes
    if (this.remainingTime <= 10) {
        timerText.setTint(0xff0000);
        timerText.setScale(this.remainingTime % 2 === 0 ? 1.1 : 1);
    } else {
        timerText.setTint(0xff3333);
        timerText.setScale(1);
    }
}

// Fonction game over
function gameOver() {
    gameActive = false; // Met fin au jeu
    if (timeEdvent) timeEdvent.remove(); // Arrete proprement le timer

    // Message de game Over
    this.add.rectangle(config.width / 2, config.height / 2, 400, 200, 0x000000, 0.8).setOrigin(0.5);
    this.add.text(config.width / 2, config.height / 2 - 60, 'GAME OVER', {
        font: '48px Arial',
        fill: '#ff0000',
        stroke: '#000',
        strokeThickness: 6
    }).setOrigin(0.5);

    this.add.text(config.width / 2, config.height / 2, 'Score final: ' + score, {
        font: '32px Arial',
        fill: '#ffff00',
    }).setOrigin(0.5);

    this.add.text(config.width / 2, config.height / 2 + 60, 'Appuyez sur R pour rejouer', {
        font: '20px Arial',
        fill: '#ffffff',
    }).setOrigin(0.5);

    // Rejouer avec R
    this.input.keyboard.once('keydown-R', () => {
        this.scene.restart();
    });
}

// Fonction pour positionner l'objet de manière aléatoire
function randomizeObjectPosition() {
    // Génère des coordonnées aléatoires dans les limites du jeu
    const margin = 80; // Marge pour éviter les bords
    const x = Phaser.Math.Between(margin, config.width - margin);
    const y = Phaser.Math.Between(margin, config.height - margin);
    
    // Définit la nouvelle position de l'objet
    this.object.setPosition(x, y);

    // Réinitialise la taille de l'objet
    this.object.setScale(1);
}

// Fonction appelée lors de la collecte de l'objet
function collectObject(carre, object) {
    if (!gameActive) return; // Si le jeu est terminé, ne rien faire
    // Incrémente le score
    score += 1;

    // Met à jour l'affichage du score dans le jeu
    scoreText.setText('Score: ' + score);

    // Change la position de l'objet aléatoirement
    randomizeObjectPosition.call(this); // Appel avec le bon contexte
}