export default function emojiCursor(options) {
  const possibleEmoji = (options && options.emoji) || ['😀', '😂', '😆', '😊'];
  const size = (options && options.size) || '21px';
  const hasWrapperEl = options && options.element;
  const element = hasWrapperEl || document.body;

  let width = window.innerWidth;
  let height = window.innerHeight;
  const cursor = { x: width / 2, y: width / 2 };
  const particles = [];
  let canvas; let
    context;
  const canvImages = [];

  function onWindowResize() {
    width = window.innerWidth;
    height = window.innerHeight;

    if (hasWrapperEl) {
      canvas.width = element.clientWidth;
      canvas.height = element.clientHeight;
    } else {
      canvas.width = width;
      canvas.height = height;
    }
  }

  function onTouchMove(e) {
    if (e.touches.length > 0) {
      for (let i = 0; i < e.touches.length; i++) {
        addParticle(
          e.touches[i].clientX,
          e.touches[i].clientY,
          canvImages[Math.floor(Math.random() * canvImages.length)]
        );
      }
    }
  }

  function onMouseMove(e) {
    if (hasWrapperEl) {
      const boundingRect = element.getBoundingClientRect();
      cursor.x = e.clientX - boundingRect.left;
      cursor.y = e.clientY - boundingRect.top;
    } else {
      cursor.x = e.clientX;
      cursor.y = e.clientY;
    }

    addParticle(
      cursor.x,
      cursor.y,
      canvImages[Math.floor(Math.random() * possibleEmoji.length)]
    );
  }

  function addParticle(x, y, img) {
    particles.push(new Particle(x, y, img));
  }

  function updateParticles() {
    context.clearRect(0, 0, width, height);

    // Update
    for (let i = 0; i < particles.length; i++) {
      particles[i].update(context);
    }

    // Remove dead particles
    for (let i = particles.length - 1; i >= 0; i--) {
      if (particles[i].lifeSpan < 0) {
        particles.splice(i, 1);
      }
    }
  }

  /**
   * Particles
   */

  function Particle(x, y, canvasItem) {
    const lifeSpan = Math.floor(Math.random() * 60 + 80);
    this.initialLifeSpan = lifeSpan; //
    this.lifeSpan = lifeSpan; // ms
    this.velocity = {
      x: (Math.random() < 0.5 ? -1 : 1) * (Math.random() / 2),
      y: Math.random() * 0.4 + 0.8,
    };
    this.position = { x, y };
    this.canv = canvasItem;

    this.update = function (context) {
      this.position.x += this.velocity.x;
      this.position.y += this.velocity.y;
      this.lifeSpan--;

      this.velocity.y += 0.05;

      const scale = Math.max(this.lifeSpan / this.initialLifeSpan, 0);

      context.drawImage(
        this.canv,
        this.position.x - (this.canv.width / 2) * scale,
        this.position.y - this.canv.height / 2,
        this.canv.width * scale,
        this.canv.height * scale
      );
    };
  }

  // Bind events that are needed
  function bindEvents() {
    element.addEventListener('mousemove', onMouseMove);
    element.addEventListener('touchmove', onTouchMove);
    element.addEventListener('touchstart', onTouchMove);
    window.addEventListener('resize', onWindowResize);
  }

  function loop() {
    updateParticles();
    requestAnimationFrame(loop);
  }

  function init() {
    canvas = document.createElement('canvas');
    context = canvas.getContext('2d');

    canvas.style.top = '0px';
    canvas.style.left = '0px';
    canvas.style.pointerEvents = 'none';

    if (hasWrapperEl) {
      canvas.style.position = 'absolute';
      element.appendChild(canvas);
      canvas.width = element.clientWidth;
      canvas.height = element.clientHeight;
    } else {
      canvas.style.position = 'fixed';
      document.body.appendChild(canvas);
      canvas.width = width;
      canvas.height = height;
    }

    context.font = `${size} serif`;
    context.textBaseline = 'middle';
    context.textAlign = 'center';

    possibleEmoji.forEach((emoji) => {
      const measurements = context.measureText(emoji);
      const bgCanvas = document.createElement('canvas');
      const bgContext = bgCanvas.getContext('2d');

      bgCanvas.width = measurements.width;
      bgCanvas.height = measurements.actualBoundingBoxAscent
        + measurements.actualBoundingBoxDescent;

      bgContext.textAlign = 'center';
      bgContext.font = `${size} serif`;
      bgContext.textBaseline = 'middle';
      bgContext.fillText(
        emoji,
        bgCanvas.width / 2,
        measurements.actualBoundingBoxAscent
      );

      canvImages.push(bgCanvas);
    });

    bindEvents();
    loop();
  }

  init();
}
