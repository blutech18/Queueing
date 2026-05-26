const serviceGrid = document.getElementById('serviceGrid');
const kioskMessage = document.getElementById('kioskMessage');
const subServiceModal = document.getElementById('subServiceModal');
const subServiceModalTitle = document.getElementById('subServiceModalTitle');
const subServiceOptions = document.getElementById('subServiceOptions');
const subServiceMessage = document.getElementById('subServiceMessage');
const subServiceProceed = document.getElementById('subServiceProceed');
const subServiceClear = document.getElementById('subServiceClear');
const subServiceCancel = document.getElementById('subServiceCancel');
const ticketModal = document.getElementById('ticketModal');
const ticketNumber = document.getElementById('ticketNumber');
const ticketService = document.getElementById('ticketService');
const ticketSubServices = document.getElementById('ticketSubServices');
const refreshServices = document.getElementById('refreshServices');
const printTicket = document.getElementById('printTicket');
const closeTicket = document.getElementById('closeTicket');

const SUB_SERVICE_CONFIG = {
  AD: {
    title: 'Choose AD Records Service',
    type: 'checkbox',
    options: [
      'Handling of Incoming Communication',
      'Handling of Outgoing Communication'
    ]
  },
  ESD: {
    title: 'Choose PMO Service (ESD)',
    type: 'checkbox',
    options: [
      'Issuance of No Objection FLA/MLA/MSA',
      'Application for Clearance to Develop',
      'Permit to Construct'
    ]
  },
  PMO: {
    title: 'Choose OPM Permits',
    type: 'checkbox',
    options: [
      'Accreditation of Port Service Provider',
      'Permit to Operate Ancillary Services',
      'Permit to Occupy (New & Renewal)',
      'Endorsement of Application for COR/PTO of Private Port',
      'Application for private port permit: issuance of CTD',
      'Application for private port issuance of permit to construct'
    ]
  },
  PR: {
    title: 'Select Remarks',
    type: 'select',
    options: [
      'ASSESSMENT',
      'ENCODING',
      'PAYMENT',
      'MARINE',
      'TERMINAL',
      'FD-Disbursement',
      'PSD-Safety',
      'PPD'
    ]
  },
  TR: {
    title: 'Choose PMO Service (PSD Terminal)',
    type: 'checkbox',
    options: [
      'Entry of Cargoes'
    ]
  },
  FD: {
    title: 'Choose PMO Service (FD-Disbursement)',
    type: 'checkbox',
    options: [
      '21. Releasing of Checks to Creditors, Supplier, PPA Employees, Contractors and Others Claimant'
    ]
  },
  PSD: {
    title: 'Choose PMO Service (Access Pass)',
    type: 'checkbox',
    options: [
      'Annual Vehicle Pass/Sticker',
      'Temporary Vehicle Pass/Sticker',
      'Pedestrian Annual Pass',
      'Temporary Pedestrian Pass'
    ]
  },
  AS: {
    title: 'Choose PMO Service (FD-Assessment)',
    type: 'checkbox',
    options: [
      'Vessel Departure Clearance',
      'Entry of Cargoes',
      'Withdrawal of Cargoes',
      'Revolving Fund Payment'
    ]
  },
  EN: {
    title: 'Choose PMO Service (PSD Encoding)',
    type: 'checkbox',
    options: [
      'Entry of Cargoes',
      'Withdrawal of Cargoes'
    ]
  },
  CA: {
    title: 'Choose Cashier Service',
    type: 'checkbox',
    topOptions: ['Vessel Departure Clearance'],
    options: [
      'Entry of Cargoes',
      'Withdrawal of Cargoes',
      'Repair and Hotworks',
      'Permit to Operate Ancillary Services',
      'Permit to Occupy (temporary) Short Term Lease',
      'Annual Vehicle Pass',
      'Temporary Vehicle Pass',
      'Pedestrian Annual Pass',
      'Temporary Pedestrian Pass',
      'Others'
    ]
  },
  MA: {
    title: 'Choose PMO Service (PSD Marine)',
    type: 'checkbox',
    options: [
      'Bunkering Services',
      'Repair and Hot Works',
      'Watering Services',
      'Vessel Entrance Formalities',
      'Vessel Departure Clearance'
    ]
  }
};

let pendingSubService = null;
let activeSubServiceType = 'checkbox';

function setMessage(text, isError = false) {
  kioskMessage.textContent = text;
  kioskMessage.classList.toggle('error', isError);
}

function setSubServiceMessage(text) {
  if (!text) {
    subServiceMessage.hidden = true;
    subServiceMessage.textContent = '';
    return;
  }

  subServiceMessage.hidden = false;
  subServiceMessage.textContent = text;
}

function getSubServiceConfig(service) {
  return SUB_SERVICE_CONFIG[service.code] || null;
}

function getSelectedSubServices() {
  if (activeSubServiceType === 'select') {
    const select = subServiceOptions.querySelector('select[name="subServiceOption"]');
    return select?.value ? [select.value] : [];
  }

  return [...subServiceOptions.querySelectorAll('input[name="subServiceOption"]:checked')].map(
    (input) => input.value
  );
}

function clearSubServiceSelection() {
  if (activeSubServiceType === 'select') {
    const select = subServiceOptions.querySelector('select[name="subServiceOption"]');
    if (select) select.selectedIndex = 0;
  } else {
    subServiceOptions.querySelectorAll('input[name="subServiceOption"]').forEach((input) => {
      input.checked = false;
    });
  }

  setSubServiceMessage('');
}

function renderCheckboxOption(label, featured = false) {
  return `
    <label class="records-option${featured ? ' records-option-featured' : ''}">
      <input type="checkbox" name="subServiceOption" value="${label}">
      <span>${label}</span>
    </label>
  `;
}

function renderSubServiceOptions(config) {
  const { type = 'checkbox', options = [], topOptions = [] } = config;
  activeSubServiceType = type;

  if (type === 'select') {
    subServiceOptions.innerHTML = `
      <label class="records-select-label" for="subServiceSelect">Remark</label>
      <select id="subServiceSelect" class="records-select" name="subServiceOption">
        <option value="">Select a remark...</option>
        ${options.map((label) => `<option value="${label}">${label}</option>`).join('')}
      </select>
    `;
    return;
  }

  if (topOptions.length) {
    const topHtml = topOptions.map((label) => renderCheckboxOption(label, true)).join('');
    const mainHtml = options.map((label) => renderCheckboxOption(label)).join('');
    const divider = options.length ? '<hr class="records-options-divider">' : '';

    subServiceOptions.innerHTML = `
      <div class="records-options-top">${topHtml}</div>
      ${divider}
      <div class="records-options-main">${mainHtml}</div>
    `;
    return;
  }

  subServiceOptions.innerHTML = options.map((label) => renderCheckboxOption(label)).join('');
}

function openSubServiceModal(service) {
  const config = getSubServiceConfig(service);
  if (!config) return;

  pendingSubService = service;
  subServiceModalTitle.textContent = config.title;
  subServiceOptions.classList.toggle('records-options-select', config.type === 'select');
  renderSubServiceOptions(config);
  setSubServiceMessage('');
  subServiceModal.showModal();
}

function closeSubServiceModal() {
  pendingSubService = null;
  activeSubServiceType = 'checkbox';
  clearSubServiceSelection();
  subServiceOptions.innerHTML = '';
  subServiceOptions.classList.remove('records-options-select');
  if (subServiceModal.open) subServiceModal.close();
}

function showTicket(queue, selectedSubServices = []) {
  ticketNumber.textContent = queue.queue_number;
  ticketService.textContent = queue.service_name;

  if (selectedSubServices.length) {
    ticketSubServices.innerHTML = selectedSubServices
      .map((label) => `<li>${label}</li>`)
      .join('');
    ticketSubServices.hidden = false;
  } else {
    ticketSubServices.innerHTML = '';
    ticketSubServices.hidden = true;
  }

  ticketModal.showModal();
}

function serviceCard(service) {
  const button = document.createElement('button');
  button.className = 'service-button';
  button.type = 'button';
  button.innerHTML = `
    <span class="service-icon">${globalThis.getServiceIcon(service.code, service.name)}</span>
    <span class="service-name">${service.name}</span>
  `;
  button.addEventListener('click', () => {
    if (getSubServiceConfig(service)) {
      openSubServiceModal(service);
      return;
    }

    createQueue(service.id);
  });
  return button;
}

async function loadServices() {
  setMessage('Loading services...');
  serviceGrid.innerHTML = '';

  try {
    const data = await globalThis.apiFetch('/api/services');
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

async function createQueue(serviceId, serviceDetail = '') {
  setMessage('Creating queue number...');

  try {
    const body = { serviceId };
    if (serviceDetail) body.serviceDetail = serviceDetail;

    const queue = await globalThis.apiFetch('/api/create-queue', {
      method: 'POST',
      body: JSON.stringify(body)
    });

    const selectedSubServices = serviceDetail
      ? serviceDetail.split('; ').filter(Boolean)
      : [];

    showTicket(queue, selectedSubServices);
    setMessage('');
  } catch (error) {
    setMessage(error.message, true);
  }
}

async function proceedSubServiceSelection() {
  const selectedSubServices = getSelectedSubServices();
  const config = pendingSubService ? getSubServiceConfig(pendingSubService) : null;

  if (!selectedSubServices.length) {
    setSubServiceMessage(
      config?.type === 'select'
        ? 'Please select a remark before proceeding.'
        : 'Please select at least one service before proceeding.'
    );
    return;
  }

  if (!pendingSubService) return;

  const service = pendingSubService;
  closeSubServiceModal();
  await createQueue(service.id, selectedSubServices.join('; '));
}

refreshServices.addEventListener('click', loadServices);
subServiceProceed.addEventListener('click', proceedSubServiceSelection);
subServiceClear.addEventListener('click', clearSubServiceSelection);
subServiceCancel.addEventListener('click', closeSubServiceModal);
subServiceModal.addEventListener('click', (event) => {
  if (event.target === subServiceModal) closeSubServiceModal();
});
printTicket.addEventListener('click', () => globalThis.print());
closeTicket.addEventListener('click', () => ticketModal.close());
ticketModal.addEventListener('click', (event) => {
  if (event.target === ticketModal) ticketModal.close();
});

await loadServices();
