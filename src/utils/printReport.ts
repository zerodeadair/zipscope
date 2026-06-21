export function printElementReport(elementId: string, title: string) {
  const node = document.getElementById(elementId);
  if (!node) {
    throw new Error(`Print target "${elementId}" was not found.`);
  }

  const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
    .map((styleNode) => styleNode.outerHTML)
    .join("\n");
  const frame = document.createElement("iframe");
  frame.title = title;
  frame.setAttribute("aria-hidden", "true");
  frame.style.position = "fixed";
  frame.style.right = "0";
  frame.style.bottom = "0";
  frame.style.width = "0";
  frame.style.height = "0";
  frame.style.border = "0";
  frame.style.opacity = "0";
  document.body.appendChild(frame);

  const printDocument = frame.contentDocument;
  const printWindow = frame.contentWindow;
  if (!printDocument || !printWindow) {
    frame.remove();
    window.print();
    return;
  }

  printDocument.open();
  printDocument.write(`<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
    ${styles}
    <style>
      html,
      body {
        min-width: 0 !important;
        margin: 0 !important;
        background: #eef7ff !important;
      }

      body {
        padding: 24px !important;
      }

      .print-report {
        position: static !important;
        inset: auto !important;
        left: auto !important;
        top: auto !important;
        z-index: auto !important;
        display: grid !important;
        width: min(1080px, 100%) !important;
        min-height: 0 !important;
        margin: 0 auto !important;
        pointer-events: auto !important;
      }

      @media print {
        @page {
          size: letter portrait;
          margin: 0.25in;
        }

        html,
        body {
          background: #eef7ff !important;
        }

        body {
          padding: 0 !important;
        }

        .print-report {
          width: 100% !important;
          padding: 0 !important;
        }
      }
    </style>
  </head>
  <body>${node.outerHTML}</body>
</html>`);
  printDocument.close();

  window.setTimeout(() => {
    printWindow.focus();
    printWindow.print();
    window.setTimeout(() => frame.remove(), 1000);
  }, 350);
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char] ?? char));
}
