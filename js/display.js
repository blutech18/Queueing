const displayQueue = document.getElementById('displayQueue');
const displayService = document.getElementById('displayService');
const displayCounter = document.getElementById('displayCounter');
const displayTime = document.getElementById('displayTime');
const recentList = document.getElementById('recentList');
const recentScroll = document.getElementById('recentScroll');

function formatTime(value) {
  if (!value) return '--';
  return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function scrollRecentToBottom() {
  if (!recentScroll) return;
  requestAnimationFrame(() => {
    recentScroll.scrollTop = recentScroll.scrollHeight;
  });
}

function renderRecent(rows) {
  const ordered = [...rows].reverse();

  if (!ordered.length) {
    recentList.innerHTML = '<p class="empty">No recent calls yet.</p>';
    scrollRecentToBottom();
    return;
  }

  recentList.innerHTML = ordered.map((queue) => `
    <div class="list-row">
      <div class="list-row-main">
        <strong>${queue.queue_number}</strong>
        <small>${queue.service_name}</small>
      </div>
      <div class="list-row-meta">
        <span class="pill">Counter ${queue.counter_number || '--'}</span>
        <small class="list-row-time">${formatTime(queue.called_at)}</small>
      </div>
    </div>
  `).join('');
  scrollRecentToBottom();
}

async function loadServing() {
  try {
    const data = await apiFetch('/api/serving');

    const current = data.serving[0];
    displayQueue.textContent = current ? current.queue_number : '---';
    displayService.textContent = current ? current.service_name : 'Waiting for next call';
    displayCounter.textContent = current ? `Counter ${current.counter_number || '--'}` : 'Counter --';
    displayTime.textContent = current ? formatTime(current.called_at) : '--';
    renderRecent(data.recent || []);
  } catch (error) {
    displayService.textContent = error.message;
    recentList.innerHTML = '';
  }
}

loadServing();
if (window.location.protocol !== 'file:') {
  setInterval(loadServing, 3000);
}
