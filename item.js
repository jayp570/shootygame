class Item {

    constructor(imagePath, x, y) {
        this.pos = {
            x: x,
            y: y
        }
        this.image = new Image()
        this.image.src = imagePath
        this.angle = 0
    }

    draw() {
        g.translate(this.pos.x, this.pos.y)
        g.rotate(this.angle*Math.PI/180)
        g.drawImage(this.image, 0, -this.image.height/2)
        g.rotate(-this.angle*Math.PI/180)
        g.translate(-this.pos.x, -this.pos.y)
    }

    update(offsetX, offsetY) {
        this.pos.x -= offsetX; this.pos.y -= offsetY
    }
}