class Particle {
    constructor(_pos, _vel, _radius) {
        this.pos = _pos;
        this.vel = _vel;
        this.acc = createVector(0, 0);
        this.radius = _radius;
        console.log(this.vel);
    }
    display() {
        ellipse(this.pos.x, this.pos.y, this.radius, this.radius);
    }
    update() {
        this.pos.add(this.vel);
        this.vel.add(this.acc);
        this.acc.mult(0);
    }
    applyForce(f) {
        this.acc.add(f);
    }
}