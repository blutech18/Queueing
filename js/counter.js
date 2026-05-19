const counterNumber = document.getElementById('counterNumber');
const serviceSelect = document.getElementById('serviceSelect');
const saveSetupBtn = document.getElementById('saveSetupBtn');
const currentQueue = document.getElementById('currentQueue');
const currentService = document.getElementById('currentService');
const counterMessage = document.getElementById('counterMessage');
const nextBtn = document.getElementById('nextBtn');
const recallBtn = document.getElementById('recallBtn');
const skipBtn = document.getElementById('skipBtn');
const doneBtn = document.getElementById('doneBtn');

const STORAGE_KEY = 'queueing-counter-setup';

let activeQueue = null;
let setupSaved = false;

function setMessage(text, isError = false) {
  counterMessage.textContent = text;
  counterMessage.classList.toggle('error', isError);
}

function setSetupSaved(saved) {
  setupSaved = saved;
  const hasService = Boolean(serviceSelect.value);
  nextBtn.disabled = !saved || !hasService;
  recallBtn.disabled = !saved || !activeQueue;
  skipBtn.disabled = !saved || !activeQueue;
  doneBtn.disabled = !saved || !activeQueue;
}

function renderCurrent(queue) {
  activeQueue = queue;
  currentQueue.textContent = queue ? queue.queue_number : '---';
  currentService.textContent = queue
    ? `${queue.service_name} • Counter ${queue.counter_number}`
    : setupSaved
      ? `${serviceSelect.selectedOptions[0]?.text || 'Service'} • Counter ${counterNumber.value}`
      : 'Save counter setup to begin';
  setSetupSaved(setupSaved);
}

function restoreSetupFields() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (!saved) return null;
    if (saved.counterNumber) counterNumber.value = saved.counterNumber;
    return saved;
  } catch {
    return null;
  }
}

async function saveSetup() {
  if (!serviceSelect.value) {
    setMessage('Select a service.', true);
    return;
  }

  setMessage('Loading counter setup...');

  try {
    const params = new URLSearchParams({
      serviceId: serviceSelect.value,
      counterNumber: counterNumber.value
    });
    const data = await apiFetch(`/api/counter-current?${params}`);

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        serviceId: serviceSelect.value,
        counterNumber: counterNumber.value
      })
    );

    setupSaved = true;
    renderCurrent(data.queue);
    setMessage(
      data.queue
        ? `Now serving ${data.queue.queue_number}.`
        : 'Setup saved. Press Next to call the first queue.'
    );
  } catch (error) {
    setMessage(error.message, true);
  }
}

function onSetupChange() {
  if (!setupSaved) return;
  setupSaved = false;
  renderCurrent(null);
  setMessage('Counter or service changed. Click Save to update.', false);
}

async function loadServices() {
  try {
    const data = await apiFetch('/api/services');
    serviceSelect.innerHTML = data.services
      .map((service) => `<option value="${service.id}">${service.name}</option>`)
      .join('');

    if (!data.services.length) {
      serviceSelect.innerHTML = '<option value="">No active services</option>';
      setSetupSaved(false);
      setMessage('No active services available.', true);
      return;
    }

    const saved = restoreSetupFields();
    if (saved?.serviceId) {
      serviceSelect.value = String(saved.serviceId);
      await saveSetup();
    } else {
      setSetupSaved(false);
      renderCurrent(null);
      setMessage('Select counter and service, then click Save.', false);
    }
  } catch (error) {
    setMessage(error.message, true);
  }
}

async function nextQueue() {
  if (!setupSaved || !serviceSelect.value) return;
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

saveSetupBtn.addEventListener('click', saveSetup);
counterNumber.addEventListener('change', onSetupChange);
serviceSelect.addEventListener('change', onSetupChange);
nextBtn.addEventListener('click', nextQueue);
recallBtn.addEventListener('click', recallQueue);
skipBtn.addEventListener('click', () => updateActiveQueue('skipped'));
doneBtn.addEventListener('click', () => updateActiveQueue('completed'));

setSetupSaved(false);
renderCurrent(null);
loadServices();
