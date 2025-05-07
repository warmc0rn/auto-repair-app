const yearSelect = document.getElementById('year');
const makeSelect = document.getElementById('make');
const modelSelect = document.getElementById('model');
const trimSelect = document.getElementById('trim');
const submitBtn = document.getElementById('submit');
const vinBtn = document.getElementById('decode-vin');

// Load years
for (let y = 2024; y >= 1990; y--) {
  const option = document.createElement('option');
  option.value = y;
  option.textContent = y;
  yearSelect.appendChild(option);
}

yearSelect.addEventListener('change', async () => {
  const year = yearSelect.value;
  makeSelect.innerHTML = '<option value="">Loading...</option>';
  makeSelect.disabled = true;
  const res = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/GetMakesForVehicleType/car?format=json`);
  const data = await res.json();
  const makes = data.Results.map(m => m.MakeName).sort();
  makeSelect.innerHTML = '<option value="">Select Make</option>';
  makes.forEach(make => {
    const option = document.createElement('option');
    option.value = make;
    option.textContent = make;
    makeSelect.appendChild(option);
  });
  makeSelect.disabled = false;
});

makeSelect.addEventListener('change', async () => {
  const year = yearSelect.value;
  const make = makeSelect.value;
  modelSelect.innerHTML = '<option value="">Loading...</option>';
  modelSelect.disabled = true;
  const res = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMakeYear/make/${make}/modelyear/${year}?format=json`);
  const data = await res.json();
  const models = data.Results.map(m => m.Model_Name).sort();
  modelSelect.innerHTML = '<option value="">Select Model</option>';
  models.forEach(model => {
    const option = document.createElement('option');
    option.value = model;
    option.textContent = model;
    modelSelect.appendChild(option);
  });
  modelSelect.disabled = false;
});

// Dummy trim data for now
modelSelect.addEventListener('change', () => {
  trimSelect.innerHTML = '<option value="Base">Base</option><option value="Sport">Sport</option><option value="EX">EX</option>';
  trimSelect.disabled = false;
});

submitBtn.addEventListener('click', async () => {
  const year = yearSelect.value;
  const make = makeSelect.value;
  const model = modelSelect.value;
  const trim = trimSelect.value;

  const url = 'https://your-username.github.io/your-repo/data/vehicle_maintenance_data.json';
  try {
    const response = await fetch(url);
    const data = await response.json();
    const tasks = data?.[make]?.[model]?.[year]?.trim?.[trim]?.maintenance;

    const resultsContainer = document.getElementById('maintenance-results');
    resultsContainer.innerHTML = '';

    if (tasks && tasks.length > 0) {
      resultsContainer.innerHTML = '<h3>Maintenance Schedule:</h3>';
      const list = document.createElement('ul');
      tasks.forEach(item => {
        const li = document.createElement('li');
        li.textContent = `${item.interval} - ${item.task}`;
        list.appendChild(li);
      });
      resultsContainer.appendChild(list);
    } else {
      resultsContainer.innerHTML = '<p>No data found for this configuration.</p>';
    }
  } catch (err) {
    console.error('Failed to fetch maintenance data', err);
  }
});

vinBtn.addEventListener('click', async () => {
  const vin = document.getElementById('vin').value.trim();
  if (!vin) return;
  const res = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vin}?format=json`);
  const data = await res.json();
  const result = {};
  data.Results.forEach(item => {
    if (['Make', 'Model', 'Model Year', 'Trim'].includes(item.Variable)) {
      result[item.Variable] = item.Value;
    }
  });
  yearSelect.value = result['Model Year'] || '';
  makeSelect.innerHTML = `<option value="${result.Make}">${result.Make}</option>`;
  makeSelect.disabled = false;
  modelSelect.innerHTML = `<option value="${result.Model}">${result.Model}</option>`;
  modelSelect.disabled = false;
  trimSelect.innerHTML = `<option value="${result.Trim || 'Base'}">${result.Trim || 'Base'}</option>`;
  trimSelect.disabled = false;
});