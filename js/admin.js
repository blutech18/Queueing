const statsGrid = document.getElementById('statsGrid');
const serviceList = document.getElementById('serviceList');
const queueRows = document.getElementById('queueRows');
const refreshAdmin = document.getElementById('refreshAdmin');
const adminMessage = document.getElementById('adminMessage');

function setMessage(text, isError = false) {
  adminMessage.textContent = text;
  adminMessage.classList.toggle('error', isError);
}

function formatDate(value) {
  if (!value) return '--';
  return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function renderStats(stats) {
  const items = [
    ['Total', stats.total],
    ['Waiting', stats.waiting],
    ['Serving', stats.serving],
    ['Completed', stats.completed],
    ['Skipped', stats.skipped]
  ];

  statsGrid.innerHTML = items.map(([label, value]) => `
    <div class="card stat">
      <span>${label}</span>
      <strong>${value || 0}</strong>
    </div>
  `).join('');
}

function renderQueues(queues) {
  if (!queues.length) {
    queueRows.innerHTML = '<tr><td colspan="5">No queue records today.</td></tr>';
    return;
  }

  queueRows.innerHTML = queues.map((queue) => `
    <tr>
      <td><strong>${queue.queue_number}</strong></td>
      <td>${queue.service_name}</td>
      <td><span class="status">${queue.status}</span></td>
      <td>${queue.counter_number || '--'}</td>
      <td>${formatDate(queue.created_at)}</td>
    </tr>
  `).join('');
}

function renderServices(services) {
  serviceList.innerHTML = services.map((service) => `
    <div class="list-row">
      <div>
        <strong>${service.name}</strong><br>
        <small>${service.code}</small>
      </div>
      <label class="toggle-row">
        <input class="switch" type="checkbox" data-service-id="${service.id}" ${service.is_active ? 'checked' : ''}>
        Active
      </label>
    </div>
  `).join('');

  serviceList.querySelectorAll('input[type="checkbox"]').forEach((input) => {
    input.addEventListener('change', () => toggleService(Number(input.dataset.serviceId), input.checked));
  });
}

async function loadAdmin() {
  setMessage('Loading admin data...');

  try {
    const [statsData, servicesData] = await Promise.all([
      apiFetch('/api/admin-stats'),
      apiFetch('/api/services?includeInactive=true')
    ]);

    renderStats(statsData.stats);
    renderQueues(statsData.queues);
    renderServices(servicesData.services);
    setMessage('');
  } catch (error) {
    setMessage(error.message, true);
  }
}

async function toggleService(id, isActive) {
  try {
    await apiFetch('/api/services', {
      method: 'PATCH',
      body: JSON.stringify({ id, isActive })
    });
    setMessage('Service updated.');
  } catch (error) {
    setMessage(error.message, true);
    loadAdmin();
  }
}

refreshAdmin.addEventListener('click', loadAdmin);
loadAdmin();
if (window.location.protocol !== 'file:') {
  setInterval(loadAdmin, 10000);
}
