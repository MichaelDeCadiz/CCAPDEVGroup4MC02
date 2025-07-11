const rows = 'ABCD';
const cols = 9;
const currentUser = 'student@example.com'; // sample
const daySelector = document.getElementById('daySelector');
const labSelector = document.getElementById('labSelector');
const seatGrid = document.getElementById('seatGrid');
const reserveBtn = document.getElementById('reserveBtn');


// Populate 7day dropdown
const today = new Date();
for (let i = 0; i < 7; i++) {
  const date = new Date(today);
  date.setDate(date.getDate() + i);
  const label = date.toLocaleDateString('en-PH', { weekday: 'short', month: 'short', day: 'numeric' });
  const option = document.createElement('option');
  option.value = date.toISOString().split('T')[0];
  option.textContent = label;
  daySelector.appendChild(option);
}

function loadGrid() {
  const lab = labSelector.value;
  const day = daySelector.value;
  const key = `${lab}-${day}`;
  const reservations = JSON.parse(localStorage.getItem(key)) || {};

  seatGrid.innerHTML = '';

  // Column labels
  const headerRow = document.createElement('div');
  headerRow.classList.add('mb-2');
  headerRow.innerHTML = `<span style="display:inline-block;width:45px;"></span>`;
  for (let c = 1; c <= cols; c++) {
    const colLabel = document.createElement('span');
    colLabel.textContent = c;
    colLabel.style.display = 'inline-block';
    colLabel.style.width = '45px';
    colLabel.style.textAlign = 'center';
    headerRow.appendChild(colLabel);

    // to seperate every 3 columns
    if (c % 3 === 0 && c !== cols) {
      const spacer = document.createElement('span');
      spacer.style.display = 'inline-block';
      spacer.style.width = '20px';
      headerRow.appendChild(spacer);
    }
  }

  seatGrid.appendChild(headerRow);

  // Row-by-row seat buttons
  for (let r = 0; r < rows.length; r++) {
    const row = document.createElement('div');
    row.classList.add('mb-2');

    // Row label
    const rowLabel = document.createElement('span');
    rowLabel.textContent = rows[r];
    rowLabel.style.display = 'inline-block';
    rowLabel.style.width = '45px';
    rowLabel.style.textAlign = 'center';
    row.appendChild(rowLabel);

    for (let c = 1; c <= cols; c++) {
      const seatId = `${rows[r]}${c}`;
      const seat = document.createElement('button');
      seat.classList.add('btn', 'btn-sm', 'me-1', 'mb-1');

    if (reservations[seatId]) {
      const res = reservations[seatId];

      seat.classList.add(res.anonymous ? 'btn-secondary' : 'btn-danger');
      seat.textContent = res.anonymous ? 'A' : 'R';
      seat.title = res.anonymous ? 'Anonymous' : res.name;

    if (res.anonymous) {
      seat.disabled = true;
    } else {
      seat.style.cursor = 'pointer';
      seat.onclick = () => {
        window.location.href = `profile.html?email=${encodeURIComponent(res.name)}`;
      };
    }
    } else {
      seat.classList.add('btn-outline-success');
      seat.textContent = seatId;
      seat.onclick = () => seat.classList.toggle('btn-primary');
    }

      seat.id = seatId;
      row.appendChild(seat);

      if (c % 3 === 0 && c !== cols) {
        const spacer = document.createElement('span');
        spacer.style.display = 'inline-block';
        spacer.style.width = '20px';
        row.appendChild(spacer);
      }
    }

    seatGrid.appendChild(row);
  }
}

reserveBtn.onclick = () => {
  const lab = labSelector.value;
  const day = daySelector.value;
  const key = `${lab}-${day}`;
  const reservations = JSON.parse(localStorage.getItem(key)) || {};
  const seats = document.querySelectorAll('.btn-primary');
  if (seats.length === 0) return alert('No seats selected!');

  seats.forEach(btn => {
    const id = btn.id;
    if (!id || id.length < 2) return;
    reservations[id] = { name: currentUser, anonymous: false };
  });

  localStorage.setItem(key, JSON.stringify(reservations));
  alert('Reservation successful!');
  loadGrid();
};

document.getElementById('reserveAnonBtn').onclick = () => {
  const lab = labSelector.value;
  const day = daySelector.value;
  const key = `${lab}-${day}`;
  const reservations = JSON.parse(localStorage.getItem(key)) || {};
  const seats = document.querySelectorAll('.btn-primary');
  if (seats.length === 0) return alert('No seats selected!');

  seats.forEach(btn => {
    const id = btn.id;
    if (!id || id.length < 2) return;
    reservations[id] = { name: currentUser, anonymous: true };
  });

  localStorage.setItem(key, JSON.stringify(reservations));
  alert('Anonymous reservation successful!');
  loadGrid();
};

labSelector.onchange = loadGrid;
daySelector.onchange = loadGrid;

setTimeout(loadGrid, 100);
