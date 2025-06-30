const paletteContainer = document.getElementById("palette");
const generateBtn = document.getElementById("generateBtn");
const saveBtn = document.getElementById("saveBtn");
const exportBtn = document.getElementById("exportBtn");
const colorPicker = document.getElementById("colorPicker");
const addColorBtn = document.getElementById("addColorBtn");

let palette = [];

function getRandomHexColor() {
  return (
    "#" +
    Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, "0")
      .toUpperCase()
  );
}

function getLuminance(hex) {
  let rgb = hex
    .replace("#", "")
    .match(/.{2}/g)
    .map((c) => parseInt(c, 16) / 255);
  rgb = rgb.map((c) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  );
  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
}

function getContrastRatio(fg, bg) {
  const lum1 = getLuminance(fg);
  const lum2 = getLuminance(bg);
  const bright = Math.max(lum1, lum2);
  const dark = Math.min(lum1, lum2);
  return (bright + 0.05) / (dark + 0.05);
}

function getContrastLabel(ratio) {
  if (ratio >= 7) return "AAA ✅";
  if (ratio >= 4.5) return "AA ✅";
  return "❌ Fail";
}

function renderPalette() {
  paletteContainer.innerHTML = "";

  palette.forEach((swatch, index) => {
    const swatchEl = document.createElement("div");
    swatchEl.className = "swatch";
    swatchEl.style.backgroundColor = swatch.color;

    const content = document.createElement("div");
    content.className = "swatch-content";

    const contrast = getContrastRatio(swatch.color, "#ffffff");
    const contrastInfo = document.createElement("div");
    contrastInfo.className = "contrast-info";
    contrastInfo.textContent = `Contrast: ${getContrastLabel(
      contrast.toFixed(2)
    )}`;

    const code = document.createElement("div");
    code.className = "color-code";
    code.textContent = swatch.color;

    // Lock button
    const lock = document.createElement("button");
    lock.className = "lock-btn";
    lock.textContent = swatch.locked ? "✓" : "";
    lock.title = swatch.locked ? "Unlock color" : "Lock color";
    lock.addEventListener("click", (e) => {
      e.stopPropagation();
      palette[index].locked = !palette[index].locked;
      renderPalette();
    });

    // Remove button
    const remove = document.createElement("button");
    remove.className = "remove-btn";
    remove.textContent = "✕";
    remove.title = "Remove color";
    remove.addEventListener("click", (e) => {
      e.stopPropagation();
      palette.splice(index, 1);
      renderPalette();
    });

    content.appendChild(contrastInfo);
    content.appendChild(code);

    swatchEl.appendChild(content);
    swatchEl.appendChild(lock);
    swatchEl.appendChild(remove);

    swatchEl.addEventListener("click", () => {
      navigator.clipboard.writeText(swatch.color);
      code.textContent = "Copied!";
      setTimeout(() => {
        code.textContent = swatch.color;
      }, 1000);
    });

    paletteContainer.appendChild(swatchEl);
  });
}

function generatePalette(count = 5) {
  if (palette.length === 0) {
    palette = Array.from({ length: count }, () => ({
      color: getRandomHexColor(),
      locked: false,
    }));
  } else {
    palette = palette.map((swatch) =>
      swatch.locked ? swatch : { color: getRandomHexColor(), locked: false }
    );
  }
  renderPalette();
}

addColorBtn.addEventListener("click", () => {
  if (palette.length >= 10) {
    alert("Maximum 10 colors allowed.");
    return;
  }
  const color = colorPicker.value.toUpperCase();
  palette.push({ color, locked: false });
  renderPalette();
});

generateBtn.addEventListener("click", () => generatePalette());

saveBtn.addEventListener("click", () => {
  const saved =
    JSON.parse(localStorage.getItem("savedPalettes") || "[]") || [];
  saved.push(palette);
  localStorage.setItem("savedPalettes", JSON.stringify(saved));
  alert("Palette saved!");
});

exportBtn.addEventListener("click", () => {
  const css = palette
    .map((swatch, i) => `  --color${i + 1}: ${swatch.color};`)
    .join("\n");
  const blob = new Blob([`:root {\n${css}\n}`], { type: "text/css" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "palette.css";
  a.click();
  URL.revokeObjectURL(url);
});

// Initial render
generatePalette();




