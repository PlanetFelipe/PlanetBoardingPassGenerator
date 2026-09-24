/**
 * barcode-generator.js
 * Thin wrapper around bwip-js (js/vendor/bwip-js-min.js, loaded locally -
 * no CDN, no external barcode service) used to render the boarding pass
 * BoardingPass string as QR Code, Aztec Code and PDF417 barcodes, and to
 * export any of them as a downloadable PNG.
 */
const BarcodeGenerator = (function () {
  'use strict';

  // Suggested rendering configuration per format: black bars on a white
  // background (regardless of app theme) for maximum scanner compatibility.
  const RENDER_OPTIONS = {
    qrcode: { bcid: 'qrcode', scale: 5, eclevel: 'M', padding: 10, backgroundcolor: 'FFFFFF', barcolor: '000000' },
    azteccode: { bcid: 'azteccode', scale: 5, padding: 10, backgroundcolor: 'FFFFFF', barcolor: '000000' },
    pdf417: { bcid: 'pdf417', scaleX: 2, scaleY: 2, padding: 10, backgroundcolor: 'FFFFFF', barcolor: '000000' }
  };

  /**
   * Renders `text` onto the canvas with the given id using bwip-js.
   * @param {string} canvasId - id of the target <canvas> element
   * @param {'qrcode'|'azteccode'|'pdf417'} bcid - bwip-js barcode identifier
   * @param {string} text - data to encode, used exactly as passed in
   * @returns {{ok:true}|{ok:false, error:string}}
   */
  function render(canvasId, bcid, text) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
      return { ok: false, error: 'Canvas element "' + canvasId + '" was not found.' };
    }
    const options = Object.assign({}, RENDER_OPTIONS[bcid], { text: text });
    try {
      // eslint-disable-next-line no-undef -- bwipjs global is provided by js/vendor/bwip-js-min.js
      bwipjs.toCanvas(canvas, options);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: typeof err === 'string' ? err : (err && err.message) || 'Unknown barcode rendering error.' };
    }
  }

  /** Clears a previously rendered barcode from the given canvas. */
  function clear(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) { return; }
    const ctx = canvas.getContext('2d');
    if (ctx) { ctx.clearRect(0, 0, canvas.width, canvas.height); }
    canvas.removeAttribute('width');
    canvas.removeAttribute('height');
  }

  /** Triggers a browser download of the given canvas's current content as a PNG. */
  function downloadPng(canvasId, fileName) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) { return; }
    const link = document.createElement('a');
    link.download = fileName;
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  return { render: render, clear: clear, downloadPng: downloadPng };
})();
