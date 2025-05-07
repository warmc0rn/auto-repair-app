const apiKey = "83656df82b8e11f098a60242ac120002";

const yearSelect = document.getElementById("year");
const makeSelect = document.getElementById("make");
const modelSelect = document.getElementById("model");
const trimSelect = document.getElementById("trim");
const form = document.getElementById("vehicle-form");
const results = document.getElementById("maintenance-results");

// Populate years
for (let y = new Date().getFullYear(); y >= 1990; y--) {
  const option = document.createElement("option");
  option.value = y;
  option.textContent = y;
  yearSelect.appendChild(option);
}

yearSelect.addEventListener("change", async () => {
  makeSelect.innerHTML = "<option>Loading...</option>";
  makeSelect.disabled = true;

  const res = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/GetMakesForVehicleType/car?format=json`);
  const data = await res.json();
  const makes = data.Results.map(item => item.MakeName).sort();

  makeSelect.innerHTML = `<option value="">Select Make</option>`;
  makes.forEach(make => {
    const opt = document.createElement("option");
    opt.value = make;
    opt.textContent = make;
    makeSelect.appendChild(opt);
  });
  makeSelect.disabled = false;
});

makeSelect.addEventListener("change", async () => {
  const year = yearSelect.value;
  const make = makeSelect.value;
  modelSelect.innerHTML = "<option>Loading...</option>";
  modelSelect.disabled = true;

  const res = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMakeYear/make/${make}/modelyear/${year}?format=json`);
  const data = await res.json();
  const models = data.Results.map(item => item.Model_Name).sort();

  modelSelect.innerHTML = `<option value="">Select Model</option>`;
  models.forEach(model => {
    const opt = document.createElement("option");
    opt.value = model;
    opt.textContent = model;
    modelSelect.appendChild(opt);
  });
  modelSelect.disabled = false;
});

modelSelect.addEventListener("change", async () => {
  // Here you could populate trims with a real trim API if needed
  trimSelect.innerHTML = `<option value="Base">Base</option>`;
  trimSelect.disabled = false;
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const year = yearSelect.value;
  const make = makeSelect.value;
  const model = modelSelect.value;
  const trim = trimSelect.value;

  results.innerHTML = "<p>Fetching maintenance schedule...</p>";

  const url = `https://api.vehicledatabases.com/maintenance?year=${year}&make=${make}&model=${model}&trim=${trim}`;
  const res = await fetch(url, {
    headers: {
      "x-api-key": apiKey
    }
  });

  const data = await res.json();

  if (data.status === "success") {
    let html = "<h2>Maintenance Schedule</h2>";
    data.data.maintenance[0].maintenance.forEach(item => {
      html += `<h3>${item.mileage} miles (${item.conditions.join(", ")})</h3><ul>`;
      item.menus.forEach(task => {
        html += `<li>${task}</li>`;
      });
      html += "</ul>";
    });
    results.innerHTML = html;
  } else {
    results.innerHTML = "<p>No maintenance data found.</p>";
  }
});
