function activityIcon(type) {
  const paths = {
    refresh: "M20 7v5h-5M4 17v-5h5M6.1 9a7 7 0 0 1 11.2-2.1L20 12M4 12l2.7 5.1A7 7 0 0 0 17.9 15",
    save: "M5 4h14v16l-7-4-7 4V4Z",
    pin: "m9 4 6 0 1 6 3 3H5l3-3 1-6Zm3 9v7",
    compare: "M4 7h7v7H4V7Zm9 3h7v7h-7v-7Z",
    export: "M12 3v12m-4-4 4 4 4-4M5 19h14",
    location: "M12 21s7-5.2 7-12a7 7 0 1 0-14 0c0 6.8 7 12 7 12Zm0-9a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
    view: "M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6Zm9 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
  };
  return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[type] || paths.view}"/></svg>`;
}

function relativeTime(value) {
  const timestamp = new Date(value).getTime();
  if (!Number.isFinite(timestamp)) return "Recently";
  const seconds = Math.max(0, Math.round((Date.now() - timestamp) / 1000));
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export function ActivityButton(items = []) {
  const unread = items.filter((item) => !item.read).length;
  return `<button type="button" class="activityButton" data-activity-open aria-label="Open activity center">${activityIcon("view")}<span>Activity</span>${unread ? `<b>${Math.min(9, unread)}</b>` : ""}</button>`;
}

export function ActivityCenter(open, items = [], online = true) {
  if (!open) return "";
  return `<div class="activityBackdrop" data-activity-close>
    <aside class="activityCenter" data-activity-stop role="dialog" aria-modal="true" aria-labelledby="activity-title">
      <header>
        <div><span class="networkState ${online ? "online" : "offline"}"><i></i>${online ? "Online" : "Offline"}</span><h2 id="activity-title">Activity Center</h2><p>Your local research trail and workspace events.</p></div>
        <button type="button" data-activity-close aria-label="Close activity center">&times;</button>
      </header>
      <div class="activitySummary">
        <article><strong>${items.length}</strong><span>Recent events</span></article>
        <article><strong>${items.filter((item) => item.type === "save").length}</strong><span>Save actions</span></article>
        <article><strong>${items.filter((item) => item.type === "view").length}</strong><span>Views</span></article>
      </div>
      <div class="activityFeed">
        ${items.length ? items.slice(0, 30).map((item) => `${item.gameId ? `<button type="button" class="activityItem" data-activity-game="${item.gameId}">` : `<article class="activityItem">`}
          <i>${activityIcon(item.type)}</i>
          <span><strong>${item.title}</strong><small>${item.detail}</small></span>
          <time>${relativeTime(item.at)}</time>
        ${item.gameId ? "</button>" : "</article>"}`).join("") : `<div class="activityEmpty"><strong>Your research trail starts here.</strong><span>Open a ticket, save a game, refresh data, or create an export.</span></div>`}
      </div>
      <footer><button type="button" data-activity-clear ${items.length ? "" : "disabled"}>Clear history</button><span>Stored only on this device</span></footer>
    </aside>
  </div>`;
}
