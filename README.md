# 📋 Cover Letter Input

**Cover Letter Input** is a personal Chrome extension that overlays any file input field with a beautifully styled, glassmorphic interface for writing and downloading custom cover letters as PDFs — all without leaving the page.

---

## ✨ Features

- 🔍 **Shadow DOM Injection**: Seamlessly embeds a secure overlay without interfering with host page styles or scripts.
- 📄 **Live PDF Export**: Instantly generate a downloadable cover letter PDF using [jsPDF](https://github.com/parallax/jsPDF).
- 📂 **Overlay on File Inputs**: Detects `input[type="file"]` elements dynamically across standard DOM, Shadow DOMs, and even iframes.
- 💅 **Slick UI**: Glassmorphic design with animated gradient text, shimmering transitions, and responsive layout.
- 📎 **File Upload**: Easily import an existing cover letter from your computer.

---

## 🚀 How It Works

1. **Detects File Inputs**  
   Hooks into `.click()` and `.showPicker()` calls and listens for new elements via MutationObserver.

2. **Injects Overlay**  
   On trigger, a Shadow DOM host is created and `overlay.html`, `overlay.js`, and `init.js` are injected to build the UI.

3. **Generates PDF**  
   Uses `window.jspdf.jsPDF` to render styled text with margins, line wrapping, and auto-pagination.

4. **Exports/Closes**  
   Users can export their work or close the overlay — all without affecting the underlying input.

---

## 🛠 Tech Stack

- **Manifest v3** (Chrome Extensions)
- **JavaScript**, **HTML**, **CSS**
- **jsPDF** for PDF generation
- **Shadow DOM** + DOM traversal logic
- **MutationObserver** for dynamic input detection

---

## 📈 Metrics & Highlights

- Injects overlay in ≤200ms in most DOM environments.
- Supports all URL matches via `<all_urls>`, running in every frame.
- Uses isolated world for safe script injection (`content.js`, `init.js`, `overlay.js`).
- Written with idempotent logic to avoid event duplication or memory leaks.

---

## 📦 Installation

1. Clone this repo

2. Go to `chrome://extensions/` and enable **Developer Mode**.

3. Click **Load unpacked** and select the cloned directory.

4. Navigate to any page with a file input and try clicking it!

---

## 🧪 Development Notes

* Handles shadow roots and iframes gracefully.
* Designed for extensibility (e.g. AI cover letter generation).
* Animations are GPU-accelerated for better performance.

---

## 📜 License

MIT License — built with ❤️ by [Shervin Farahani](https://github.com/sherv01)

---

## 🤝 Contributing

This is a personal project, but PRs are welcome! Feel free to fork and adapt.
