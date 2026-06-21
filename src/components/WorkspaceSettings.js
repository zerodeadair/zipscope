function settingIcon() {
  return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 15.5A3.5 3.5 0 1 0 12 8a3.5 3.5 0 0 0 0 7.5ZM19 13.5l2 1.5-2 3.5-2.4-1a8 8 0 0 1-2.1 1.2L14.2 21h-4.4l-.3-2.3a8 8 0 0 1-2.1-1.2l-2.4 1L3 15l2-1.5a8 8 0 0 1 0-3L3 9l2-3.5 2.4 1a8 8 0 0 1 2.1-1.2L9.8 3h4.4l.3 2.3a8 8 0 0 1 2.1 1.2l2.4-1L21 9l-2 1.5a8 8 0 0 1 0 3Z"/></svg>`;
}

function segmented(label, field, value, options) {
  return `<fieldset class="settingsGroup">
    <legend>${label}</legend>
    <div class="settingsSegments">${options.map(([option, text]) => `<button type="button" class="${value === option ? "active" : ""}" data-setting="${field}" data-setting-value="${option}" aria-pressed="${value === option}">${text}</button>`).join("")}</div>
  </fieldset>`;
}

export function SettingsButton(settings) {
  const changed = settings.density !== "comfortable"
    || settings.cardView !== "grid"
    || Number(settings.fontScale) !== 120
    || settings.contrast !== "normal"
    || settings.motion !== "system";
  return `<button type="button" class="settingsButton ${changed ? "customized" : ""}" data-settings-open aria-label="Open display and accessibility settings">${settingIcon()}<span>Display</span>${changed ? "<b></b>" : ""}</button>`;
}

export function WorkspaceSettings(open, settings) {
  if (!open) return "";
  return `<div class="featureModalBackdrop settingsBackdrop" data-settings-close>
    <section class="featureModal workspaceSettings" data-settings-stop role="dialog" aria-modal="true" aria-labelledby="settings-title">
      <header class="featureModalHeader">
        <div><span>Personal workspace</span><h2 id="settings-title">Display & Accessibility</h2><p>Make ScratchScope denser, calmer, larger, or easier to scan. Preferences stay on this device.</p></div>
        <button type="button" class="iconBtn" data-settings-close aria-label="Close display settings">&times;</button>
      </header>
      <div class="settingsPreview" data-preview-density="${settings.density}">
        <span>${settingIcon()}</span>
        <div><strong>Your workspace</strong><small>${settings.density} density · ${settings.cardView} tickets · ${settings.fontScale}% type</small></div>
      </div>
      <div class="settingsGrid">
        ${segmented("Information density", "density", settings.density, [["comfortable", "Comfortable"], ["compact", "Compact"], ["executive", "Executive"]])}
        ${segmented("Ticket layout", "cardView", settings.cardView, [["grid", "Visual Grid"], ["list", "Data List"]])}
        ${segmented("Reading zoom", "fontScale", String(settings.fontScale), [["100", "100%"], ["110", "110%"], ["120", "120% Recommended"], ["130", "130%"]])}
        ${segmented("Contrast", "contrast", settings.contrast, [["normal", "Balanced"], ["high", "High Contrast"]])}
        ${segmented("Motion", "motion", settings.motion, [["system", "System"], ["full", "Full"], ["reduced", "Reduced"]])}
        ${segmented("Ambient lighting", "ambient", String(settings.ambient), [["true", "On"], ["false", "Off"]])}
      </div>
      <footer class="settingsFooter">
        <button type="button" class="secondaryBtn" data-settings-reset>Reset defaults</button>
        <button type="button" class="primaryBtn" data-settings-close>Done</button>
      </footer>
    </section>
  </div>`;
}
