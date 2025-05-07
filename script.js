const yearSelect = document.getElementById('year');
const makeSelect = document.getElementById('make');
const modelSelect = document.getElementById('model');
const trimSelect = document.getElementById('trim');
const vinInput = document.getElementById('vin');
const submitBtn = document.getElementById('submit-btn');
const resultsContainer = document.getElementById('maintenance-results');

// Populate year dropdown
for (let y = 2025; y >= 1990; y--) {
  const option = document.createElement('option');
  option.value = y;
  option.textContent = y;
  yearSelect.appendChild(option);
}

// Fetch vehicle data from NHTSA based on selection
yearSelect.addEventListener('change', async () => {
  const year = yearSelect.value;
  makeSelect.innerHTML = '<option value="">Select Make</option>';
  modelSelect.innerHTML = '<option value="">Select Model</option>';
  trimSelect.innerHTML = '<option value="">Select Trim</option>';
  makeSelect.disabled = modelSelect.disabled = trimSelect.disabled = true;

  if (!year) return;

  const res = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/GetMakesForVehicleType/car?format=json`);
  const data = await res.json();
  const makes = data.Results.map(m => m.MakeName).sort();
  makes.forEach(make => {
    const opt = document.createElement('option');
    opt.value = make;
    opt.textContent = make;
    makeSelect.appendChild(opt);
  });
  makeSelect.disabled = false;
});

makeSelect.addEventListener('change', async () => {
  const year = yearSelect.value;
  const make = makeSelect.value;
  modelSelect.innerHTML = '<option value="">Select Model</option>';
  trimSelect.innerHTML = '<option value="">Select Trim</option>';
  modelSelect.disabled = trimSelect.disabled = true;

  if (!make) return;

  const res = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMakeYear/make/${make}/modelyear/${year}?format=json`);
  const data = await res.json();
  const models = [...new Set(data.Results.map(m => m.Model_Name))].sort();
  models.forEach(model => {
    const opt = document.createElement('option');
    opt.value = model;
    opt.textContent = model;
    modelSelect.appendChild(opt);
  });
  modelSelect.disabled = false;
});

modelSelect.addEventListener('change', async () => {
  const year = yearSelect.value;
  const make = makeSelect.value;
  const model = modelSelect.value;
  trimSelect.innerHTML = '<option value="">Select Trim</option>';
  trimSelect.disabled = true;

  if (!model) return;

  const res = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/GetVehicleTypesForMakeModelYear/make/${make}/model/${model}/modelyear/${year}?format=json`);
  const data = await res.json();
  const trims = [...new Set(data.Results.map(v => v.VehicleTypeName))].sort();
  trims.forEach(trim => {
    const opt = document.createElement('option');
    opt.value = trim;
    opt.textContent = trim;
    trimSelect.appendChild(opt);
  });
  trimSelect.disabled = false;
});

// Submit button
submitBtn.addEventListener('click', async () => {
  resultsContainer.innerHTML = '';
  const vin = vinInput.value.trim();
  let make, model, year, trim;

  if (vin) {
    const res = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/${vin}?format=json`);
    const data = res.ok ? await res.json() : null;
    const info = data?.Results || [];

    year = info.find(x => x.Variable === "Model Year")?.Value;
    make = info.find(x => x.Variable === "Make")?.Value;
    model = info.find(x => x.Variable === "Model")?.Value;
    trim = info.find(x => x.Variable === "Trim")?.Value || "Base";
  } else {
    year = yearSelect.value;
    make = makeSelect.value;
    model = modelSelect.value;
    trim = trimSelect.value || "Base";
  }

  if (!year || !make || !model) {
    resultsContainer.innerHTML = '<p>Please select a complete vehicle.</p>';
    return;
  }

  const url = 'https://your-username.github.io/your-repo/data/vehicle_maintenance_data.json';
  try {
    const response = await fetch(url);
    const data = await response.json();
    const tasks = data?.[make]?.[model]?.[year]?.trim?.[trim]?.maintenance;

    if (Array.isArray(tasks) && tasks.length > 0) {
      resultsContainer.innerHTML = '<h3>Maintenance & Repair Tasks:</h3>';
      const list = document.createElement('ul');
      tasks.forEach(item => {
        const li = document.createElement('li');
        li.textContent = `${item.interval} miles - ${item.task}`;
        list.appendChild(li);
      });
      resultsContainer.appendChild(list);
    } else {
      resultsContainer.innerHTML = '<p>No maintenance data available for this vehicle.</p>';
    }
  } catch (err) {
    console.error(err);
    resultsContainer.innerHTML = '<p>Error retrieving maintenance data.</p>';
  }
});
