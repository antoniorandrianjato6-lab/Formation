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
let gameScene; // Pour référencer la scène

const game = new Phaser.Game(config);

function preload() {
}

function create() {
    gameScene = this; // Stocke la référence à la scène actuelle
    
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
        backgroundColor: '#000000'
    }).setScrollFactor(0);

    // Texte du score 
    scoreText = this.add.text(10, 40, 'Objets collectés: 0', {
        font: '20px Arial',
        fill: '#ffff00'
    }).setScrollFactor(0);
}

function update() {
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

// Fonction pour positionner l'objet de manière aléatoire
function randomizeObjectPosition() {
    // Génère des coordonnées aléatoires dans les limites du jeu
    const margin = 100; // Marge pour éviter les bords
    const x = Phaser.Math.Between(50, config.width - margin);
    const y = Phaser.Math.Between(50, config.height - margin);
    
    // Définit la nouvelle position de l'objet
    this.object.setPosition(x, y);

    // Réinitialise la taille de l'objet
    this.object.setScale(1);
}

// Fonction appelée lors de la collecte de l'objet
function collectObject(carre, object) {
    // Incrémente le score
    score += 1;

    // Met à jour l'affichage du score dans le jeu
    scoreText.setText('Objets collectés: ' + score);

    // Change la position de l'objet aléatoirement
    randomizeObjectPosition.call(this); // Appel avec le bon contexte
}