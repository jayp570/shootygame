class Gun extends Item {

    constructor(x, y, name) {
        super("assets/guns/"+name+".png", x, y)
        this.name = name
        this.carrier = null
    }

    update(offsetX, offsetY) {
        super.update(offsetX, offsetY)
        if(this.carrier != null) {
            this.pos = this.carrier.pos
        }
    }
}