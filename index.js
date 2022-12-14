const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');


canvas.width = 1024;
canvas.height = 576;

const collisionsMap = [];
for (let i = 0; i < collisions.length; i+=70) {
    collisionsMap.push(collisions.slice(i, 70 + i ));
}

const battleZonesMap = [];
for (let i = 0; i < battleZonesData.length; i+=70) {
    battleZonesMap.push(battleZonesData.slice(i, 70 + i ));
}

console.log(battleZonesMap);


const boundaries = [];

const offset = {
    x : -735,
    y : -650
}

collisionsMap.forEach((row, i) => {
    row.forEach((symbol, j) => {
        if(symbol === 1025) {
            boundaries.push(new Boundary({position : {
                x : j * Boundary.width + offset.x,
                y : i * Boundary.height + offset.y,
            }}))
        }
    })
})

const battleZones = []

battleZonesMap.forEach((row, i) => {
    row.forEach((symbol, j) => {
        if(symbol === 1025) {
            battleZones.push(new Boundary({position : {
                x : j * Boundary.width + offset.x,
                y : i * Boundary.height + offset.y,
            }}))
        }
    })
})

console.log(battleZones)

//c.fillStyle = 'white';
//c.fillRect(0,0,canvas.width, canvas.height);

// 이미지 onload
let image = new Image();
image.src = './img/PelletTown.png'

let foregroundImage = new Image();
foregroundImage.src = './img/foregroundObjects.png';

let playerDownImage = new Image();
playerDownImage.src = './img/playerDown.png';

let playerUpImage = new Image();
playerUpImage.src = './img/playerUp.png';

let playerLeftImage = new Image();
playerLeftImage.src = './img/playerLeft.png';

let playerRightImage = new Image();
playerRightImage.src = './img/playerRight.png';


const player = new Sprite({
    position : {
        x : canvas.width / 2 - 192 / 4 / 2,
        y : canvas.height / 2 - 68 / 2,
    },
    image : playerDownImage,
    frames : {
        max : 4,
        hold : 10
    },
    sprites : {
        up : playerUpImage,
        left : playerLeftImage,
        right : playerRightImage,
        down : playerDownImage,
    },
    animate : false
})


const background = new Sprite({ 
    position : {
        x : offset.x,
        y : offset.y
    },
    image : image
})

const foreground = new Sprite({ 
    position : {
        x : offset.x,
        y : offset.y
    },
    image : foregroundImage
})

const keys = {
    up : {
        pressed : false
    },
    left : {
        pressed : false
    },
    right : {
        pressed : false
    },
    down : {
        pressed : false
    }
}

// const testBoundary = new Boundary({
//     position : {
//         x : 400,
//         y : 400
//     }
// })

const movables = [background, ...boundaries, foreground, ...battleZones];

function rectangularCollision({rectangle1, rectangle2}) {
    return (
        rectangle1.position.x + rectangle1.width >= rectangle2.position.x && 
        rectangle1.position.x <= rectangle2.position.x + rectangle2.width &&
        rectangle1.position.y <= rectangle2.position.y + rectangle2.height &&
        rectangle1.position.y + rectangle1.height >= rectangle2.position.y  
    )
}

const battle = {
    initiated : false
}

function animate() {
    const animationId = window.requestAnimationFrame(animate);
    background.draw();
    boundaries.forEach(boundary => {
        boundary.draw();
    })

    battleZones.forEach((battleZone) => {
        battleZone.draw();
    })
    player.draw();
    foreground.draw();

    let moving = true;
    player.animate = false;
    
    console.log(animationId)
    if(battle.initiated) return;

    // activate a battle
    if(keys.up.pressed || keys.left.pressed  || keys.right.pressed  || keys.down.pressed ){
        for(let i =0; i < battleZones.length; i++) {
            const battleZone = battleZones[i];
            const overlappingArea =
                (Math.min(
                player.position.x + player.width,
                battleZone.position.x + battleZone.width
                ) -
                Math.max(player.position.x, battleZone.position.x)) *
                (Math.min(
                player.position.y + player.height,
                battleZone.position.y + battleZone.height
                ) -
                Math.max(player.position.y, battleZone.position.y))
            if(rectangularCollision({
                rectangle1 : player,
                rectangle2 : battleZone
            }) && 
            overlappingArea > (player.width * player.height) / 2 && 
            Math.random() < 0.03
            ) {
                console.log('activate battle');

                // deactivate current animation loop
                window.cancelAnimationFrame(animationId);

                battleZone.initiated = true;
                gsap.to('#overlappingDiv', {
                    opacity : 1,
                    repeat : 3,
                    yoyo: true,
                    duration : 0.4,
                    onComplete() {
                        gsap.to('#overlappingDiv',{
                            opacity : 1,
                            duration : 0.4,
                            onComplete() {
                                // activate a new animation loop
                                animateBattle();
                                gsap.to('#overlappingDiv',{
                                    opacity : 0,
                                    duration : 0.4,
                                })
                            }
                        })
                    }
                });
                break;
            }
        }
    }

    if(keys.up.pressed && lastKey === 'up') { 
        player.animate = true;
        player.image = player.sprites.up;
        for(let i =0; i < boundaries.length; i++) {
            const boundary = boundaries[i];
            if(rectangularCollision({
                rectangle1 : player,
                rectangle2 : {...boundary, position : {
                    x : boundary.position.x,
                    y : boundary.position.y + 5
                }}
            }) 
            ) {
                moving = false;
                break;
            }
        }

        if(moving){
            movables.forEach((movable) => {
                movable.position.y += 5;
            })
        }
        
    }
    else if(keys.left.pressed && lastKey === 'left') { 
        player.animate = true;
        player.image = player.sprites.left;
        for(let i =0; i < boundaries.length; i++) {
            const boundary = boundaries[i];
            if(rectangularCollision({
                rectangle1 : player,
                rectangle2 : {...boundary, position : {
                    x : boundary.position.x + 5,
                    y : boundary.position.y
                }}
            }) 
            ) {
                moving = false;
                break;
            }
        }

        if(moving){
            movables.forEach((movable) => {
                movable.position.x += 5;
            })
        }
    }
    else if(keys.right.pressed && lastKey === 'right') { 
        player.animate = true;
        player.image = player.sprites.right;
        for(let i =0; i < boundaries.length; i++) {
            const boundary = boundaries[i];
            if(rectangularCollision({
                rectangle1 : player,
                rectangle2 : {...boundary, position : {
                    x : boundary.position.x - 5 ,
                    y : boundary.position.y
                }}
            }) 
            ) {
                moving = false;
                break;
            }
        }

        if(moving){
            movables.forEach((movable) => {
                movable.position.x -= 5;
            })
        }
    }
    else if(keys.down.pressed && lastKey === 'down') { 
        player.animate = true;
        player.image = player.sprites.down;
        for(let i =0; i < boundaries.length; i++) {
            const boundary = boundaries[i];
            if(rectangularCollision({
                rectangle1 : player,
                rectangle2 : {...boundary, position : {
                    x : boundary.position.x,
                    y : boundary.position.y - 5
                }}
            }) 
            ) {
                moving = false;
                break;
            }
        }

        if(moving){
            movables.forEach((movable) => {
                movable.position.y -= 5;
            })
        }
    }
};


//animate()



let lastKey = '';
window.addEventListener('keydown', (e) => {
    switch(e.key){
        case "ArrowUp" : 
            keys.up.pressed = true;
            lastKey = 'up';
            break;
        case "ArrowLeft" : 
            keys.left.pressed = true;
            lastKey = 'left';
            break;
        case "ArrowRight" : 
            keys.right.pressed = true;
            lastKey = 'right';
            break;
        case "ArrowDown" : 
            keys.down.pressed = true;
            lastKey = 'down';
            break;
    }
})

window.addEventListener('keyup', (e) => {
    switch(e.key){
        case "ArrowUp" : 
            keys.up.pressed = false;
            break;
        case "ArrowLeft" : 
            keys.left.pressed = false;
            break;
        case "ArrowRight" : 
            keys.right.pressed = false;
            break;
        case "ArrowDown" : 
            keys.down.pressed = false;
            break;
    }
})

