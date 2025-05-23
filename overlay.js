console.log('%c📋 Cover Letter Input: overlay.js loaded', 'font-weight: bold; font-size: 1.3em;');

function initializeOverlay() {
    const shadowHost = document.querySelector('div.cnp-shadow-host');
    const shadow = shadowHost ? shadowHost.shadowRoot : null;
    if (!shadow) {
        console.log('%c📋 Cover Letter Input: Shadow root not found', 'font-weight: bold; font-size: 1.3em;');
        return;
    }
    console.log('%c📋 Cover Letter Input: Shadow DOM found', 'font-weight: bold; font-size: 1.3em;');

    // Poll for window.jspdf
    let jsPDFAttempts = 0;
    const maxJsPDFAttempts = 50;
    const jsPDFInterval = setInterval(() => {
        jsPDFAttempts++;
        console.log('%c📋 Cover Letter Input: jsPDF polling attempt %d, window.jspdf: %o', 'font-weight: bold; font-size: 1.3em;', jsPDFAttempts, window.jspdf);
        if (window.jspdf && window.jspdf.jsPDF) {
            clearInterval(jsPDFInterval);
            console.log('%c📋 Cover Letter Input: jsPDF available in overlay: %o', 'font-weight: bold; font-size: 1.3em;', window.jspdf);
            setupButtons();
        } else if (jsPDFAttempts >= maxJsPDFAttempts) {
            clearInterval(jsPDFInterval);
            console.log('%c📋 Cover Letter Input: jsPDF not available in overlay after %d attempts', 'font-weight: bold; font-size: 1.3em;', maxJsPDFAttempts);
            setupButtons(true);
        }
    }, 100);
}

function setupButtons(jsPDFFailed = false) {
    const shadowHost = document.querySelector('div.cnp-shadow-host');
    const shadow = shadowHost ? shadowHost.shadowRoot : null;
    if (!shadow) {
        console.log('%c📋 Cover Letter Input: Shadow root not found in setupButtons', 'font-weight: bold; font-size: 1.3em;');
        return;
    }

    const submitBtn = shadow.querySelector('#submit-btn');
    const downloadBtn = shadow.querySelector('#download-btn');
    const uploadBtn = shadow.querySelector('#upload-btn');
    const closeBtn = shadow.querySelector('#close-btn');
    const coverLetter = shadow.querySelector('#cover-letter');
    const fileInput = shadow.querySelector('#cnp-overlay-file-input');

    if (!submitBtn || !downloadBtn || !uploadBtn || !closeBtn || !coverLetter || !fileInput) {
        console.log('%c📋 Cover Letter Input: Button(s), textarea, or file input not found in shadow DOM', 'font-weight: bold; font-size: 1.3em;');
        console.log('submitBtn:', submitBtn, 'downloadBtn:', downloadBtn, 'uploadBtn:', uploadBtn, 'closeBtn:', closeBtn, 'coverLetter:', coverLetter, 'fileInput:', fileInput);
        return;
    }
    console.log('%c📋 Cover Letter Input: Buttons found and event listeners attaching', 'font-weight: bold; font-size: 1.3em;');

    // Remove existing listeners to prevent duplication
    const cloneSubmit = submitBtn.cloneNode(true);
    submitBtn.parentNode.replaceChild(cloneSubmit, submitBtn);
    const cloneDownload = downloadBtn.cloneNode(true);
    downloadBtn.parentNode.replaceChild(cloneDownload, downloadBtn);
    const cloneUpload = uploadBtn.cloneNode(true);
    uploadBtn.parentNode.replaceChild(cloneUpload, uploadBtn);
    const cloneClose = closeBtn.cloneNode(true);
    closeBtn.parentNode.replaceChild(cloneClose, closeBtn);
    const cloneFileInput = fileInput.cloneNode(true);
    fileInput.parentNode.replaceChild(cloneFileInput, fileInput);

    // Re-query after cloning
    const newSubmitBtn = shadow.querySelector('#submit-btn');
    const newDownloadBtn = shadow.querySelector('#download-btn');
    const newUploadBtn = shadow.querySelector('#upload-btn');
    const newCloseBtn = shadow.querySelector('#close-btn');
    const newFileInput = shadow.querySelector('#cnp-overlay-file-input');

    newSubmitBtn.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        console.log('%c📋 Cover Letter Input: Submit button clicked', 'font-weight: bold; font-size: 1.3em;');
        try {
            if (jsPDFFailed) {
                throw new Error('jsPDF failed to load');
            }
            if (!window.jspdf || !window.jspdf.jsPDF) {
                throw new Error('jsPDF constructor not found');
            }
            const jsPDF = window.jspdf.jsPDF;
            const doc = new jsPDF();
            const text = coverLetter.value || 'Default cover letter text';
            const yourName = "Your Name"; // Replace with your actual name
            const today = new Date().toLocaleDateString();
            const margin = 20;
            const maxWidth = 170; // A4 width (210mm) - 2 * margin
            const lineHeight = 5;

            doc.setFont("helvetica", "normal");
            doc.setFontSize(12);
            doc.text(yourName, margin, 20);
            doc.text(today, margin, 30);
            doc.setFontSize(10);

            const lines = doc.splitTextToSize(text, maxWidth);
            let y = 50;
            lines.forEach(line => {
                doc.text(line, margin, y);
                y += lineHeight;
                if (y > 270) { // A4 height (297mm) - margin
                    doc.addPage();
                    y = margin;
                }
            });

            const pdfBlob = doc.output('blob');
            const fileName = `cover_letter_${new Date().toISOString().replace(/[:.]/g, '-')}.pdf`;
            const file = new File([pdfBlob], fileName, { type: 'application/pdf' });

            window.postMessage({ type: 'cnp-pdf-generated', file: file, fileName: fileName }, '*');
            console.log('%c📋 Cover Letter Input: PDF generated and event dispatched', 'font-weight: bold; font-size: 1.3em;');
        } catch (error) {
            console.error('%c📋 Cover Letter Input: Error generating PDF', 'font-weight: bold; font-size: 1.3em;', error);
            alert('Failed to generate PDF: ' + error.message);
        }
    });

    newDownloadBtn.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        console.log('%c📋 Cover Letter Input: Download button clicked', 'font-weight: bold; font-size: 1.3em;');
        try {
            if (jsPDFFailed) {
                throw new Error('jsPDF failed to load');
            }
            if (!window.jspdf || !window.jspdf.jsPDF) {
                throw new Error('jsPDF constructor not found');
            }
            const jsPDF = window.jspdf.jsPDF;
            const doc = new jsPDF();
            const text = coverLetter.value || 'Default cover letter text';
            const yourName = "Your Name"; // Replace with your actual name
            const today = new Date().toLocaleDateString();
            const margin = 20;
            const maxWidth = 170; // A4 width (210mm) - 2 * margin
            const lineHeight = 5;

            doc.setFont("helvetica", "normal");
            doc.setFontSize(12);
            doc.text(yourName, margin, 20);
            doc.text(today, margin, 30);
            doc.setFontSize(10);

            const lines = doc.splitTextToSize(text, maxWidth);
            let y = 50;
            lines.forEach(line => {
                doc.text(line, margin, y);
                y += lineHeight;
                if (y > 270) { // A4 height (297mm) - margin
                    doc.addPage();
                    y = margin;
                }
            });

            doc.save('cover_letter.pdf');
            console.log('%c📋 Cover Letter Input: PDF downloaded', 'font-weight: bold; font-size: 1.3em;');
        } catch (error) {
            console.error('%c📋 Cover Letter Input: Error downloading PDF', 'font-weight: bold; font-size: 1.3em;', error);
            alert('Failed to download PDF: ' + error.message);
        }
    });

    newUploadBtn.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        console.log('%c📋 Cover Letter Input: Upload button clicked', 'font-weight: bold; font-size: 1.3em;');
        newFileInput.click();
    });

    newFileInput.addEventListener('change', (event) => {
        console.log('%c📋 Cover Letter Input: File selected', 'font-weight: bold; font-size: 1.3em;');
        try {
            const file = event.target.files[0];
            if (!file) {
                throw new Error('No file selected');
            }
            if (file.type !== 'application/pdf') {
                throw new Error('Selected file is not a PDF');
            }
            const fileName = file.name;
            window.postMessage({ type: 'cnp-file-uploaded', file: file, fileName: fileName }, '*');
            console.log('%c📋 Cover Letter Input: Uploaded file dispatched', 'font-weight: bold; font-size: 1.3em;');
        } catch (error) {
            console.error('%c📋 Cover Letter Input: Error processing uploaded file', 'font-weight: bold; font-size: 1.3em;', error);
            alert('Failed to process uploaded file: ' + error.message);
        }
    });

    newCloseBtn.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        console.log('%c📋 Cover Letter Input: Close button clicked', 'font-weight: bold; font-size: 1.3em;');
        window.postMessage({ type: 'cnp-close-overlay' }, '*');
    });
}

// Initialize immediately
initializeOverlay();