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
  const selectedOption = labSelector.options[labSelector.selectedIndex];
  
  // Check if a lab is selected and has data attributes
  if (!selectedOption || !selectedOption.dataset.rows || !selectedOption.dataset.columns) {
    seatGrid.innerHTML = '';
    return;
  }

  const lab = labSelector.value;
  const day = daySelector.value;
  const rows = parseInt(selectedOption.dataset.rows);
  const columns = parseInt(selectedOption.dataset.columns);
  
  const key = `${lab}-${day}`;
  const reservations = JSON.parse(localStorage.getItem(key)) || {};

  seatGrid.innerHTML = '';

  // Create the seat grid based on database values
  for (let r = 0; r < rows; r++) {
    const rowDiv = document.createElement('div');
    rowDiv.className = 'd-flex justify-content-center gap-2 mb-2';

    for (let c = 0; c < columns; c++) {
      const seatId = `R${r + 1}C${c + 1}`;
      const seatBtn = document.createElement('button');
      seatBtn.classList.add('btn', 'btn-sm', 'seat-btn');
      seatBtn.id = seatId;

      if (reservations[seatId]) {
        const res = reservations[seatId];
        seatBtn.classList.add(res.anonymous ? 'btn-secondary' : 'btn-danger');
        seatBtn.textContent = res.anonymous ? 'A' : 'R';
        seatBtn.title = res.anonymous ? 'Anonymous' : res.name;

        if (res.anonymous) {
          seatBtn.disabled = true;
        } else {
          seatBtn.style.cursor = 'pointer';
          seatBtn.onclick = () => {
            window.location.href = `profile.html?email=${encodeURIComponent(res.name)}`;
          };
        }
      } else {
        seatBtn.classList.add('btn-outline-success');
        seatBtn.textContent = seatId;
        seatBtn.onclick = () => {
          seatBtn.classList.toggle('btn-primary');
          seatBtn.classList.toggle('btn-outline-success');
        };
      }

      rowDiv.appendChild(seatBtn);
    }

    seatGrid.appendChild(rowDiv);
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
    if (!id || id.length < 4) return;
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
    if (!id || id.length < 4) return;
    reservations[id] = { name: currentUser, anonymous: true };
  });

  localStorage.setItem(key, JSON.stringify(reservations));
  alert('Anonymous reservation successful!');
  loadGrid();
};

document.getElementById('clearReservationsBtn').onclick = () => {
  const lab = labSelector.value;
  const day = daySelector.value;
  const key = `${lab}-${day}`;
  
  if (confirm('Are you sure you want to clear all reservations for this lab and day?')) {
    localStorage.removeItem(key);
    alert('All reservations cleared!');
    loadGrid();
  }
};

labSelector.onchange = loadGrid;
daySelector.onchange = loadGrid;

// Load grid after page loads
setTimeout(loadGrid, 100);