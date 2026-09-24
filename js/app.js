/**
 * app.js
 * Planet Boarding Pass Generator - single page app.
 * Loads flights from the real Test.GetFlightDetails API (js/flight-details-api.js),
 * lets QA select one, and generates QR Code, Aztec Code and PDF417 barcodes
 * directly from the BoardingPass value returned by the API (js/barcode-generator.js,
 * backed locally by js/vendor/bwip-js-min.js - no CDN, no public barcode service).
 * The API's BoardingPass is the source of truth: it is never parsed, rebuilt,
 * trimmed or otherwise modified locally.
 */
(function () {
  'use strict';

  const BARCODE_FORMATS = [
    { bcid: 'qrcode', canvasId: 'qrBarcodeCanvas', errorId: 'qrBarcodeError', downloadBtnId: 'btnDownloadQr', fileSuffix: 'QR' },
    { bcid: 'azteccode', canvasId: 'aztecBarcodeCanvas', errorId: 'aztecBarcodeError', downloadBtnId: 'btnDownloadAztec', fileSuffix: 'AZTEC' },
    { bcid: 'pdf417', canvasId: 'pdf417BarcodeCanvas', errorId: 'pdf417BarcodeError', downloadBtnId: 'btnDownloadPdf417', fileSuffix: 'PDF417' }
  ];

  const el = {};
  let flights = [];
  let selectedFlight = null;

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    cacheElements();
    bindEvents();
  }

  function cacheElements() {
    el.queryCountry = document.getElementById('queryCountry');
    el.queryLocation = document.getElementById('queryLocation');
    el.queryStatus = document.getElementById('queryStatus');
    el.btnFetchFlights = document.getElementById('btnFetchFlights');
    el.btnResetApplication = document.getElementById('btnResetApplication');
    el.apiStatus = document.getElementById('apiStatus');

    el.flightTableBody = document.getElementById('flightTableBody');
    el.flightCountLabel = document.getElementById('flightCountLabel');

    el.barcodeSection = document.getElementById('barcodeSection');
    el.apiBoardingPassText = document.getElementById('apiBoardingPassText');
    el.btnCopyBoardingPass = document.getElementById('btnCopyBoardingPass');

    el.alertPlaceholder = document.getElementById('alertPlaceholder');
  }

  function bindEvents() {
    el.btnFetchFlights.addEventListener('click', onFetchFlights);
    el.btnResetApplication.addEventListener('click', onResetApplication);
    el.btnCopyBoardingPass.addEventListener('click', onCopyBoardingPass);
    BARCODE_FORMATS.forEach(function (format) {
      const btn = document.getElementById(format.downloadBtnId);
      if (btn) {
        btn.addEventListener('click', function () { onDownloadBarcode(format); });
      }
    });
  }

  /** Escapes HTML-significant characters before inserting untrusted API data into innerHTML. */
  function escapeHtml(value) {
    const div = document.createElement('div');
    div.textContent = value === undefined || value === null ? '' : String(value);
    return div.innerHTML;
  }

  /** Validates the API BoardingPass value without trimming or transforming it. */
  function isValidBoardingPass(value) {
    return typeof value === 'string' && value.length > 0;
  }

  // ---------------------------------------------------------------------
  // Load flights
  // ---------------------------------------------------------------------

  async function onFetchFlights() {
    el.btnFetchFlights.disabled = true;
    el.apiStatus.textContent = 'Loading...';
    try {
      const result = await FlightDetailsApi.fetchFlightDetails({
        country: el.queryCountry.value.trim(),
        location: el.queryLocation.value.trim(),
        status: el.queryStatus.value.trim()
      });
      flights = result.flights;
      renderFlightTable(flights);
      el.apiStatus.textContent = result.usedFallback
        ? 'Live API call failed (' + result.errorMessage + ') - showing embedded sample response instead.'
        : 'Loaded live data from ' + FlightDetailsApi.BASE_URL;
      showAlert(flights.length + ' flight(s) loaded.', 'success');
    } catch (err) {
      console.error('[app] Fetch failed unexpectedly.', err);
      el.apiStatus.textContent = 'Failed to load flights: ' + err.message;
      showAlert('Failed to load flights.', 'danger');
    } finally {
      el.btnFetchFlights.disabled = false;
    }
  }

  function renderFlightTable(list) {
    el.flightCountLabel.textContent = list.length + ' flight' + (list.length === 1 ? '' : 's');
    el.flightTableBody.innerHTML = '';

    if (list.length === 0) {
      el.flightTableBody.innerHTML = '<tr><td colspan="4" class="text-muted small">No flights returned.</td></tr>';
      return;
    }

    list.forEach(function (flight, index) {
      const row = document.createElement('tr');
      row.dataset.index = String(index);
      if (selectedFlight === flight) {
        row.classList.add('table-success');
      }
      row.innerHTML =
        '<td><button type="button" class="btn btn-sm btn-outline-planet btn-select-flight">Select</button></td>' +
        '<td>' + escapeHtml(flight.FlightNumber) + '</td>' +
        '<td>' + escapeHtml(flight.FlightTime) + '</td>' +
        '<td class="mono-text small">' + escapeHtml(flight.BoardingPass) + '</td>';
      row.querySelector('.btn-select-flight').addEventListener('click', function () {
        selectFlight(index);
      });
      el.flightTableBody.appendChild(row);
    });
  }

  // ---------------------------------------------------------------------
  // Reset (preserves Country/Location/Status, never reloads the page)
  // ---------------------------------------------------------------------

  function onResetApplication() {
    if (selectedFlight && !window.confirm('Clear loaded flights and generated barcodes?')) {
      return;
    }
    resetApplication();
  }

  function resetApplication() {
    flights = [];
    selectedFlight = null;

    el.flightTableBody.innerHTML = '<tr><td colspan="4" class="text-muted small">Load flights to see results.</td></tr>';
    el.flightCountLabel.textContent = '0 flights';
    el.apiStatus.textContent = '';

    el.apiBoardingPassText.value = '';
    el.btnCopyBoardingPass.disabled = true;
    clearBarcodeCanvases();

    el.alertPlaceholder.innerHTML = '';
    showAlert('Application reset.', 'success');
  }

  // ---------------------------------------------------------------------
  // Selection + barcode generation directly from the API's BoardingPass field
  // ---------------------------------------------------------------------

  function selectFlight(index) {
    selectedFlight = flights[index];

    Array.from(el.flightTableBody.querySelectorAll('tr')).forEach(function (row) {
      row.classList.toggle('table-success', row.dataset.index === String(index));
    });

    const boardingPass = selectedFlight.BoardingPass;
    el.apiBoardingPassText.value = boardingPass;

    if (!isValidBoardingPass(boardingPass)) {
      clearBarcodeCanvases();
      el.btnCopyBoardingPass.disabled = true;
      showAlert('Selected flight has no valid BoardingPass value.', 'danger');
      return;
    }

    el.btnCopyBoardingPass.disabled = false;
    renderAllBarcodes(boardingPass);
    scrollToBarcodeSection();
    showAlert('Selected flight ' + selectedFlight.FlightNumber + '.', 'success');
  }

  function scrollToBarcodeSection() {
    if (el.barcodeSection) {
      el.barcodeSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // ---------------------------------------------------------------------
  // Barcode rendering (QR Code, Aztec Code, PDF417) - bwip-js, local only
  // ---------------------------------------------------------------------

  function renderAllBarcodes(boardingPass) {
    clearBarcodeCanvases();
    renderQRCode(boardingPass);
    renderAztecCode(boardingPass);
    renderPDF417(boardingPass);
  }

  function renderQRCode(boardingPass) {
    renderBarcodeFormat(BARCODE_FORMATS[0], boardingPass);
  }

  function renderAztecCode(boardingPass) {
    renderBarcodeFormat(BARCODE_FORMATS[1], boardingPass);
  }

  function renderPDF417(boardingPass) {
    renderBarcodeFormat(BARCODE_FORMATS[2], boardingPass);
  }

  function renderBarcodeFormat(format, boardingPass) {
    const errorEl = document.getElementById(format.errorId);
    const downloadBtn = document.getElementById(format.downloadBtnId);
    const result = BarcodeGenerator.render(format.canvasId, format.bcid, boardingPass);

    if (result.ok) {
      errorEl.hidden = true;
      errorEl.textContent = '';
      downloadBtn.disabled = false;
    } else {
      errorEl.textContent = 'Failed to render: ' + result.error;
      errorEl.hidden = false;
      downloadBtn.disabled = true;
      console.error('[app] Barcode render failed (' + format.bcid + ').', result.error);
    }
  }

  function clearBarcodeCanvases() {
    BARCODE_FORMATS.forEach(function (format) {
      BarcodeGenerator.clear(format.canvasId);
      const errorEl = document.getElementById(format.errorId);
      errorEl.hidden = true;
      errorEl.textContent = '';
      document.getElementById(format.downloadBtnId).disabled = true;
    });
  }

  function downloadCanvasAsPng(canvasId, fileName) {
    BarcodeGenerator.downloadPng(canvasId, fileName);
  }

  function onDownloadBarcode(format) {
    if (!selectedFlight) { return; }
    const fileNameBase = String(selectedFlight.FlightNumber || 'FLIGHT').trim().replace(/\s+/g, '-').toUpperCase();
    downloadCanvasAsPng(format.canvasId, fileNameBase + '-' + format.fileSuffix + '.png');
  }

  async function onCopyBoardingPass() {
    if (!selectedFlight || !isValidBoardingPass(selectedFlight.BoardingPass)) {
      showAlert('No BoardingPass value to copy yet.', 'danger');
      return;
    }
    try {
      await navigator.clipboard.writeText(selectedFlight.BoardingPass);
      showAlert('BoardingPass copied to clipboard.', 'success');
    } catch (err) {
      console.error('[app] Clipboard copy failed.', err);
      showAlert('Could not copy BoardingPass to clipboard.', 'danger');
    }
  }

  // ---------------------------------------------------------------------
  // UI feedback
  // ---------------------------------------------------------------------

  function showAlert(message, type) {
    const wrapper = document.createElement('div');
    wrapper.className = 'alert alert-' + type + ' alert-dismissible fade show';
    wrapper.role = 'alert';
    wrapper.innerHTML = message + '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>';
    el.alertPlaceholder.appendChild(wrapper);
    setTimeout(function () {
      wrapper.classList.remove('show');
      wrapper.addEventListener('transitionend', function () { wrapper.remove(); });
    }, 3500);
  }
})();
