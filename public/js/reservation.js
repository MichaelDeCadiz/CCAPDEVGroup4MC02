const daySelector = document.getElementById('daySelector');
const labSelector = document.getElementById('labSelector');
const seatGrid = document.getElementById('seatGrid');
const reserveBtn = document.getElementById('reserveBtn');
const reserveAnonBtn = document.getElementById('reserveAnonBtn');
const clearReservationsBtn = document.getElementById('clearReservationsBtn');

// Populate next 7 days
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

async function fetchReservations(lab, day) {
  const response = await fetch(`/api/reservations?lab=${lab}&day=${day}`);
  if (!response.ok) return {};
  return await response.json(); // returns { seatNumber: { reservedBy, anonymous } }
}

async function loadGrid() {
  const selectedOption = labSelector.options[labSelector.selectedIndex];
  if (!selectedOption || !selectedOption.dataset.rows || !selectedOption.dataset.columns) {
    seatGrid.innerHTML = '';
    return;
  }

  const lab = labSelector.value;
  const day = daySelector.value;
  const rows = parseInt(selectedOption.dataset.rows);
  const columns = parseInt(selectedOption.dataset.columns);

  const reservations = await fetchReservations(lab, day);
  seatGrid.innerHTML = '';

  for (let r = 0; r < rows; r++) {
    const rowDiv = document.createElement('div');
    rowDiv.className = 'd-flex justify-content-center gap-2 mb-2';

    for (let c = 0; c < columns; c++) {
      const seatId = `R${r + 1}C${c + 1}`;
      const seatBtn = document.createElement('button');
      seatBtn.className = 'btn btn-sm seat-btn';
      seatBtn.id = seatId;

      const res = reservations[seatId];
      if (res) {
        seatBtn.classList.add(res.anonymous ? 'btn-secondary' : 'btn-danger');
        seatBtn.textContent = res.anonymous ? 'A' : 'R';
        seatBtn.title = res.anonymous ? 'Anonymous' : res.reservedBy;
        seatBtn.disabled = true;
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

async function reserveSeats(anonymous = false) {
  const lab = labSelector.value;
  const day = daySelector.value;
  const seats = Array.from(document.querySelectorAll('.btn-primary')).map(btn => btn.id);

  if (seats.length === 0) return alert('No seats selected!');

  const formData = new URLSearchParams();
  formData.append('lab', lab);
  formData.append('day', day);
  formData.append('anonymous', anonymous);

  seats.forEach(seat => formData.append('seats', seat));

  const response = await fetch('/reserve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData.toString()
  });

  if (response.ok) {
    alert('Reservation successful!');
    loadGrid();
  } else {
    alert('Error reserving seats.');
  }
}

reserveBtn.onclick = () => reserveSeats(false);
reserveAnonBtn.onclick = () => reserveSeats(true);

clearReservationsBtn.onclick = () => {
  const selectedSeats = document.querySelectorAll('.btn-primary');

  if (selectedSeats.length === 0) {
    alert('No seats currently selected.');
    return;
  }

  selectedSeats.forEach(btn => {
    btn.classList.remove('btn-primary');
    btn.classList.add('btn-outline-success');
  });

  alert('Selected seats cleared.');
};

labSelector.onchange = loadGrid;
daySelector.onchange = loadGrid;
setTimeout(loadGrid, 100);