const displayQueue = document.getElementById('displayQueue');
const displayService = document.getElementById('displayService');
const displayCounter = document.getElementById('displayCounter');
const displayTime = document.getElementById('displayTime');
const recentList = document.getElementById('recentList');

function formatTime(value) {
  if (!value) return '--';
  return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function renderRecent(rows) {
  if (!rows.length) {
    recentList.innerHTML = '<p class="empty">No recent calls yet.</p>';
    return;
  }

  recentList.innerHTML = rows.map((queue) => `
    <div class="list-row">
      <div>
        <strong>${queue.queue_number}</strong><br>
        <small>${queue.service_name}</small>
      </div>
      <div>
        <span class="pill">Counter ${queue.counter_number || '--'}</span><br>
        <small>${formatTime(queue.called_at)}</small>
      </div>
    </div>
  `).join('');
}

async function loadServing() {
  try {
    const response = await fetch('/api/serving');
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Request failed.');

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
setInterval(loadServing, 3000);
