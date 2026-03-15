// ===== CONSTANTS =====

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const STORAGE_KEY = 'calendar_events';

const COLORS = ['blue', 'green', 'red', 'orange', 'purple'];

// ===== STATE =====

const state = {
  currentYear:  new Date().getFullYear(),
  currentMonth: new Date().getMonth(), // 0-indexed
  editingId:    null
};

// ===== STORAGE =====

function loadEvents() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveEvents(events) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

// ===== DATA (CRUD) =====

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function getEventsForMonth(year, month) {
  const prefix = `${year}-${String(month + 1).padStart(2, '0')}`;
  return loadEvents().filter(e => e.date.startsWith(prefix));
}

function getEventById(id) {
  return loadEvents().find(e => e.id === id) || null;
}

function createEvent(fields) {
  const events = loadEvents();
  const event = { id: generateId(), ...fields };
  events.push(event);
  saveEvents(events);
  return event;
}

function updateEvent(id, fields) {
  const events = loadEvents();
  const idx = events.findIndex(e => e.id === id);
  if (idx === -1) return null;
  events[idx] = { ...events[idx], ...fields };
  saveEvents(events);
  return events[idx];
}

function deleteEvent(id) {
  const events = loadEvents().filter(e => e.id !== id);
  saveEvents(events);
}

// ===== VALIDATION =====

function isValidDate(str) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(str)) return false;
  const [y, m, d] = str.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d;
}

function isValidTime(str) {
  if (!/^\d{2}:\d{2}$/.test(str)) return false;
  const [h, m] = str.split(':').map(Number);
  return h >= 0 && h <= 23 && m >= 0 && m <= 59;
}

function validateForm(fields) {
  const errors = [];

  const title = (fields.title || '').trim();
  if (!title) {
    errors.push('Title is required.');
  } else if (title.length > 100) {
    errors.push('Title must be 100 characters or fewer.');
  }

  if (!fields.date) {
    errors.push('Date is required.');
  } else if (!isValidDate(fields.date)) {
    errors.push('Date must be a valid date.');
  }

  if (fields.time && !isValidTime(fields.time)) {
    errors.push('Time must be in HH:MM format (00:00–23:59).');
  }

  if (!COLORS.includes(fields.color)) {
    errors.push('Please select a valid color.');
  }

  return { valid: errors.length === 0, errors };
}

// ===== RENDER =====

function updateHeaderLabel() {
  document.getElementById('month-year-label').textContent =
    `${MONTHS[state.currentMonth]} ${state.currentYear}`;
}

function renderEventsInCell(dateStr, cellEl) {
  const events = loadEvents().filter(e => e.date === dateStr);
  if (!events.length) return;

  const list = document.createElement('div');
  list.className = 'events-list';

  events.forEach(ev => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'event-chip';
    chip.dataset.eventId = ev.id;
    chip.dataset.color = ev.color;
    chip.textContent = ev.time ? `${ev.time} ${ev.title}` : ev.title;
    chip.setAttribute('aria-label', `Edit event: ${ev.title}`);
    list.appendChild(chip);
  });

  cellEl.appendChild(list);
}

function renderCalendar() {
  updateHeaderLabel();

  const grid = document.getElementById('calendar-grid');
  grid.innerHTML = '';

  const { currentYear: year, currentMonth: month } = state;
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  // Build 6-row grid (42 cells)
  for (let i = 0; i < 42; i++) {
    const cell = document.createElement('div');
    cell.className = 'day-cell';
    cell.setAttribute('role', 'gridcell');

    let dateStr;

    if (i < firstDay) {
      // Leading days from previous month
      const day = prevMonthDays - firstDay + 1 + i;
      const prevMonth = month === 0 ? 12 : month;
      const prevYear  = month === 0 ? year - 1 : year;
      dateStr = `${prevYear}-${String(prevMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      cell.classList.add('other-month');
    } else if (i >= firstDay + daysInMonth) {
      // Trailing days from next month
      const day = i - firstDay - daysInMonth + 1;
      const nextMonth = month === 11 ? 1 : month + 2;
      const nextYear  = month === 11 ? year + 1 : year;
      dateStr = `${nextYear}-${String(nextMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      cell.classList.add('other-month');
    } else {
      // Current month
      const day = i - firstDay + 1;
      dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }

    if (dateStr === todayStr) {
      cell.classList.add('today');
    }

    cell.dataset.date = dateStr;

    const dayNum = document.createElement('span');
    dayNum.className = 'day-number';
    dayNum.textContent = Number(dateStr.split('-')[2]);
    cell.appendChild(dayNum);

    renderEventsInCell(dateStr, cell);
    grid.appendChild(cell);
  }
}

// ===== MODAL =====

const modal    = document.getElementById('event-modal');
const form     = document.getElementById('event-form');
const errorBox = form.querySelector('.form-errors');

function showErrors(messages) {
  errorBox.innerHTML = `<ul>${messages.map(m => `<li>${m}</li>`).join('')}</ul>`;
}

function clearErrors() {
  errorBox.innerHTML = '';
}

function populateForm(event) {
  document.getElementById('field-id').value    = event.id;
  document.getElementById('field-title').value = event.title;
  document.getElementById('field-date').value  = event.date;
  document.getElementById('field-time').value  = event.time || '';
  document.getElementById('field-color').value = event.color || 'blue';
  document.getElementById('field-notes').value = event.notes || '';
}

function readForm() {
  return {
    title: document.getElementById('field-title').value,
    date:  document.getElementById('field-date').value,
    time:  document.getElementById('field-time').value,
    color: document.getElementById('field-color').value,
    notes: document.getElementById('field-notes').value.trim()
  };
}

function openModalForNew(dateStr) {
  state.editingId = null;
  form.reset();
  clearErrors();
  document.getElementById('field-id').value = '';
  if (dateStr) document.getElementById('field-date').value = dateStr;
  document.getElementById('btn-delete').style.display = 'none';
  document.getElementById('modal-title').textContent = 'Add Event';
  modal.showModal();
  document.getElementById('field-title').focus();
}

function openModalForEdit(id) {
  const event = getEventById(id);
  if (!event) return;
  state.editingId = id;
  clearErrors();
  populateForm(event);
  document.getElementById('btn-delete').style.display = '';
  document.getElementById('modal-title').textContent = 'Edit Event';
  modal.showModal();
  document.getElementById('field-title').focus();
}

function closeModal() {
  clearErrors();
  state.editingId = null;
  modal.close();
}

// ===== HANDLERS =====

function initHandlers() {

  // Month navigation
  document.getElementById('btn-prev').addEventListener('click', () => {
    if (state.currentMonth === 0) {
      state.currentMonth = 11;
      state.currentYear -= 1;
    } else {
      state.currentMonth -= 1;
    }
    renderCalendar();
  });

  document.getElementById('btn-next').addEventListener('click', () => {
    if (state.currentMonth === 11) {
      state.currentMonth = 0;
      state.currentYear += 1;
    } else {
      state.currentMonth += 1;
    }
    renderCalendar();
  });

  // FAB — open new event modal
  document.getElementById('btn-add-event').addEventListener('click', () => {
    openModalForNew();
  });

  // Calendar grid — delegated click
  document.getElementById('calendar-grid').addEventListener('click', e => {
    const chip = e.target.closest('[data-event-id]');
    if (chip) {
      e.stopPropagation();
      openModalForEdit(chip.dataset.eventId);
      return;
    }
    const cell = e.target.closest('.day-cell');
    if (cell) {
      openModalForNew(cell.dataset.date);
    }
  });

  // Form submit — create or update
  form.addEventListener('submit', e => {
    e.preventDefault();
    const fields = readForm();
    const { valid, errors } = validateForm(fields);
    if (!valid) {
      showErrors(errors);
      return;
    }
    if (state.editingId) {
      updateEvent(state.editingId, fields);
    } else {
      createEvent(fields);
    }
    closeModal();
    renderCalendar();
  });

  // Delete button
  document.getElementById('btn-delete').addEventListener('click', () => {
    if (!state.editingId) return;
    const event = getEventById(state.editingId);
    const name  = event ? `"${event.title}"` : 'this event';
    if (window.confirm(`Delete ${name}?`)) {
      deleteEvent(state.editingId);
      closeModal();
      renderCalendar();
    }
  });

  // Cancel button
  document.getElementById('btn-cancel').addEventListener('click', closeModal);

  // Backdrop click to close
  modal.addEventListener('click', e => {
    if (e.target === modal) closeModal();
  });
}

// ===== INIT =====

document.addEventListener('DOMContentLoaded', () => {
  initHandlers();
  renderCalendar();
});
