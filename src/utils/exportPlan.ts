/** Client-side export helpers for plan views (no external deps). */

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

function safeName(name: string): string {
  return (name || 'plan').replace(/[^a-z0-9-_]+/gi, '-').slice(0, 60);
}

/** Escape a CSV cell (RFC-style). */
function csvCell(value: unknown): string {
  const s = value == null ? '' : String(value);
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

/** Build CSV text from header + rows. */
export function rowsToCsv(headers: string[], rows: (string | number)[][]): string {
  const lines = [
    headers.map(csvCell).join(','),
    ...rows.map((row) => row.map(csvCell).join(',')),
  ];
  return lines.join('\r\n');
}

/** Download CSV content. */
export function exportAsCsv(headers: string[], rows: (string | number)[][], filenameBase: string) {
  const text = rowsToCsv(headers, rows);
  // BOM helps Excel open UTF-8 correctly
  const blob = new Blob(['\ufeff', text], { type: 'text/csv;charset=utf-8' });
  downloadBlob(blob, `${safeName(filenameBase)}.csv`);
}

/** Download the plan object as pretty-printed JSON. */
export function exportAsJson(data: unknown, filenameBase: string) {
  if (data == null) {
    window.alert('Nothing to export yet.');
    return;
  }
  const text = JSON.stringify(data, null, 2);
  const blob = new Blob([text], { type: 'application/json;charset=utf-8' });
  downloadBlob(blob, `${safeName(filenameBase)}.json`);
}

/** Open a print window focused on the given element (user can Save as PDF). */
export function exportAsPdf(elementId: string, title: string) {
  const el = document.getElementById(elementId);
  if (!el) {
    window.alert('Nothing to export yet.');
    return;
  }
  const w = window.open('', '_blank', 'noopener,noreferrer,width=900,height=700');
  if (!w) {
    window.alert('Pop-up blocked. Allow pop-ups to export PDF.');
    return;
  }
  w.document.write(`<!DOCTYPE html><html><head><title>${title}</title>
    <style>
      body { font-family: system-ui, sans-serif; color: #0f172a; padding: 24px; line-height: 1.45; }
      h1,h2,h3 { margin: 0 0 0.5rem; }
      h2 { margin-top: 1.5rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.35rem; }
      ul, ol { margin: 0.35rem 0 0.75rem; padding-left: 1.2rem; }
      table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
      th, td { border: 1px solid #e2e8f0; padding: 6px 8px; text-align: left; }
      th { background: #f8fafc; }
      .badge { display: inline-block; font-size: 0.7rem; padding: 2px 6px; border-radius: 4px; background: #e2e8f0; }
      .meta-note, .legacy-box, .phase-section.decisions { background: #f0f9ff; padding: 8px 10px; border-left: 3px solid #0369a1; margin: 8px 0; }
      @media print { body { padding: 0; } }
    </style></head><body>
    <h1>${title}</h1>
    ${el.innerHTML}
    <script>window.onload=function(){window.print();}<\/script>
    </body></html>`);
  w.document.close();
}

/** Download a Word-compatible .doc (HTML). */
export function exportAsDoc(elementId: string, filenameBase: string, title: string) {
  const el = document.getElementById(elementId);
  if (!el) {
    window.alert('Nothing to export yet.');
    return;
  }
  const html = `<!DOCTYPE html><html xmlns:o="urn:schemas-microsoft-com:office:office"
    xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
    <head><meta charset="utf-8"><title>${title}</title>
    <style>
      body { font-family: Calibri, Arial, sans-serif; color: #0f172a; }
      h1,h2,h3 { color: #0f172a; }
      table { border-collapse: collapse; width: 100%; }
      th, td { border: 1px solid #999; padding: 6px; }
    </style></head><body>
    <h1>${title}</h1>
    ${el.innerHTML}
    </body></html>`;
  const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
  downloadBlob(blob, `${safeName(filenameBase)}.doc`);
}

/** Capture element as PNG via SVG foreignObject (no external library). */
export async function exportAsPng(elementId: string, filenameBase: string) {
  const el = document.getElementById(elementId);
  if (!el) {
    window.alert('Nothing to export yet.');
    return;
  }
  const width = Math.max(el.scrollWidth, el.clientWidth, 800);
  const height = Math.max(el.scrollHeight, el.clientHeight, 400);
  const clone = el.cloneNode(true) as HTMLElement;
  clone.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
  clone.style.background = '#ffffff';
  clone.style.padding = '16px';
  clone.style.width = `${width}px`;
  const serializer = new XMLSerializer();
  const xhtml = serializer.serializeToString(clone);
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <foreignObject width="100%" height="100%">${xhtml}</foreignObject>
    </svg>`;
  const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);
  try {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('PNG render failed'));
      img.src = url;
    });
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas not available');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0);
    canvas.toBlob((blob) => {
      if (blob) downloadBlob(blob, `${safeName(filenameBase)}.png`);
      else window.alert('Could not create PNG.');
    }, 'image/png');
  } catch {
    window.alert(
      'PNG export is limited in this browser. Use Download PDF (print dialog → Save as PDF) instead.'
    );
  } finally {
    URL.revokeObjectURL(url);
  }
}

const STATUS_CYCLE = ['not_started', 'in_progress', 'blocked', 'done'] as const;

export function nextStatus(current: string): (typeof STATUS_CYCLE)[number] {
  const i = STATUS_CYCLE.indexOf(current as (typeof STATUS_CYCLE)[number]);
  return STATUS_CYCLE[(i + 1) % STATUS_CYCLE.length];
}
