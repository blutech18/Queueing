const counterNumber = document.getElementById('counterNumber');
const serviceSelect = document.getElementById('serviceSelect');
const currentQueue = document.getElementById('currentQueue');
const currentService = document.getElementById('currentService');
const counterMessage = document.getElementById('counterMessage');
const nextBtn = document.getElementById('nextBtn');
const recallBtn = document.getElementById('recallBtn');
const skipBtn = document.getElementById('skipBtn');
const doneBtn = document.getElementById('doneBtn');

let activeQueue = null;

function setMessage(text, isError = false) {
  counterMessage.textContent = text;
  counterMessage.classList.toggle('error', isError);
}

function renderCurrent(queue) {
  activeQueue = queue;
  currentQueue.textContent = queue ? queue.queue_number : '---';
  currentService.textContent = queue ? `${queue.service_name} • Counter ${queue.counter_number}` : 'No active queue';
  recallBtn.disabled = !queue;
  skipBtn.disabled = !queue;
  doneBtn.disabled = !queue;
}

async function loadServices() {
  try {
    const data = await apiFetch('/api/services');
    serviceSelect.innerHTML = data.services
      .map((service) => `<option value="${service.id}">${service.name}</option>`)
      .join('');

    if (!data.services.length) {
      serviceSelect.innerHTML = '<option value="">No active services</option>';
      nextBtn.disabled = true;
      setMessage('No active services available.', true);
    }
  } catch (error) {
    setMessage(error.message, true);
  }
}

async function nextQueue() {
  if (!serviceSelect.value) return;
  setMessage('Calling next queue...');

  try {
    const queue = await apiFetch('/api/next-queue', {
      method: 'POST',
      body: JSON.stringify({
        serviceId: Number(serviceSelect.value),
        counterNumber: counterNumber.value
      })
    });

    renderCurrent(queue);
    setMessage('Queue called.');
  } catch (error) {
    setMessage(error.message, true);
  }
}

function recallQueue() {
  if (!activeQueue) return;
  setMessage(`Recalled ${activeQueue.queue_number}.`);
}

async function updateActiveQueue(status) {
  if (!activeQueue) return;

  try {
    await apiFetch('/api/update-queue', {
      method: 'POST',
      body: JSON.stringify({
        queueId: activeQueue.id,
        status,
        counterNumber: counterNumber.value
      })
    });

    setMessage(`${activeQueue.queue_number} marked as ${status}.`);
    renderCurrent(null);
  } catch (error) {
    setMessage(error.message, true);
  }
}

nextBtn.addEventListener('click', nextQueue);
recallBtn.addEventListener('click', recallQueue);
skipBtn.addEventListener('click', () => updateActiveQueue('skipped'));
doneBtn.addEventListener('click', () => updateActiveQueue('completed'));

renderCurrent(null);
loadServices();
