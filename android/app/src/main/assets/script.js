const video = document.getElementById('webcam');
const canvas = document.getElementById('hidden-canvas');
const ctx = canvas.getContext('2d');
const captureBtn = document.getElementById('capture-btn');
const uploadInput = document.getElementById('upload-input');
const photoCountSpan = document.getElementById('photo-count');
const photoSlots = document.querySelectorAll('.photo-slot');
const flashEl = document.getElementById('flash');
const filtersList = document.getElementById('filters-list');
const dateEl = document.getElementById('current-date');
const downloadBtn = document.getElementById('download-btn');
const printBtn = document.getElementById('print-btn');
const resetBtn = document.getElementById('reset-btn');
const printCard = document.getElementById('print-card');
const flipCameraBtn = document.getElementById('flip-camera-btn');

// Set current date on card
const options = { year: 'numeric', month: 'short', day: 'numeric' };
dateEl.innerText = new Date().toLocaleDateString('en-US', options);

let currentPhotos = 0;
const MAX_PHOTOS = 6;
let currentFilterCSS = 'none';
let currentFacingMode = 'user';

const snapFilters = [
    { name: 'Normal', css: 'none' },
    { name: 'Vintage', css: 'sepia(0.6) contrast(1.2) brightness(0.9) hue-rotate(-10deg) saturate(1.2)' },
    { name: 'Classical', css: 'grayscale(0.8) contrast(1.2) sepia(0.2) brightness(1.05)' },
    { name: '1998 Cam', css: 'sepia(0.5) contrast(1.1) saturate(1.3) brightness(0.9) hue-rotate(-15deg)' },
    { name: 'Disposable', css: 'contrast(1.3) saturate(1.1) sepia(0.25) hue-rotate(-10deg) brightness(1.05)' },
    { name: 'Film 35mm', css: 'sepia(0.3) saturate(0.85) contrast(0.95) brightness(1.1) hue-rotate(5deg)' },
    { name: 'Polaroid', css: 'sepia(0.4) contrast(0.8) brightness(1.15) saturate(0.7)' },
    { name: 'Y2K Glow', css: 'contrast(1.2) saturate(1.5) sepia(0.2) hue-rotate(330deg) brightness(1.1)' },
    { name: 'VHS', css: 'contrast(1.6) saturate(1.7) hue-rotate(10deg) sepia(0.3) brightness(0.9)' },
    { name: 'Lo-Fi', css: 'saturate(0.6) contrast(1.3) sepia(0.2) brightness(0.85)' },
    { name: 'Indie Kid', css: 'contrast(1.1) saturate(2) brightness(1.1) hue-rotate(10deg)' },
    { name: 'Noir', css: 'grayscale(1) contrast(1.4) brightness(0.9)' },
    { name: 'Cyberpunk', css: 'contrast(1.5) saturate(2) hue-rotate(90deg)' }
];

// Function to update filter thumbnail images dynamically
function updateFilterThumbnails(sourceElement, srcWidth, srcHeight) {
    const tCanvas = document.createElement('canvas');
    tCanvas.width = 150;
    tCanvas.height = 150;
    const tCtx = tCanvas.getContext('2d');
    
    // Draw mirrored if it's the web camera video and facing user
    if (sourceElement.tagName === 'VIDEO') {
        if (currentFacingMode === 'user') {
            tCtx.translate(150, 0);
            tCtx.scale(-1, 1);
        }
    }
    
    // Crop center square
    const size = Math.min(srcWidth, srcHeight);
    const startX = (srcWidth - size) / 2;
    const startY = (srcHeight - size) / 2;
    
    tCtx.drawImage(sourceElement, startX, startY, size, size, 0, 0, 150, 150);
    const thumbUrl = tCanvas.toDataURL('image/jpeg', 0.6);
    
    document.querySelectorAll('.thumb-circle').forEach(circle => {
        circle.style.backgroundImage = `url(${thumbUrl})`;
        circle.style.backgroundSize = 'cover';
        circle.style.backgroundPosition = 'center';
    });
}

// Initialize webcam
async function initWebcam() {
    try {
        // Most mobile browsers block camera access completely on HTTP (insecure) networks. 
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            alert("Warning: Camera blocked! Make sure your deployed website uses HTTPS. Browsers block cameras on insecure HTTP sites.");
            throw new Error("getUserMedia not supported (likely insecure context)");
        }

        if (video.srcObject) {
            video.srcObject.getTracks().forEach(track => track.stop());
        }

        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: currentFacingMode, width: { ideal: 1280 }, height: { ideal: 720 } } 
        });
        video.srcObject = stream;
        
        if (currentFacingMode === 'user') {
            video.style.transform = 'scaleX(-1)';
        } else {
            video.style.transform = 'scaleX(1)';
        }
        
        // When video starts streaming, take a snapshot for the filters preview
        video.addEventListener('loadeddata', () => {
            setTimeout(() => {
                updateFilterThumbnails(video, video.videoWidth, video.videoHeight);
            }, 800); // Give the camera 800ms to adjust exposure before snapshot
        });

    } catch (err) {
        console.warn("Camera access denied or unavail.", err);
        alert(`Camera Issue: ${err.message}. Please allow camera permissions or check if URL is HTTPS.`);
        // Change text
        captureBtn.innerText = "Camera not detected";
        captureBtn.disabled = true;
    }
}
initWebcam();

if (flipCameraBtn) {
    flipCameraBtn.addEventListener('click', () => {
        currentFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';
        initWebcam();
    });
}

// Populate filters UI
snapFilters.forEach((f, idx) => {
    const btn = document.createElement('button');
    btn.className = `filter-thumb ${idx === 0 ? 'active' : ''}`;
    
    // inner div for the picture
    const circle = document.createElement('div');
    circle.className = 'thumb-circle';
    circle.style.filter = f.css; // Preview the filter
    
    const name = document.createElement('span');
    name.className = 'filter-name';
    name.innerText = f.name;

    btn.appendChild(circle);
    btn.appendChild(name);

    btn.addEventListener('click', () => {
        // Remove active class from all
        document.querySelectorAll('.filter-thumb').forEach(b => b.classList.remove('active'));
        // Add to current
        btn.classList.add('active');
        
        currentFilterCSS = f.css;
        video.style.filter = currentFilterCSS;
    });

    filtersList.appendChild(btn);
});

// Flash effect function
function triggerFlash() {
    flashEl.classList.remove('active');
    void flashEl.offsetWidth; // reset animation
    flashEl.classList.add('active');
}

// Function to add photo to slot
function addPhotoToCard(imageSrc) {
    if (currentPhotos >= MAX_PHOTOS) return;

    // Find first empty slot
    const slot = Array.from(photoSlots).find(s => s.classList.contains('empty'));
    if (!slot) return;
    
    slot.innerHTML = ''; 

    const img = document.createElement('div');
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.backgroundImage = `url(${imageSrc})`;
    
    // Using background-image instead of <img> completely fixes html2canvas stretching bugs!
    img.style.backgroundSize = 'cover';
    img.style.backgroundPosition = '50% 50%';
    img.style.cursor = 'grab';
    img.title = "Drag to adjust framing";

    let isDragging = false;
    let didMove = false;
    let startX, startY;
    let currentX = 50, currentY = 50;

    const onStart = (clientX, clientY) => {
        isDragging = true;
        didMove = false;
        img.style.cursor = 'grabbing';
        startX = clientX;
        startY = clientY;
    };

    const onMove = (clientX, clientY) => {
        if (!isDragging) return;
        const deltaX = clientX - startX;
        const deltaY = clientY - startY;
        
        if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) {
            didMove = true;
        }

        // Adjust percentage panning speed
        // the pan direction is calculated so the image follows the mouse
        currentX -= (deltaX / img.clientWidth) * 100 * 0.8; // Reverse delta X for normal behavior without CSS scaleX
        currentY -= (deltaY / img.clientHeight) * 100 * 0.8;

        currentX = Math.max(0, Math.min(100, currentX));
        currentY = Math.max(0, Math.min(100, currentY));

        img.style.backgroundPosition = `${currentX}% ${currentY}%`;
        startX = clientX;
        startY = clientY;
    };

    const onEnd = () => {
        if (isDragging) {
            isDragging = false;
            img.style.cursor = 'grab';
            if (!didMove) {
                if (confirm("Are you sure you want to delete this photo?")) {
                    slot.innerHTML = '';
                    slot.classList.add('empty');
                    currentPhotos--;
                    photoCountSpan.innerText = currentPhotos;
                    captureBtn.disabled = false;
                    captureBtn.innerHTML = `<span class="btn-icon">✨</span>Capture Photo (<span id="photo-count">${currentPhotos}</span>/6)`;
                }
            }
        }
    };

    img.addEventListener('mousedown', e => { e.preventDefault(); onStart(e.clientX, e.clientY); });
    window.addEventListener('mousemove', e => onMove(e.clientX, e.clientY));
    window.addEventListener('mouseup', onEnd);
    
    img.addEventListener('touchstart', e => onStart(e.touches[0].clientX, e.touches[0].clientY), {passive: true});
    window.addEventListener('touchmove', e => onMove(e.touches[0].clientX, e.touches[0].clientY), {passive: true});
    window.addEventListener('touchend', onEnd);

    slot.appendChild(img);
    slot.classList.remove('empty');
    
    currentPhotos++;
    photoCountSpan.innerText = currentPhotos;

    if (currentPhotos >= MAX_PHOTOS) {
        captureBtn.disabled = true;
        captureBtn.innerText = "Card Full! ✨";
        document.querySelector('.preview-panel').scrollIntoView({ behavior: 'smooth' });
    }
}

// Capture button click
captureBtn.addEventListener('click', () => {
    if (currentPhotos >= MAX_PHOTOS) return;
    
    // Exact dimensions
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Bake filter and mirror effect exactly into pixels for perfect downloading
    ctx.filter = currentFilterCSS;
    if (currentFacingMode === 'user') {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
    }
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/png'); // Saving raw image as uncompressed PNG 
    
    // Reset canvas transformation
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.filter = 'none';

    triggerFlash();
    
    // Play shutter sound if possible
    try {
        const audio = new Audio('https://www.soundjay.com/mechanical/sounds/camera-shutter-click-01.mp3');
        audio.volume = 0.5;
        audio.play().catch(e=>console.log(e));
    } catch(e) {}

    addPhotoToCard(dataUrl);
});

// File upload click
uploadInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file && currentPhotos < MAX_PHOTOS) {
        const reader = new FileReader();
        reader.onload = (event) => {
            const dataUrl = event.target.result;
            
            // Generate thumbnails based on uploaded photo preview
            const tempImg = new Image();
            tempImg.onload = () => {
                updateFilterThumbnails(tempImg, tempImg.width, tempImg.height);
                
                // Bake the filter for the uploaded image too!
                canvas.width = tempImg.width;
                canvas.height = tempImg.height;
                ctx.setTransform(1, 0, 0, 1, 0, 0); // No mirroring for uploads
                ctx.filter = currentFilterCSS;
                ctx.drawImage(tempImg, 0, 0, canvas.width, canvas.height);
                const bakedDataUrl = canvas.toDataURL('image/png');
                ctx.filter = 'none'; // reset

                // Add flash for nice feedback even on upload
                triggerFlash();
                addPhotoToCard(bakedDataUrl);
            };
            tempImg.src = dataUrl;
            e.target.value = ''; // reset input
        };
        reader.readAsDataURL(file);
    }
});

// Print card
printBtn.addEventListener('click', () => {
    window.print();
});

// Download card using html2canvas
downloadBtn.addEventListener('click', () => {
    if (currentPhotos === 0) {
        alert("Please capture at least one photo first!");
        return;
    }
    
    const originalTransform = printCard.style.transform;
    printCard.style.transform = 'none'; // reset rotation from css before capture
    
    html2canvas(printCard, {
        scale: 4, // 4x scale for super HD quality download
        useCORS: true,
        backgroundColor: null
    }).then(canvasOutput => {
        printCard.style.transform = originalTransform;

        const link = document.createElement('a');
        link.download = `SoAnBooth_Moments_${new Date().getTime()}.png`;
        link.href = canvasOutput.toDataURL('image/png');
        link.click();
    });
});

// Reset logic
resetBtn.addEventListener('click', () => {
    if(confirm("Are you sure you want to clear your current card?")) {
        currentPhotos = 0;
        photoCountSpan.innerText = '0';
        captureBtn.disabled = false;
        captureBtn.innerHTML = `<span class="btn-icon">✨</span>Capture Photo (<span id="photo-count">0</span>/6)`;
        
        photoSlots.forEach(slot => {
            slot.innerHTML = '';
            slot.classList.add('empty');
        });
    }
});

// Keyboard shortcut: Press Enter to capture photo
window.addEventListener('keydown', (e) => {
    // Check if we are editing text on the card so we don't accidentally capture
    if (e.target.isContentEditable) return;

    if (e.key === 'Enter') {
        e.preventDefault();
        if (!captureBtn.disabled) captureBtn.click();
    }
});

// Interactive 3D Tilt Effect for the Card
const cardWrapperContainer = document.querySelector('.card-wrapper-container');

cardWrapperContainer.addEventListener('mousemove', (e) => {
    const rect = cardWrapperContainer.getBoundingClientRect();
    const xPos = e.clientX - rect.left;
    const yPos = e.clientY - rect.top;

    const xMid = rect.width / 2;
    const yMid = rect.height / 2;

    // Max rotation 12 degrees
    const rotateX = ((yPos - yMid) / yMid) * -12; 
    const rotateY = ((xPos - xMid) / xMid) * 12;

    printCard.style.transition = 'transform 0.1s ease-out';
    printCard.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    printCard.style.boxShadow = `${-rotateY}px ${rotateX}px 40px rgba(0,0,0,0.4), inset 0 0 10px rgba(255,255,255,0.4)`;
});

cardWrapperContainer.addEventListener('mouseleave', () => {
    printCard.style.transition = 'all 0.6s cubic-bezier(0.23, 1, 0.32, 1)';
    printCard.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
    printCard.style.boxShadow = `0 15px 35px rgba(0,0,0,0.6)`;
});
