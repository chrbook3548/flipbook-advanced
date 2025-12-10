// Proxy endpoint
const PDF_URL = "https://flipbook-advanced.onrender.com/pdf";

// PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://mozilla.github.io/pdf.js/build/pdf.worker.js";

let pdfDoc = null;
let pageFlip = null;

async function init() {
  showLoader();

  pdfDoc = await pdfjsLib.getDocument(PDF_URL).promise;
  const totalPages = pdfDoc.numPages;

  const container = document.getElementById("book");

  // INIT Flipbook
  pageFlip = new St.PageFlip(container, {
    width: 800,
    height: 600,
    size: "stretch",
    minWidth: 320,
    maxWidth: 2000,
    showCover: true,
    usePortrait: true,
    autoSize: true,
    flippingTime: 600,
  });

  // Create EMPTY pages (placeholders)
  const pages = [];
  for (let i = 0; i < totalPages; i++) {
    pages.push(`<div class="page" data-page="${i + 1}">
                  <div class="lazy-placeholder">Loading...</div>
                </div>`);
  }

  pageFlip.loadFromHTML(pages);
  hideLoader();

  // Load the first page
  lazyLoadPage(1);

  // Preload page 2
  lazyLoadPage(2);

  // Add event: whenever user flips a page, load + preload next ones
  pageFlip.on("flip", (e) => {
    lazyLoadPage(e.data);
    lazyLoadPage(e.data + 1);
    lazyLoadPage(e.data - 1);
  });

  setupControls(totalPages);
}

async function lazyLoadPage(pageNum) {
  if (pageNum < 1 || pageNum > pdfDoc.numPages) return;

  const pageContainer = document.querySelector(
    `[data-page="${pageNum}"]`
  );

  // already loaded?
  if (pageContainer.dataset.loaded === "true") return;

  const page = await pdfDoc.getPage(pageNum);
  const viewport = page.getViewport({ scale: 1.5 });

  const canvas = document.createElement("canvas");
  canvas.width = viewport.width;
  canvas.height = viewport.height;

  const ctx = canvas.getContext("2d");

  await page.render({ canvasContext: ctx, viewport }).promise;

  pageContainer.innerHTML = ""; // clear placeholder
  pageContainer.appendChild(canvas);

  pageContainer.dataset.loaded = "true";
}

function setupControls(totalPages) {
  document.getElementById("nextBtn").onclick = () => pageFlip.flipNext();
  document.getElementById("prevBtn").onclick = () => pageFlip.flipPrev();

  document.getElementById("jumpBtn").onclick = () => {
    const page = parseInt(document.getElementById("pageNumber").value);
    if (page >= 1 && page <= totalPages) pageFlip.flip(page - 1);
  };
}

function showLoader() {
  document.getElementById("loader").style.display = "block";
}

function hideLoader() {
  document.getElementById("loader").style.display = "none";
}

// Start
init();

