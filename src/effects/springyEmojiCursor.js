// The springy emoji effect has been translated over from this old
// code, to modern js & canvas
// - http://www.yaldex.com/FSMessages/ElasticBullets.htm
export default function springyEmojiCursor(options) {
  const emoji = options && options.emoji || '🤪';
  const hasWrapperEl = options && options.element;
  const element = hasWrapperEl || document.body;

  const nDots = 7;
  const DELTAT = 0.01;
  const SEGLEN = 10;
  const SPRINGK = 10;
  const MASS = 1;
  const GRAVITY = 50;
  const RESISTANCE = 10;
  const STOPVEL = 0.1;
  const STOPACC = 0.1;
  const DOTSIZE = 11;
  const BOUNCE = 0.7;

  let width = window.innerWidth;
  let height = window.innerHeight;
  const cursor = { x: width / 2, y: width / 2 };
  const particles = [];
  let canvas; let
    context;

  let emojiAsImage;

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

    // Save emoji as an image for performance
    context.font = '16px serif';
    context.textBaseline = 'middle';
    context.textAlign = 'center';

    const measurements = context.measureText(emoji);
    const bgCanvas = document.createElement('canvas');
    const bgContext = bgCanvas.getContext('2d');

    bgCanvas.width = measurements.width;
    bgCanvas.height = measurements.actualBoundingBoxAscent
      + measurements.actualBoundingBoxDescent;

    bgContext.textAlign = 'center';
    bgContext.font = '16px serif';
    bgContext.textBaseline = 'middle';
    bgContext.fillText(
      emoji,
      bgCanvas.width / 2,
      measurements.actualBoundingBoxAscent
    );

    emojiAsImage = bgCanvas;

    let i = 0;
    for (i = 0; i < nDots; i++) {
      particles[i] = new Particle(emojiAsImage);
    }

    bindEvents();
    loop();
  }

  // Bind events that are needed
  function bindEvents() {
    element.addEventListener('mousemove', onMouseMove);
    element.addEventListener('touchmove', onTouchMove);
    element.addEventListener('touchstart', onTouchMove);
    window.addEventListener('resize', onWindowResize);
  }

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
      if (hasWrapperEl) {
        const boundingRect = element.getBoundingClientRect();
        cursor.x = e.touches[0].clientX - boundingRect.left;
        cursor.y = e.touches[0].clientY - boundingRect.top;
      } else {
        cursor.x = e.touches[0].clientX;
        cursor.y = e.touches[0].clientY;
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
  }

  function updateParticles() {
    canvas.width = canvas.width;

    // follow mouse
    particles[0].position.x = cursor.x;
    particles[0].position.y = cursor.y;

    // Start from 2nd dot
    for (i = 1; i < nDots; i++) {
      const spring = new vec(0, 0);

      if (i > 0) {
        springForce(i - 1, i, spring);
      }

      if (i < nDots - 1) {
        springForce(i + 1, i, spring);
      }

      const resist = new vec(
        -particles[i].velocity.x * RESISTANCE,
        -particles[i].velocity.y * RESISTANCE
      );

      const accel = new vec(
        (spring.X + resist.X) / MASS,
        (spring.Y + resist.Y) / MASS + GRAVITY
      );

      particles[i].velocity.x += DELTAT * accel.X;
      particles[i].velocity.y += DELTAT * accel.Y;

      if (
        Math.abs(particles[i].velocity.x) < STOPVEL
        && Math.abs(particles[i].velocity.y) < STOPVEL
        && Math.abs(accel.X) < STOPACC
        && Math.abs(accel.Y) < STOPACC
      ) {
        particles[i].velocity.x = 0;
        particles[i].velocity.y = 0;
      }

      particles[i].position.x += particles[i].velocity.x;
      particles[i].position.y += particles[i].velocity.y;

      let height; let
        width;
      height = canvas.clientHeight;
      width = canvas.clientWidth;

      if (particles[i].position.y >= height - DOTSIZE - 1) {
        if (particles[i].velocity.y > 0) {
          particles[i].velocity.y = BOUNCE * -particles[i].velocity.y;
        }
        particles[i].position.y = height - DOTSIZE - 1;
      }

      if (particles[i].position.x >= width - DOTSIZE) {
        if (particles[i].velocity.x > 0) {
          particles[i].velocity.x = BOUNCE * -particles[i].velocity.x;
        }
        particles[i].position.x = width - DOTSIZE - 1;
      }

      if (particles[i].position.x < 0) {
        if (particles[i].velocity.x < 0) {
          particles[i].velocity.x = BOUNCE * -particles[i].velocity.x;
        }
        particles[i].position.x = 0;
      }

      particles[i].draw(context);
    }
  }

  function loop() {
    updateParticles();
    requestAnimationFrame(loop);
  }

  function vec(X, Y) {
    this.X = X;
    this.Y = Y;
  }

  function springForce(i, j, spring) {
    const dx = particles[i].position.x - particles[j].position.x;
    const dy = particles[i].position.y - particles[j].position.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len > SEGLEN) {
      const springF = SPRINGK * (len - SEGLEN);
      spring.X += (dx / len) * springF;
      spring.Y += (dy / len) * springF;
    }
  }

  function Particle(canvasItem) {
    this.position = { x: cursor.x, y: cursor.y };
    this.velocity = {
      x: 0,
      y: 0,
    };

    this.canv = canvasItem;

    this.draw = function (context) {
      context.drawImage(
        this.canv,
        this.position.x - this.canv.width / 2,
        this.position.y - this.canv.height / 2,
        this.canv.width,
        this.canv.height
      );
    };
  }

  init();
}
