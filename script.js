const circle = document.getElementById('circle');
const totalCards = 10;
const radius = 450;
let currentRotation = 0;
const centerX = 300;
const centerY = 300;
const cardWidth = 180;
const cardHeight = 240;

const scrollThreshold = 100;
const rotationStep = 10;
let accumulatedScroll = 0;
let activeCard = null;

// 🎬 Create full-screen video overlay
const videoOverlay = document.createElement('div');
videoOverlay.id = 'video-overlay';
videoOverlay.style.position = 'fixed';
videoOverlay.style.top = 0;
videoOverlay.style.left = 0;
videoOverlay.style.width = '100vw';
videoOverlay.style.height = '100vh';
videoOverlay.style.backgroundColor = 'black';
videoOverlay.style.display = 'none';
videoOverlay.style.justifyContent = 'center';
videoOverlay.style.alignItems = 'center';
videoOverlay.style.zIndex = 9999;
videoOverlay.style.transition = 'opacity 0.4s ease';
videoOverlay.style.opacity = '0';

videoOverlay.innerHTML = `
<video id="fullscreen-video" controls autoplay loop style="width: 100vw; height: auto; object-fit: contain; ">
    <source id="video-source" src="" type="video/mp4">
    Your browser does not support the video tag.
  </video>
`;
document.body.appendChild(videoOverlay);

const videoElement = document.getElementById('fullscreen-video');
const videoSource = document.getElementById('video-source');

function showVideoOverlay(videoPath) {
  videoSource.src = videoPath;
  videoElement.load();
  videoOverlay.style.display = 'flex';
  requestAnimationFrame(() => {
    videoOverlay.style.opacity = '1';
  });
  videoElement.play();
  history.pushState({ videoOpen: true }, '', '#video');
}

function hideVideoOverlay() {
  videoOverlay.style.opacity = '0';
  setTimeout(() => {
    videoOverlay.style.display = 'none';
    videoElement.pause();
    videoElement.currentTime = 0;

    if (location.hash === '#video') {
      location.href = 'sounds.html'; // Force refresh on back
    }
  }, 300);
}

// ESC key closes the video
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    hideVideoOverlay();
  }
});

// Clicking anywhere on the overlay closes the video
videoOverlay.addEventListener('click', hideVideoOverlay);

// Browser back button goes to sounds.html
window.addEventListener('popstate', () => {
  location.href = 'sounds.html';
});


// 🃏 Generate cards in a circle
for (let i = 0; i < totalCards; i++) {
  const card = document.createElement('div');
  card.className = 'card';

  const cardInner = document.createElement('div');
  cardInner.className = 'card-inner';

  const cardFront = document.createElement('div');
  cardFront.className = 'card-front';
  const frontTemplate = document.getElementById(`front${i + 1}`);
  if (frontTemplate) {
    cardFront.appendChild(frontTemplate.content.cloneNode(true));
  }
  cardFront.dataset.index = i + 1;

  const cardBack = document.createElement('div');
  cardBack.className = 'card-back';
  const backTemplate = document.getElementById(`back${i + 1}`);
  if (backTemplate) {
    cardBack.appendChild(backTemplate.content.cloneNode(true));
  }

  cardInner.appendChild(cardFront);
  cardInner.appendChild(cardBack);
  card.appendChild(cardInner);

  // 🎯 Positioning in circle
  const angle = (2 * Math.PI / totalCards) * i;
  const x = radius * Math.cos(angle);
  const y = radius * Math.sin(angle);

  const originalLeft = `${centerX + x - cardWidth / 2}px`;
  const originalTop = `${centerY + y - cardHeight / 2}px`;
  const originalRotation = `rotate(${angle + Math.PI / 2}rad)`;

  card.dataset.left = originalLeft;
  card.dataset.top = originalTop;
  card.dataset.rotation = originalRotation;

  card.style.left = originalLeft;
  card.style.top = originalTop;
  card.style.transform = originalRotation;

  // 🖱️ Click logic
  card.addEventListener('click', (e) => {
    e.stopPropagation();
    const cardIndex = Number(cardFront.dataset.index);
    showVideoOverlay(`video/card${cardIndex}.mp4`);
  });

  circle.appendChild(card);
}

// 🌀 Scroll to rotate circle
window.addEventListener('wheel', (e) => {
  if (activeCard) return;

  accumulatedScroll += e.deltaY;

  if (accumulatedScroll >= scrollThreshold) {
    currentRotation += rotationStep;
    accumulatedScroll = 0;
  } else if (accumulatedScroll <= -scrollThreshold) {
    currentRotation -= rotationStep;
    accumulatedScroll = 0;
  }

  circle.style.transform = `rotate(${currentRotation}deg)`;
});
