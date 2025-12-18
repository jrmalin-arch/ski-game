const canvas = document.getElementById('skiCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

canvas.width = 400;
canvas.height = 600;

let score = 0;
let highScore = 0;
try {
    highScore = localStorage.getItem('skiHighScore') || 0;
} catch (e) {
    highScore = 0;
}

let gameActive = true;
let gameSpeed = 3;
let leanAngle = 0;

const baseSpawnRate = 0.03;
const maxSpawnRate = 0.12;
const difficultyScale = 5000;

const skier = {
    x: 200,
    y: 100,
    width: 14,
    height: 25,
    color: '#eb34e2' 
};

let trees = [];
let portals = [];
let particles = [];

const portalTypes = [
    { name: 'MALIN COFFEE HUT', url: 'https://coffee.jeremymalin.com', color: '#6F4E37' }
];

const keys = {};
window.addEventListener('keydown', e => keys[e.code] = true);
window.addEventListener('keyup', e => keys[e.code] = false);

window.addEventListener('touchstart', e => {
    if (gameActive) e.preventDefault();
    const touchX = e.touches[0].clientX;
    if (touchX < window.innerWidth / 2) {
        keys['ArrowLeft'] = true;
        keys['ArrowRight'] = false;
    } else {
        keys['ArrowRight'] = true;
        keys['ArrowLeft'] = false;
    }
}, { passive: false });

window.addEventListener('touchend', () => {
    keys['ArrowLeft'] = false;
    keys['ArrowRight'] = false;
    if (!gameActive) restartGame();
});

function createPowder() {
    if (gameActive) {
        // Spawn powder at the back of the skis
        particles.push({
            x: skier.x + skier.width / 2 + (Math.random() * 10 - 5),
            y: skier.y + skier.height,
            size: Math.random() * 5 + 2,
            opacity: 0.8
        });
    }
}

function spawnObjects() {
    let currentSpawnRate = Math.min(baseSpawnRate + (score / difficultyScale), maxSpawnRate);
    if (Math.random() < currentSpawnRate) { 
        trees.push({
            x: Math.random() * (canvas.width - 20),
            y: canvas.height,
            width: 20,
            height: 30
        });
    }
    if (Math.random() < 0.002) {
        const type = portalTypes[Math.floor(Math.random() * portalTypes.length)];
        portals.push({
            x: Math.random() * (canvas.width - 100),
            y: canvas.height, width: 100, height: 40, ...type
        });
    }
}

function update() {
    if (!gameActive) return;

    if (keys['ArrowLeft'] && skier.x > 5) {
        skier.x -= 5;
        leanAngle = -0.2;
        createPowder();
    } else if (keys['ArrowRight'] && skier.x < canvas.width - skier.width - 5) {
        skier.x += 5;
        leanAngle = 0.2;
        createPowder();
    } else {
        leanAngle = 0;
    }

    if (Math.random() > 0.4) createPowder();

    // Update particles
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].y -= gameSpeed;
        particles[i].opacity -= 0.015;
        if (particles[i].opacity <= 0) {
            particles.splice(i, 1);
        }
    }

    for (let i = trees.length - 1; i >= 0; i--) {
        trees[i].y -= gameSpeed;
        if (checkCollision(skier, trees[i])) handleGameOver();
        if (trees[i].y + trees[i].height < 0) {
            trees.splice(i, 1);
            score += 10;
            gameSpeed += 0.005;
            scoreElement.innerText = score;
        }
    }

    for (let i = portals.length - 1; i >= 0; i--) {
        portals[i].y -= gameSpeed;
        if (checkCollision(skier, portals[i])) {
            top.location.href = portals[i].url;
            return;
        }
        if (portals[i].y + portals[i].height < 0) portals.splice(i, 1);
    }

    spawnObjects();
}

function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Draw Powder Trail (White circles on grey background)
    particles.forEach(p => {
        ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    });

    // 2. Draw Portals
    portals.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.width, p.height);
        // Hut Roof
        ctx.fillStyle = '#4a3223';
        ctx.beginPath();
        ctx.moveTo(p.x - 5, p.y);
        ctx.lineTo(p.x + p.width/2, p.y - 15);
        ctx.lineTo(p.x + p.width + 5, p.y);
        ctx.fill();
        
        ctx.fillStyle = 'white';
        ctx.font = 'bold 9px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(p.name, p.x + p.width/2, p.y + p.height/2 + 5);
    });

    // 3. Draw Trees
    trees.forEach(tree => {
        // Trunk
        ctx.fillStyle = '#4a3223';
        ctx.fillRect(tree.x + tree.width/2 - 2, tree.y + tree.height - 5, 4, 8);
        // Leaves
        ctx.fillStyle = '#2d5a27';
        ctx.beginPath();
        ctx.moveTo(tree.x + tree.width / 2, tree.y);
        ctx.lineTo(tree.x, tree.y + tree.height - 5);
        ctx.lineTo(tree.x + tree.width, tree.y + tree.height - 5);
        ctx.fill();
    });

    // 4. Draw Skier
    ctx.save(); 
    ctx.translate(skier.x + skier.width / 2, skier.y + skier.height / 2);
    ctx.rotate(leanAngle);
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-skier.width/2, -skier.height/2); ctx.lineTo(-skier.width/2, skier.height/2 + 8); 
    ctx.moveTo(skier.width/2, -skier.height/2); ctx.lineTo(skier.width/2, skier.height/2 + 8); 
    ctx.stroke();
    ctx.fillStyle = skier.color;
    ctx.fillRect(-skier.width/2 + 1, -skier.height/2 + 4, skier.width - 2, skier.height - 4);
    ctx.fillStyle = '#ffdbac';
    ctx.beginPath();
    ctx.arc(0, -skier.height/2 + 2, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#333';
    ctx.fillRect(-4, -skier.height/2 - 2, 8, 3);
    ctx.restore(); 

    // 5. UI
    ctx.fillStyle = '#333';
    ctx.font = '14px Arial';
    ctx.textAlign = 'right';
    ctx.fillText(`Best: ${highScore}`, canvas.width - 10, 25);

    if (gameActive) {
        requestAnimationFrame(() => {
            update();
            draw();
        });
    }
}

function handleGameOver() {
    gameActive = false;
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('skiHighScore', highScore);
    }
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.font = '24px Arial';
    ctx.fillText("WIPEOUT!", canvas.width/2, canvas.height/2 - 20);
    ctx.font = '18px Arial';
    ctx.fillText(`Score: ${score}`, canvas.width/2, canvas.height/2 + 20);
    ctx.fillText(`Best: ${highScore}`, canvas.width/2, canvas.height/2 + 50);
    ctx.font = '14px Arial';
    ctx.fillText("Press 'R' or Tap to Restart", canvas.width/2, canvas.height/2 + 100);
}

function restartGame() {
    score = 0; trees = []; portals = []; particles = []; gameSpeed = 3; gameActive = true;
    scoreElement.innerText = score;
    draw();
}

window.addEventListener('keydown', e => {
    if (e.code === 'KeyR' && !gameActive) restartGame();
});

draw();