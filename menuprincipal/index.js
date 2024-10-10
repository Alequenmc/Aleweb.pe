

// Advanced Space Simulation

// Constants and Configuration
const CONFIG = {
    STAR_COUNT: 300,
    ASTEROID_COUNT: 50,
    PLANET_COUNT: 8,
    MAX_PARTICLES: 500,
    NEBULA_COUNT: 5,
    INTERACTION_RADIUS: 200,
    PARTICLE_LIFESPAN: 300,
    BLACK_HOLE_COUNT: 1,
    COMET_COUNT: 3,
    STAR_CLUSTER_COUNT: 2,
};

const COLORS = {
    STARS: ['#ffffff', '#ffe9c4', '#d4fbff', '#ffd700', '#ff8c00'],
    PLANETS: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#9b59b6', '#1abc9c', '#f39c12', '#7f8c8d'],
    NEBULAS: ['rgba(255, 0, 255, 0.1)', 'rgba(0, 255, 255, 0.1)', 'rgba(255, 255, 0, 0.1)', 'rgba(0, 255, 0, 0.1)', 'rgba(255, 165, 0, 0.1)'],
};

// Canvas Setup
const canvas = document.getElementById('space-canvas');
const ctx = canvas.getContext('2d');
let mouseX = 0, mouseY = 0;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Utility Functions
const randomRange = (min, max) => Math.random() * (max - min) + min;
const distance = (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1);

// Vector Class
class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    add(v) {
        return new Vector(this.x + v.x, this.y + v.y);
    }

    subtract(v) {
        return new Vector(this.x - v.x, this.y - v.y);
    }

    multiply(scalar) {
        return new Vector(this.x * scalar, this.y * scalar);
    }

    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    normalize() {
        const mag = this.magnitude();
        if (mag > 0) {
            return new Vector(this.x / mag, this.y / mag);
        }
        return new Vector(0, 0);
    }
}

// Particle System
class Particle {
    constructor(position, radius, color, velocity, type, lifespan = Infinity) {
        this.position = position;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
        this.type = type;
        this.lifespan = lifespan;
        this.age = 0;
        this.opacity = 1;
    }

    update(blackHoles) {
        this.position = this.position.add(this.velocity);

        if (this.position.x < 0 || this.position.x > canvas.width) this.velocity.x *= -1;
        if (this.position.y < 0 || this.position.y > canvas.height) this.velocity.y *= -1;

        const mouseVector = new Vector(mouseX - this.position.x, mouseY - this.position.y);
        const mouseDistance = mouseVector.magnitude();
        if (mouseDistance < CONFIG.INTERACTION_RADIUS) {
            const repulsion = mouseVector.normalize().multiply(-0.5);
            this.velocity = this.velocity.add(repulsion);
        }

        // Black hole interaction
        blackHoles.forEach(blackHole => {
            const blackHoleVector = blackHole.position.subtract(this.position);
            const blackHoleDistance = blackHoleVector.magnitude();
            if (blackHoleDistance < blackHole.eventHorizon) {
                const attraction = blackHoleVector.normalize().multiply(0.1);
                this.velocity = this.velocity.add(attraction);
            }
        });

        this.age++;
        this.opacity = Math.max(0, 1 - this.age / this.lifespan);
    }

    draw() {
        ctx.globalAlpha = this.opacity;
        ctx.beginPath();
        if (this.type === 'star') {
            ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        } else if (this.type === 'asteroid') {
            ctx.moveTo(this.position.x, this.position.y - this.radius);
            for (let i = 0; i < 5; i++) {
                ctx.lineTo(
                    this.position.x + this.radius * Math.cos((i * 4 * Math.PI / 5) - Math.PI / 2),
                    this.position.y + this.radius * Math.sin((i * 4 * Math.PI / 5) - Math.PI / 2)
                );
            }
            ctx.closePath();
        }
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.globalAlpha = 1;
    }

    isExpired() {
        return this.age >= this.lifespan;
    }
}

// Planet System
class Planet {
    constructor(radius, color, orbitRadius, orbitSpeed) {
        this.radius = radius;
        this.color = color;
        this.orbitRadius = orbitRadius;
        this.orbitSpeed = orbitSpeed;
        this.angle = Math.random() * Math.PI * 2;
        this.position = new Vector(0, 0);
        this.moons = [];
        this.rings = Math.random() < 0.3; // 30% chance of having rings
        this.generateMoons();
    }

    generateMoons() {
        const moonCount = Math.floor(Math.random() * 4);
        for (let i = 0; i < moonCount; i++) {
            this.moons.push({
                radius: this.radius * 0.2,
                orbitRadius: this.radius * 2 + i * 15,
                orbitSpeed: 0.02 + Math.random() * 0.03,
                angle: Math.random() * Math.PI * 2
            });
        }
    }

    update() {
        this.angle += this.orbitSpeed;
        this.position.x = canvas.width / 2 + Math.cos(this.angle) * this.orbitRadius;
        this.position.y = canvas.height / 2 + Math.sin(this.angle) * this.orbitRadius;

        this.moons.forEach(moon => {
            moon.angle += moon.orbitSpeed;
        });
    }

    draw() {
        // Draw orbit
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, this.orbitRadius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.stroke();

        // Draw planet
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        const gradient = ctx.createRadialGradient(
            this.position.x, this.position.y, 0,
            this.position.x, this.position.y, this.radius
        );
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
        ctx.fillStyle = gradient;
        ctx.fill();

        // Draw rings if present
        if (this.rings) {
            ctx.beginPath();
            ctx.ellipse(this.position.x, this.position.y, this.radius * 1.8, this.radius * 0.3, 0, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 3;
            ctx.stroke();
        }

        // Draw moons
        this.moons.forEach(moon => {
            const moonX = this.position.x + Math.cos(moon.angle) * moon.orbitRadius;
            const moonY = this.position.y + Math.sin(moon.angle) * moon.orbitRadius;
            
            ctx.beginPath();
            ctx.arc(moonX, moonY, moon.radius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(200, 200, 200, 0.8)';
            ctx.fill();
        });
    }
}

// Nebula System
class Nebula {
    constructor() {
        this.position = new Vector(Math.random() * canvas.width, Math.random() * canvas.height);
        this.radius = randomRange(150, 300);
        this.color = COLORS.NEBULAS[Math.floor(Math.random() * COLORS.NEBULAS.length)];
        this.points = this.generatePoints();
    }

    generatePoints() {
        const points = [];
        const count = 10;
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const distance = this.radius * (0.8 + Math.random() * 0.4);
            points.push({
                x: this.position.x + Math.cos(angle) * distance,
                y: this.position.y + Math.sin(angle) * distance
            });
        }
        return points;
    }

    draw() {
        ctx.beginPath();
        ctx.moveTo(this.points[0].x, this.points[0].y);
        for (let i = 1; i < this.points.length; i++) {
            const xc = (this.points[i].x + this.points[i - 1].x) / 2;
            const yc = (this.points[i].y + this.points[i - 1].y) / 2;
            ctx.quadraticCurveTo(this.points[i - 1].x, this.points[i - 1].y, xc, yc);
        }
        ctx.closePath();
        const gradient = ctx.createRadialGradient(
            this.position.x, this.position.y, 0,
            this.position.x, this.position.y, this.radius
        );
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.fill();
    }
}

// Black Hole Class
class BlackHole {
    constructor() {
        this.position = new Vector(randomRange(0, canvas.width), randomRange(0, canvas.height));
        this.radius = 20;
        this.eventHorizon = 100;
        this.rotationAngle = 0;
    }

    update() {
        this.rotationAngle += 0.05;
    }

    draw() {
        // Event horizon
        ctx.beginPath();
        const gradient = ctx.createRadialGradient(
            this.position.x, this.position.y, 0,
            this.position.x, this.position.y, this.eventHorizon
        );
        gradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
        gradient.addColorStop(0.7, 'rgba(20, 20, 20, 0.8)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.arc(this.position.x, this.position.y, this.eventHorizon, 0, Math.PI * 2);
        ctx.fill();

        // Accretion disk
        ctx.save();
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(this.rotationAngle);
        ctx.scale(1, 0.3);
        ctx.beginPath();
        const diskGradient = ctx.createRadialGradient(0, 0, this.radius, 0, 0, this.eventHorizon);
        diskGradient.addColorStop(0, 'rgba(255, 100, 0, 0)');
        diskGradient.addColorStop(0.3, 'rgba(255, 100, 0, 0.8)');
        diskGradient.addColorStop(0.7, 'rgba(255, 200, 0, 0.3)');
        diskGradient.addColorStop(1, 'rgba(255, 200, 0, 0)');
        ctx.fillStyle = diskGradient;
        ctx.arc(0, 0, this.eventHorizon, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Black hole
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'black';
        ctx.fill();
    }
}

// Comet Class
class Comet {
    constructor() {
        this.position = new Vector(Math.random() * canvas.width, Math.random() * canvas.height);
        this.velocity = new Vector(randomRange(-2, 2), randomRange(-2, 2));
        this.radius = 3;
        this.tailLength = 50;
        this.tailPoints = [];
    }

    update() {
        this.position = this.position.add(this.velocity);

        if (this.position.x < 0 || this.position.x > canvas.width) this.velocity.x *= -1;
        if (this.position.y < 0 || this.position.y > canvas.height) this.velocity.y *= -1;

        this.tailPoints.unshift({x: this.position.x, y: this.position.y});
        if (this.tailPoints.length > this.tailLength) {
            this.tailPoints.pop();
        }
    }

    draw() {
        // Draw tail
        ctx.beginPath();
        ctx.moveTo(this.position.x, this.position.y);
        for (let i = 0; i < this.tailPoints.length; i++) {
            ctx.lineTo(this.tailPoints[i].x, this.tailPoints[i].y);
        }
        const gradient = ctx.createLinearGradient(
            this.position.x, this.position.y,
            this.tailPoints[this.tailPoints.length - 1].x,
            this.tailPoints[this.tailPoints.length - 1].y
        );
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.stroke();

      // Draw comet head
      ctx.beginPath();
      ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
      const headGradient = ctx.createRadialGradient(
          this.position.x, this.position.y, 0,
          this.position.x, this.position.y, this.radius
      );
      headGradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
      headGradient.addColorStop(1, 'rgba(255, 200, 100, 0.8)');
      ctx.fillStyle = headGradient;
      ctx.fill();
  }
}

// Star Cluster Class
class StarCluster {
  constructor() {
      this.position = new Vector(Math.random() * canvas.width, Math.random() * canvas.height);
      this.stars = [];
      this.generateStars();
  }

  generateStars() {
      const starCount = Math.floor(randomRange(50, 150));
      for (let i = 0; i < starCount; i++) {
          const distance = randomRange(0, 100);
          const angle = Math.random() * Math.PI * 2;
          this.stars.push({
              position: new Vector(
                  this.position.x + Math.cos(angle) * distance,
                  this.position.y + Math.sin(angle) * distance
              ),
              radius: Math.random() * 1.5,
              color: COLORS.STARS[Math.floor(Math.random() * COLORS.STARS.length)]
          });
      }
  }

  draw() {
      this.stars.forEach(star => {
          ctx.beginPath();
          ctx.arc(star.position.x, star.position.y, star.radius, 0, Math.PI * 2);
          ctx.fillStyle = star.color;
          ctx.fill();
      });
  }
}

// Main Game Class
class SpaceSimulation {
  constructor() {
      this.particles = [];
      this.planets = [];
      this.nebulas = [];
      this.blackHoles = [];
      this.comets = [];
      this.starClusters = [];
      this.initObjects();
  }

  initObjects() {
      // Create stars
      for (let i = 0; i < CONFIG.STAR_COUNT; i++) {
          this.particles.push(new Particle(
              new Vector(Math.random() * canvas.width, Math.random() * canvas.height),
              Math.random() * 2,
              COLORS.STARS[Math.floor(Math.random() * COLORS.STARS.length)],
              new Vector(randomRange(-0.1, 0.1), randomRange(-0.1, 0.1)),
              'star'
          ));
      }

      // Create asteroids
      for (let i = 0; i < CONFIG.ASTEROID_COUNT; i++) {
          this.particles.push(new Particle(
              new Vector(Math.random() * canvas.width, Math.random() * canvas.height),
              2 + Math.random() * 3,
              `rgb(${100 + Math.random() * 155}, ${100 + Math.random() * 155}, ${100 + Math.random() * 155})`,
              new Vector(randomRange(-0.5, 0.5), randomRange(-0.5, 0.5)),
              'asteroid'
          ));
      }

      // Create planets
      for (let i = 0; i < CONFIG.PLANET_COUNT; i++) {
          this.planets.push(new Planet(
              5 + Math.random() * 20,
              COLORS.PLANETS[i],
              150 + i * 80,
              0.001 + Math.random() * 0.002
          ));
      }

      // Create nebulas
      for (let i = 0; i < CONFIG.NEBULA_COUNT; i++) {
          this.nebulas.push(new Nebula());
      }

      // Create black holes
      for (let i = 0; i < CONFIG.BLACK_HOLE_COUNT; i++) {
          this.blackHoles.push(new BlackHole());
      }

      // Create comets
      for (let i = 0; i < CONFIG.COMET_COUNT; i++) {
          this.comets.push(new Comet());
      }

      // Create star clusters
      for (let i = 0; i < CONFIG.STAR_CLUSTER_COUNT; i++) {
          this.starClusters.push(new StarCluster());
      }
  }

  update() {
      this.particles.forEach(particle => particle.update(this.blackHoles));
      this.planets.forEach(planet => planet.update());
      this.blackHoles.forEach(blackHole => blackHole.update());
      this.comets.forEach(comet => comet.update());

      // Remove expired particles
      this.particles = this.particles.filter(particle => !particle.isExpired());
  }

  draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#0B0B2A');
      gradient.addColorStop(0.5, '#1B1B3A');
      gradient.addColorStop(1, '#2D0B2A');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw star clusters
      this.starClusters.forEach(cluster => cluster.draw());

      // Draw nebulas
      this.nebulas.forEach(nebula => nebula.draw());

      // Draw particles
      this.particles.forEach(particle => particle.draw());

      // Draw planets
      this.planets.forEach(planet => planet.draw());

      // Draw black holes
      this.blackHoles.forEach(blackHole => blackHole.draw());

      // Draw comets
      this.comets.forEach(comet => comet.draw());
  }

  addParticle(x, y, type) {
      if (this.particles.length < CONFIG.MAX_PARTICLES) {
          if (type === 'star') {
              this.particles.push(new Particle(
                  new Vector(x, y),
                  Math.random() * 2,
                  COLORS.STARS[Math.floor(Math.random() * COLORS.STARS.length)],
                  new Vector(randomRange(-0.1, 0.1), randomRange(-0.1, 0.1)),
                  'star',
                  CONFIG.PARTICLE_LIFESPAN
              ));
          } else if (type === 'asteroid') {
              this.particles.push(new Particle(
                  new Vector(x, y),
                  2 + Math.random() * 3,
                  `rgb(${100 + Math.random() * 155}, ${100 + Math.random() * 155}, ${100 + Math.random() * 155})`,
                  new Vector(randomRange(-0.5, 0.5), randomRange(-0.5, 0.5)),
                  'asteroid',
                  CONFIG.PARTICLE_LIFESPAN
              ));
          }
      }
  }
}

// Game Instance and Animation Loop
const game = new SpaceSimulation();

function animate() {
  game.update();
  game.draw();
  requestAnimationFrame(animate);
}

// Event Listeners
canvas.addEventListener('mousemove', (event) => {
  mouseX = event.clientX;
  mouseY = event.clientY;
});

canvas.addEventListener('click', (event) => {
  game.addParticle(event.clientX, event.clientY, Math.random() > 0.5 ? 'star' : 'asteroid');
});

// Start the animation
animate();

// Tailwind Configuration
tailwind.config = {
  theme: {
      extend: {
          fontFamily: {
              sans: ['Inter', 'sans-serif'],
          },
          animation: {
              'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          },
          colors: {
              space: {
                  dark: '#0B0B2A',
                  light: '#1B1B3A',
                  purple: '#2D0B2A',
              },
          },
      }
  }
}
























// Cards spotlight with improved interaction and animations
class Spotlight {
  constructor(containerElement) {
      this.container = containerElement;
      this.cards = Array.from(this.container.children);
      this.mouse = { x: 0, y: 0 };
      this.containerSize = { w: 0, h: 0 };
      this.activeCardIndex = 0; // Índice de la tarjeta activa
      this.intervalId = null; // ID del intervalo para el cambio automático
      this.initContainer = this.initContainer.bind(this);
      this.onMouseMove = this.onMouseMove.bind(this);
      this.updateCardStyles = this.updateCardStyles.bind(this);
      this.startAutoChange = this.startAutoChange.bind(this);
      this.init();
  }

  initContainer() {
      // Actualiza el tamaño del contenedor
      this.containerSize.w = this.container.offsetWidth;
      this.containerSize.h = this.container.offsetHeight;
  }

  onMouseMove(event) {
      const rect = this.container.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      if (this.isMouseInside(x, y)) {
          this.mouse.x = x;
          this.mouse.y = y;
          this.updateCardStyles();
      }
  }

  isMouseInside(x, y) {
      return x >= 0 && x <= this.containerSize.w && y >= 0 && y <= this.containerSize.h;
  }

  updateCardStyles() {
      this.cards.forEach((card, index) => {
          const cardRect = card.getBoundingClientRect();
          const cardX = -(cardRect.left - this.container.getBoundingClientRect().left) + this.mouse.x;
          const cardY = -(cardRect.top - this.container.getBoundingClientRect().top) + this.mouse.y;

          card.style.setProperty('--mouse-x', `${cardX}px`);
          card.style.setProperty('--mouse-y', `${cardY}px`);

          if (index === this.activeCardIndex) {
              card.classList.add('active'); // Activa la tarjeta actual
              gsap.to(card, {
                  scale: 1.05, 
                  rotation: 5, 
                  duration: 0.5, 
                  ease: "power2.out"
              });
          } else {
              card.classList.remove('active');
              gsap.to(card, {
                  scale: 1,
                  rotation: 0, 
                  duration: 0.5, 
                  ease: "power2.out"
              });
          }
      });
  }

  changeActiveCard() {
      this.activeCardIndex = (this.activeCardIndex + 1) % this.cards.length;
      this.updateCardStyles();
  }

  startAutoChange() {
      this.intervalId = setInterval(this.changeActiveCard.bind(this), 5000);
  }

  init() {
      this.initContainer();
      window.addEventListener('resize', this.initContainer);
      window.addEventListener('mousemove', this.onMouseMove);
      this.startAutoChange(); 
  }

  stopAutoChange() {
      clearInterval(this.intervalId);
  }
}





// animation for card interactive, zoom, efx parallax
document.querySelectorAll('[data-spotlight]').forEach((spotlightContainer) => {
  spotlightContainer.addEventListener('mousemove', (e) => {
    const cards = spotlightContainer.querySelectorAll('.relative');
    cards.forEach(card => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Aplicar las coordenadas del mouse en las variables CSS personalizadas
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });

  // Efecto de animación cuando el mouse sale de la card
  spotlightContainer.addEventListener('mouseleave', (e) => {
    const cards = spotlightContainer.querySelectorAll('.relative');
    cards.forEach(card => {
      card.style.setProperty('--mouse-x', `50%`);
      card.style.setProperty('--mouse-y', `50%`);
    });
  });
});





particlesJS('particles-js',
    {
      "particles": {
        "number": {
          "value": 100, // Número de partículas
          "density": {
            "enable": true,
            "value_area": 800 // Área de dispersión
          }
        },
        "color": {
          "value": "#ffffff" // Color de las partículas
        },
        "shape": {
          "type": "circle", // Forma de las partículas (circle, edge, triangle, polygon, star, etc.)
          "stroke": {
            "width": 0,
            "color": "#000000"
          },
          "polygon": {
            "nb_sides": 5
          },
        },
        "opacity": {
          "value": 0.5, // Opacidad de las partículas
          "random": false,
          "anim": {
            "enable": false,
            "speed": 1,
            "opacity_min": 0.1,
            "sync": false
          }
        },
        "size": {
          "value": 3, // Tamaño de las partículas
          "random": true,
          "anim": {
            "enable": false,
            "speed": 40,
            "size_min": 0.1,
            "sync": false
          }
        },
        "line_linked": {
          "enable": true, // Líneas que conectan partículas
          "distance": 150,
          "color": "#ffffff",
          "opacity": 0.4,
          "width": 1
        },
        "move": {
          "enable": true,
          "speed": 6, // Velocidad de movimiento de las partículas
          "direction": "none", // Dirección de las partículas (none, top, top-right, right, etc.)
          "random": false,
          "straight": false,
          "out_mode": "out", // Si las partículas deben salir de la pantalla o rebotar
          "bounce": false,
          "attract": {
            "enable": false,
            "rotateX": 600,
            "rotateY": 1200
          }
        }
      },
      "interactivity": {
        "detect_on": "canvas",
        "events": {
          "onhover": {
            "enable": true,
            "mode": "repulse" // Modo de interacción cuando el mouse pasa por las partículas (grab, repulse, bubble, etc.)
          },
          "onclick": {
            "enable": true,
            "mode": "push" 
          },
          "resize": true
        },
        "modes": {
          "grab": {
            "distance": 400,
            "line_linked": {
              "opacity": 1
            }
          },
          "bubble": {
            "distance": 400,
            "size": 40,
            "duration": 2,
            "opacity": 8,
            "speed": 3
          },
          "repulse": {
            "distance": 200,
            "duration": 0.4
          },
          "push": {
            "particles_nb": 4
          },
          "remove": {
            "particles_nb": 2
          }
        }
      },
      "retina_detect": true
    }
  );







 // Carrusel automático de testimonios
 const testimonials = document.querySelectorAll('#testimonials-carousel .slide-in');
 let currentIndex = 0;

 function showTestimonial(index) {
     testimonials.forEach((testimonial, i) => {
         testimonial.style.opacity = '0';
         testimonial.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
         testimonial.style.transform = 'translateY(20px)'; // Desplazamiento hacia abajo
     });

     testimonials[index].style.opacity = '1';
     testimonials[index].style.transform = 'translateY(0)'; // Restablecer la posición
 }

 function rotateTestimonials() {
     currentIndex = (currentIndex + 1) % testimonials.length;
     showTestimonial(currentIndex);
 }
