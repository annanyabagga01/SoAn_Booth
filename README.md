# SoAn Booth 📸✨

A premium, fully interactive web-based digital photobooth application designed to capture memories beautifully. With gorgeous aesthetics, live dynamic filters, and HD downloads, this photobooth provides an immersive, high-quality experience directly taking inspiration from trendy physical photobooths.

**🌐 Live Demo:** [https://soan-photobooth.netlify.app](https://soan-photobooth.netlify.app)

## Features 🌟

- **Dynamic 6-Photo Grid**: Capture up to 6 pictures and watch them populate an elegant, printable photo strip.
- **Rich Aesthetic Filters**: Over 10+ custom CSS filters including Vintage, 1998 Cam, Polaroid, VHS, and Y2K Glow. Filter thumbnails dynamically update in real-time based on your ambient camera feed.
- **Interactive Photo Framing (Drag to Pan)**: Captured photos can be panned and dragged within their slots using both mouse and touch gestures to perfectly adjust the framing.
- **Smart Photo Deletion**: Simply click/tap on a photo in the grid without dragging to smoothly delete and retake a slot.
- **Camera Flip Option (`New`)**: Seamlessly toggle between the front (selfie) and rear cameras on mobile devices, complete with automatic smart-mirroring adjustment.
- **Customizable Card Text**: The headers, dates, and subtle branding on the photobooth card are all fully editable—just click and type to customize your moments!
- **Photo Uploads**: Want to use an existing picture? Mix and match live captures with imported local files.
- **Super HD Canvas Baking**: Every snap and filter effect is natively baked directly into the canvas pixels. The final export uses `html2canvas` and scales it up to 4x resolution for a gorgeous, crisp download.

## Tech Stack 🛠️

- **Frontend Core**: Vanilla HTML5, CSS3, and JavaScript.
- **Design & UI**: High-end modern UI utilizing Glassmorphism, CSS Variables, smooth animations, and an interactive 3D Hover/Tilt effect for the card layout.
- **Web API integration**: Leverages `navigator.mediaDevices.getUserMedia` for WebRTC stream connections and HTML5 `<canvas>` for low-level image processing.
- **Libraries**: Utilizes [html2canvas](https://html2canvas.hertzen.com/) to process the DOM structure into high-quality downloadable PNG images.

## Installation & Setup 🚀

Since the application requires camera permissions, most modern browsers mandate that it be served securely via an HTTPS environment or `localhost` context. 

### Running Locally

1. Clone or download this project.
2. Open the project folder in your terminal.
3. You can use any local dev server of your choice. Using `npx` or `python`:
   ```bash
   # Using Node.js
   npx serve .
   
   # Or using Python
   python -m http.server 8000
   ```
4. Navigate to `http://localhost:3000` or `http://localhost:8000` via your web browser.

### Mobile Testing

If you want to view the photobooth on your phone across a local Wi-Fi network, pure HTTP won't magically grant you camera permissions. You need to setup a tunnel or deploy it over HTTPS (using tools like `ngrok`, Vercel, or GitHub Pages) to utilize the full Camera API.

---

*Made with ♥️—capture your moments, set the filter, and freeze time.*
