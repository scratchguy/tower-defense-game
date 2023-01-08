const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');
//c = ctx or context but shorter (above)
canvas.width = 1280;
canvas.height = 768;

c.fillStyle = 'white';
c.fillRect(0, 0, canvas.width, canvas.height);

//console.log(placementTilesData);
const placementTilesData2D = [];

for (let i = 0; i < placementTilesData.length; i += 20) {
    placementTilesData2D.push(placementTilesData.slice(i, i + 20));
}

const placementTiles = [];

placementTilesData2D.forEach((row, y) => {
    row.forEach((symbol, x) => {
        if (symbol === 14) {
            placementTiles.push(new PlacementTile({
            position: {
                x: x * 64,
                y: y * 64
            }
        }));
        }
    });
});

//console.log(placementTiles);

const image = new Image();

image.onload = () => {
    animate();
}
image.src = 'gameMap.png';

const enemies = [];

function spawnEnemies(spawnCount) {
    for (let i = 1; i < spawnCount + 1; i++) {
        const xOffset = i * 150;
        enemies.push(new Enemy({
            position: { x: waypoints[0].x - xOffset, y: waypoints[0].y }
        }));
        //console.log(waypoints[0].x - xOffset);
    }
}

const buildings = [];
let activeTile = undefined;
let enemyCount = 3;
let hearts = 10;
let coins = 100;
const explosions = [];
spawnEnemies(enemyCount);

function changeScore() {

}
function animate() {
    const animationId = requestAnimationFrame(animate);
    /*
    timedLoop(1000, function() {
        coins++;
        document.querySelector('#coins').innerHTML = coins;
    });
    */
   
    /*
        setInterval(function() {
            console.log("WOW");
            clearInterval();
           }, 1000);
           */
           setTimeout(function() {
            // console.log("1000 milliseconds have elapsed");
            coins++;
        document.querySelector('#coins').innerHTML = "🪙" + coins;
          }, 1000);
       
    

    c.drawImage(image, 0, 0);

    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        enemy.update();
        if (enemy.position.x > canvas.width) {
            hearts -= 1;
            enemies.splice(i, 1);
            document.querySelector('#hearts').innerHTML = hearts;

            if (hearts === 0) {
                console.log('Game Over!');
                cancelAnimationFrame(animationId);
                document.querySelector('#gameOver').style.display = 'flex';
            }
        }
    }

    for (let i = explosions.length - 1; i >= 0; i--) {
        const explosion = explosions[i]
        explosion.draw();
        explosion.update();

        //console.log(explosion.frames.current);
        if (explosion.frames.current >= explosion.frames.max - 1) {
            explosions.splice(i, 1);
        }
        //console.log(explosions);
    }

    if (enemies.length === 0) {
        enemyCount += 2;
        spawnEnemies(enemyCount);
    }
    
    placementTiles.forEach((tile) => {
        tile.update(mouse);
    });
    buildings.forEach((building) => {
        building.update();
        building.target = null;
        const validEnemies = enemies.filter(enemy => {
            const xDifference = enemy.center.x - building.center.x;
            const yDifference = enemy.center.y - building.center.y;
            const distance = Math.hypot(xDifference, yDifference);
            return distance < enemy.radius + building.radius;
        });
        building.target = validEnemies[0]

        for (let i = building.projectiles.length - 1; i >= 0; i--) {
            const projectile = building.projectiles[i]
        
            projectile.update();

            const xDifference = projectile.enemy.center.x - projectile.position.x;
            const yDifference = projectile.enemy.center.y - projectile.position.y;
            //console.log(xDifference);
            const distance = Math.hypot(xDifference, yDifference);

            if (distance < projectile.enemy.radius + projectile.radius) {
                projectile.enemy.health -= 20;
                if (projectile.enemy.health <= 0) {
                    const enemyIndex = enemies.findIndex((enemy) => {
                        return projectile.enemy === enemy
                    });

                    if (enemyIndex > -1) {
                        enemies.splice(enemyIndex, 1);
                        coins += 75;
                        document.querySelector('#coins').innerHTML = coins;
                    }
                }

                //console.log(projectile.enemy.health);
                explosions.push(new Sprite({position: {x: projectile.position.x, y: projectile.position.y}, imageSrc: 'explosion.png', frames: {max: 4}, offset: {x: 0, y: 0}}));
                building.projectiles.splice(i, 1);
            }
        }
    });
}

const mouse = {
    x: undefined,
    y: undefined
}

canvas.addEventListener('click', (event) => {
    if (activeTile && !activeTile.isOccupied && coins - 100 >= 0) {
        coins -= 100;
        buildings.push(new Building({
            position: {
                x: activeTile.position.x,
                y: activeTile.position.y
            }
        }));
        activeTile.isOccupied = true;
        buildings.sort((a, b) => {
            return a.position.y - b.position.y;
        });
    }
    //console.log(buildings);
});

window.addEventListener('mousemove', (event) => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;

    activeTile = null;
    for(let i = 0; i < placementTiles.length; i++) {
        const tile = placementTiles[i];
        if (mouse.x > tile.position.x && mouse.x < tile.position.x + tile.size && mouse.y > tile.position.y && mouse.y < tile.position.y + tile.size) {
            activeTile = tile;
        break;
        }
    }
});
