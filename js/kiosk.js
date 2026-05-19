const serviceGrid = document.getElementById('serviceGrid');
const kioskMessage = document.getElementById('kioskMessage');
const ticketModal = document.getElementById('ticketModal');
const ticketNumber = document.getElementById('ticketNumber');
const ticketService = document.getElementById('ticketService');
const refreshServices = document.getElementById('refreshServices');
const printTicket = document.getElementById('printTicket');
const closeTicket = document.getElementById('closeTicket');

async function apiFetch(url, options = {}) {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Request failed.');
  return data;
}

function setMessage(text, isError = false) {
  kioskMessage.textContent = text;
  kioskMessage.classList.toggle('error', isError);
}

function serviceCard(service) {
  const button = document.createElement('button');
  button.className = 'service-button';
  button.type = 'button';
  button.innerHTML = `
    <span class="service-code">${service.code}</span>
    <span class="service-name">${service.name}</span>
  `;
  button.addEventListener('click', () => createQueue(service.id));
  return button;
}

async function loadServices() {
  setMessage('Loading services...');
  serviceGrid.innerHTML = '';

  try {
    const data = await apiFetch('/api/services');
    if (!data.services.length) {
      serviceGrid.innerHTML = '<div class="card empty">No active services available.</div>';
      setMessage('');
      return;
    }

    data.services.forEach((service) => serviceGrid.appendChild(serviceCard(service)));
    setMessage('');
  } catch (error) {
    setMessage(error.message, true);
  }
}

async function createQueue(serviceId) {
  setMessage('Creating queue number...');

  try {
    const queue = await apiFetch('/api/create-queue', {
      method: 'POST',
      body: JSON.stringify({ serviceId })
    });

    ticketNumber.textContent = queue.queue_number;
    ticketService.textContent = queue.service_name;
    ticketModal.classList.add('open');
    setMessage('');
  } catch (error) {
    setMessage(error.message, true);
  }
}

refreshServices.addEventListener('click', loadServices);
printTicket.addEventListener('click', () => window.print());
closeTicket.addEventListener('click', () => ticketModal.classList.remove('open'));
ticketModal.addEventListener('click', (event) => {
  if (event.target === ticketModal) ticketModal.classList.remove('open');
});

loadServices();
