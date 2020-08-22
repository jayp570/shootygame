let canvas = document.querySelector("canvas");

canvas.width = 1280;
canvas.height = 720;

let g = canvas.getContext("2d");

const TILESIZE = 125;

const ACCELERATION = 3
const FRICTION = -0.1 //-0.05

let rawMap = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
]

function getDist(a, b) {
    let distX = b.pos.x - a.pos.x
    let distY = b.pos.y - a.pos.y
    let dist = Math.sqrt(Math.pow(distX, 2)+Math.pow(distY, 2))
    return dist
}

function Tile(x, y, state) {

    this.state = state

    this.pos = {
        x: x,
        y: y
    }

    this.w = TILESIZE
    this.h = TILESIZE

    this.draw = function() {
        if(this.state == 0) {
            g.fillStyle = "#3b3b3b"
        } else {
            g.fillStyle = "#a8a8a8"
        }
        g.fillRect(this.pos.x, this.pos.y, this.w+1, this.h+1)
    }
}

function Map(x, y, map) {

    this.pos = {
        x: x,
        y: y
    }

    this.map = []
    for(let i = 0; i < map.length; i++) {
        this.map.push([])
        for(let j = 0; j < map[i].length; j++) {
            this.map[i].push(new Tile(j*TILESIZE, i*TILESIZE, map[i][j]))
        }
    }

    this.w = this.map.length*TILESIZE
    this.h = this.map[0].length*TILESIZE

    this.draw = function() {
        for(let i = 0; i < this.map.length; i++) {
            for(let j = 0; j < this.map[i].length; j++) {
                this.map[i][j].draw()
            }
        }
    }

    this.update = function(offsetX, offsetY) {
        for(let i = 0; i < this.map.length; i++) {
            for(let j = 0; j < this.map[i].length; j++) {
                this.map[i][j].pos.x -= offsetX
                this.map[i][j].pos.y -= offsetY
            }
        }
        this.pos.x -= offsetX; this.pos.y -= offsetY;
    }
}

function Player(x, y, team) {

    this.id = 0;

    this.pos = {
        x: x,
        y: y
    }
    this.size = 20
    this.vel = {
        "x": 0,
        "y": 0
    }
    this.acc = {
        "x": 0,
        "y": 0
    }
    this.input = {
        left: false,
        right: false,
        up: false,
        down: false
    }

    this.team = team

    this.maxHealth = 100
    this.health = this.maxHealth

    this.maxDashMeter = 100
    this.dashMeter = this.maxDashMeter

    this.angle = 0

    this.inventory = []

    this.gun = null

    this.posOnMap = {
        x: this.pos.x-map.pos.x,
        y: this.pos.y-map.pos.y
    }

    this.setDirection = function(code,bool) {

        switch(code) {
            case 65: this.input.left = bool; break;
            case 87: this.input.up = bool; break;
            case 68: this.input.right = bool; break;
            case 83: this.input.down = bool; break;
            default: ;
        }
        
    }

    this.checkCollision = function(object) {
        let bX = object.pos.x;
        let bY = object.pos.y;
        let bW = object.w;
        let bH = object.h;
        let x = this.pos.x-this.size/2;
        let y = this.pos.y-this.size/2;
        let w = this.size;
        let h = this.size;
        if(x < bX+bW && x+w > bX && y < bY+bH && y+h > bY) {
            return true;
        }
        return false;
    }

    this.dash = function() {
        if(this.dashMeter >= 50) {
            if(this.input.left) {
                this.vel.x = -30
            }
            if(this.input.up) {
                this.vel.y = -30
            }
            if(this.input.right) {
                this.vel.x = 30
            }
            if(this.input.down) {
                this.vel.y = 30
            }
            this.dashMeter-=50
            if(this.dashMeter < 0) {
                this.dashMeter = 0
            }
            this.angle = Math.atan2(this.vel.y, this.vel.x) * (180/Math.PI)
            particleEffects.push(new ParticleEffect(this.pos.x, this.pos.y, {
                continuous: false, 
                colors: [this.team],
                angle: this.angle,
                particleAmount: 15,
                destroyTime: [0, 5],
                fadeOut: 0.01,
                effectWidth: 50,
                shrink: 1,
                size: [7, 15],
                shapes: ["circle"],
            }, g))
        }
    }

    this.update = function() {
        
        this.acc.x = 0; this.acc.y = 0;
        if(this.input.left) {
            this.acc.x = -ACCELERATION;
        }
        if(this.input.right) {
            this.acc.x = ACCELERATION;
        }
        if(this.input.up) {
            this.acc.y = -ACCELERATION;
        }
        if(this.input.down) {
            this.acc.y = ACCELERATION;
        }
        this.acc.x += this.vel.x * FRICTION;    this.acc.y += this.vel.y * FRICTION;
        this.vel.x += this.acc.x;               this.vel.y += this.acc.y;
        //this.pos.x += this.vel.x;               this.pos.y += this.vel.y;

        this.posOnMap = {
            x: this.pos.x-map.pos.x,
            y: this.pos.y-map.pos.y
        }

        //this.angle = Math.atan2(this.vel.y, this.vel.x) * (180/Math.PI)

        if(this.health < 0) {
            this.health = 0
            playerRespawn(this.posOnMap.x, this.posOnMap.y, 100, 100)
            this.health = this.maxHealth
            this.dashMeter = this.maxDashMeter
        }

        this.dashMeter += 1
        if(this.dashMeter > this.maxDashMeter) {
            this.dashMeter = this.maxDashMeter
        }

        this.gun.update(0, 0)

    }

    this.draw = function() {
        g.fillStyle = this.team
        g.beginPath();
        g.arc(this.pos.x,this.pos.y,this.size,0,2*Math.PI,false);
        g.fill();
        this.gun.draw()
    }

    this.drawHud = function() {
        g.fillStyle = "red"
        g.fillRect(10, canvas.height-80, this.maxHealth*3, 25)
        g.fillStyle = "green"
        g.fillRect(10, canvas.height-80, this.health*3, 25)
        g.fillStyle = "white"
        g.fillRect(10, canvas.height-50, this.maxDashMeter*2, 15)
        g.fillStyle = "cyan"
        g.fillRect(10, canvas.height-50, this.dashMeter*2, 15)
    }
}


function Crate(x, y) {

    this.pos = {
        x: x,
        y: y
    }
    this.vel = {
        x: 0,
        y: 0
    }
    this.acc = {
        x: 0,
        y: 0
    }

    this.w = 60
    this.h = 60

    this.health = 100;

    this.checkCollision = function(object) {
        let bX = object.pos.x;
        let bY = object.pos.y;
        let bW = object.w;
        let bH = object.w;
        let x = this.pos.x;
        let y = this.pos.y;
        let w = this.w;
        let h = this.h;
        if(x < bX+bW && x+w > bX && y < bY+bH && y+h > bY) {
            return true;
        }
        return false;
    }

    this.draw = function() {
        g.fillStyle = "moccasin"
        if(this.health > 0) {
            g.fillRect(this.pos.x, this.pos.y, this.w, this.h)
        }
    }

    this.update = function(offsetX, offsetY) {
        this.acc.x = 0; this.acc.y = 0;
        this.acc.x += this.vel.x * FRICTION;    this.acc.y += this.vel.y * FRICTION;
        this.vel.x += this.acc.x;               this.vel.y += this.acc.y;
        this.pos.x += this.vel.x;               this.pos.y += this.vel.y;

        this.pos.x -= offsetX; this.pos.y -= offsetY;

        if(this.health <= 0) {
            particleEffects.push(new ParticleEffect(this.pos.x, this.pos.y, {
                continuous: false,
                particleAmount: 50,
                effectWidth: 360,
                colors: ["mocassin"],
                destroyTime: [0, 10],
                speed: [10, 15]
            }, g))
        }
    }

}



let map = new Map(0, 0, rawMap)

let particleEffects = []

let players = [
    new Player(canvas.width/2, canvas.height/2, "red")
]

let guns = []

for(let player of players) {
    guns.push(new Gun(0, 0, "pistol"))
}
for(let i = 0; i < players.length; i++) {
    players[i].inventory.push(guns[i])
    players[i].gun = players[i].inventory[0]
    guns[i].carrier = players[i]
}

let crates = [
    new Crate(100, 100), new Crate(200, 100)
]

window.addEventListener('keydown', keyDownHandler, false);
window.addEventListener('keyup', keyUpHandler, false);
window.addEventListener('mousemove', mouseMoveHandler, false)
function keyDownHandler(e) {
    let code = e.keyCode;
    players[0].setDirection(code,true);
    if(code == 32) {
        players[0].dash()
    }
}
function keyUpHandler(e) {
    let code = e.keyCode;
    players[0].setDirection(code,false);
}
function mouseMoveHandler(e) {
    let rect = canvas.getBoundingClientRect();
    let mouseX = event.clientX - rect.left;
    let mouseY = event.clientY - rect.top;
    let playerX = players[0].pos.x; let playerY = players[0].pos.y;
    let x = playerX-mouseX; let y = playerY-mouseY;
    let angle = Math.atan2(-y, -x)
    players[0].gun.angle = angle*(180/Math.PI)
}

let frame = 0


function playerRespawn(playerX, playerY, respawnX, respawnY) {
    
    let x = playerX-respawnX
    let y = playerY-respawnY



    map.pos.x += x; map.pos.y += y;
    for(let i = 0; i < map.map.length; i++) {
        for(let j = 0; j < map.map[i].length; j++) {
            map.map[i][j].pos.x += x; map.map[i][j].pos.y += y;
        }
    }

    for(let crate of crates) {
        crate.pos.x += x; crate.pos.y += y;
    }

    for(let player of players) {
        if(player.id != 0) {
            player.pos.x += x; player.pos.y += y
        }
    }

}



function animate() {
    requestAnimationFrame(animate);
	
    //updates map
    map.update(players[0].vel.x, players[0].vel.y)
	
	//updates player
    players[0].update()

    for(let player of players) {
        outerWallLoop:
        //checks player collision with walls
        for(let i = 0; i < map.map.length; i++) {
            for(let j = 0; j < map.map[i].length; j++) {
                if(map.map[i][j].state == 1) {
                    if(player.checkCollision(map.map[i][j])) {
                        player.vel.x*=-1; player.vel.y*=-1;
                        break outerWallLoop;
                    }
                }
                
            }
        }

        //checks player collision with crates
        for(let crate of crates) {
            if(player.checkCollision(crate)) {
                crate.vel.x += player.vel.x*1.5; crate.vel.y += player.vel.y*1.5;
                if(player.vel.x + player.vel.y >= 20) {
                    crate.health-=50
                }
            }
        }

        //checks if player is off the map
        if(player.checkCollision(map) == false) {
            player.health--;
        }
    }

    //checks crate collision with walls
    for(let crate of crates) {
        outerWallLoop:
        for(let i = 0; i < map.map.length; i++) {
            for(let j = 0; j < map.map[i].length; j++) {
                if(map.map[i][j].state == 1) {
                    if(crate.checkCollision(map.map[i][j])) {
                        crate.vel.x*=-1; crate.vel.y*=-1;
                        break outerWallLoop;
                    }
                }
                
            }
        }
    }

    //updates crates and spawns guns
    let count = 0
    for(let crate of crates) {
        crate.update(players[0].vel.x, players[0].vel.y)
        if(crate.health <= 0) {
            crates.splice(count, 1)
            guns.push(new Gun(crate.pos.x, crate.pos.y, "shotgun"))
        }
        count++
    }

    //updates guns
    for(let gun of guns) {
        if(gun.carrier == null) {
            gun.update(players[0].vel.x, players[0].vel.y)
        }
    }
    //console.log(players[0].inventory)

    //updates particle effects
    for(let effect of particleEffects) {
        effect.pos.x -= players[0].vel.x
        effect.pos.y -= players[0].vel.y
    }


    //spawns crates periodically
    if(frame%1 == 0) {
        if(crates.length < 6) {
            let crateSpawnX = getRandomNum(map.pos.x, map.pos.x+map.w-100)
            let crateSpawnY = getRandomNum(map.pos.y, map.pos.y+map.h-100)
            let crateSpawn = new Crate(crateSpawnX, crateSpawnY)
            let inWall = false
            for(let i = 0; i < map.map.length; i++) {
                for(let j = 0; j < map.map[i].length; j++) {
                    if(map.map[i][j].state == 1) {
                        if(crateSpawn.checkCollision(map.map[i][j])) {
                            inWall = true
                        }
                    }
                }
            }
            while(inWall == true) {
                crateSpawnX = getRandomNum(map.pos.x, map.pos.x+map.w-100)
                crateSpawnY = getRandomNum(map.pos.y, map.pos.y+map.h-100)
                crateSpawn = new Crate(crateSpawnX, crateSpawnY)
                inWall = false
                for(let i = 0; i < map.map.length; i++) {
                    for(let j = 0; j < map.map[i].length; j++) {
                        if(map.map[i][j].state == 1) {
                            if(crateSpawn.checkCollision(map.map[i][j])) {
                                inWall = true
                            }
                        }
                    }
                }
            }
            crates.push(crateSpawn)
        }
    }



    //draws everything
    if(frame%1 == 0) {

        g.clearRect(0,0,canvas.width,canvas.height);
        g.fillStyle = "orangered"
        g.fillRect(0, 0, canvas.width, canvas.height)

        map.draw()

        for(let gun of guns) {
            gun.draw()
        }

        for(let player of players) {
            player.draw()
        }

        for(let crate of crates) {
            crate.draw()
        }

        for(let player of players) {
            player.drawHud()
        }

        //displays pick up prompt
        for(let gun of guns) {
            if(gun.carrier == null) {
                if(getDist(players[0], gun) < 110) {
                    g.fillStyle = "white"
                    g.font = "32px arial"
                    g.fillText("Press [E] to pick up", (canvas.width/2)-120, 100)
                }
            }
        }

        for(let effect of particleEffects) {
            effect.update(g)
        }

    }

    frame++


}

animate();