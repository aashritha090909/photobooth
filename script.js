const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const snapButton = document.getElementById('snap');
const downloadLink = document.getElementById('download');
const snapshot = document.getElementById('snapshot');
const filterSelect = document.getElementById('filter');
const stickerSelect = document.getElementById('sticker');
const countdownEl = document.getElementById('countdown');
const clickSound = new Audio("sounds/click.mp3");

const PHOTO_COUNT = 3;
const COUNTDOWN_TIME = 3;

// Access webcam
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => {
    video.srcObject = stream;
  })
  .catch(err => {
    alert("Camera access denied.");
    console.error(err);
  });

// Apply live filter
filterSelect.addEventListener('change', () => {
  clickSound.play(); 
  video.style.filter = filterSelect.value;
});

// Main function: Take 3 photos with countdown
snapButton.addEventListener('click', async () => {
  clickSound.play();
  const width = video.videoWidth;
  const height = video.videoHeight;
  const borderSize = 40;

  const canvasWidth = width + borderSize * 2;
  const borderPadding = 16; // white border around each image
  const spacingBetweenPhotos = 20; // vertical space between photos

  const canvasHeight = PHOTO_COUNT * (height + borderPadding * 2 + spacingBetweenPhotos) - spacingBetweenPhotos + borderSize * 2;

  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  const context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);

  // Draw border frame first
  drawCheckerboardBorder(context, canvasWidth, canvasHeight, borderSize);

  for (let i = 0; i < PHOTO_COUNT; i++) {
    await runCountdown(COUNTDOWN_TIME);
    await takeSingleShot(context, width, height, i, borderSize);
  }

  const dataURL = canvas.toDataURL('image/png');
  snapshot.innerHTML = `<img src="${dataURL}" alt="Photobooth Strip">`;
  downloadLink.href = dataURL;
});

  // Generate image
  const dataURL = canvas.toDataURL('image/png');
  snapshot.innerHTML = `<img src="${dataURL}" alt="Photobooth Strip">`;
  downloadLink.href = dataURL;


// Countdown function
function runCountdown(seconds) {
  return new Promise(resolve => {
    let count = seconds;
    countdownEl.textContent = count;

    const timer = setInterval(() => {
      count--;
      if (count <= 0) {
        clearInterval(timer);
        countdownEl.textContent = '';
        resolve();
      } else {
        countdownEl.textContent = count;
      }
    }, 1000);
  });
}

// Capture one photo and draw to canvas slot
async function takeSingleShot(context, width, height, slotIndex, offset) {
  const borderPadding = 16; // white border thickness
  const x = offset + borderPadding;
  const y = slotIndex * (height + borderPadding * 2 + offset) + offset;

  // Draw white border rectangle behind the photo
  context.fillStyle = 'white';
  context.fillRect(x - borderPadding, y - borderPadding, width + borderPadding * 2, height + borderPadding * 2);

  // Draw the actual photo
  context.filter = filterSelect.value;
  context.drawImage(video, x, y, width, height);

  // Optional sticker (emoji/text)
  const sticker = stickerSelect.value;
  if (sticker !== "none") {
    context.font = '60px serif';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillStyle = '#8e44ad';
    context.fillText(sticker, x + width / 2, y + height / 2);
  }

  return new Promise(resolve => setTimeout(resolve, 500));
}

function drawCheckerboardBorder(ctx, width, height, size) {
  const tileSize = 10;
  let colorToggle = false;

  // Top & Bottom
  for (let x = 0; x < width; x += tileSize) {
    colorToggle = !colorToggle;
    ctx.fillStyle = colorToggle ? "black" : "white";
    ctx.fillRect(x, 0, tileSize, size); // top
    ctx.fillRect(x, height - size, tileSize, size); // bottom
  }

  // Left & Right
  for (let y = 0; y < height; y += tileSize) {
    colorToggle = !colorToggle;
    ctx.fillStyle = colorToggle ? "black" : "white";
    ctx.fillRect(0, y, size, tileSize); // left
    ctx.fillRect(width - size, y, size, tileSize); // right
  }
}
