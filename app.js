const yearDropdown = document.getElementById("year");
const makeDropdown = document.getElementById("make");
const modelDropdown = document.getElementById("model");

// Load years 1995–current
const currentYear = new Date().getFullYear();
for (let y = currentYear; y >= 1995; y--) {
  const opt = document.createElement("option");
  opt.value = y;
  opt.textContent = y;
  yearDropdown.appendChild(opt);
}

// Fetch Makes when Year changes
yearDropdown.addEventListener("change", () => {
  const year = yearDropdown.value;
  if (!year) return;

  makeDropdown.disabled = true;
  modelDropdown.disabled = true;
  makeDropdown.innerHTML = '<option value="">Loading...</option>';
  modelDropdown.innerHTML = '<option value="">Select Model</option>';

  fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/GetMakesForVehicleModelYear/modelyear/${year}?format=json`)
    .then(res => res.json())
    .then(data => {
      makeDropdown.innerHTML = '<option value="">Select Make</option>';
      data.Results.forEach(make => {
        const opt = document.createElement("option");
        opt.value = make.Make_Name;
        opt.textContent = make.Make_Name;
        makeDropdown.appendChild(opt);
      });
      makeDropdown.disabled = false;
    });
});

// Fetch Models when Make changes
makeDropdown.addEventListener("change", () => {
  const year = yearDropdown.value;
  const make = makeDropdown.value;
  if (!year || !make) return;

  modelDropdown.disabled = true;
  modelDropdown.innerHTML = '<option value="">Loading...</option>';

  fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMakeYear/make/${make}/modelyear/${year}?format=json`)
    .then(res => res.json())
    .then(data => {
      modelDropdown.innerHTML = '<option value="">Select Model</option>';
      data.Results.forEach(model => {
        const opt = document.createElement("option");
        opt.value = model.Model_Name;
        opt.textContent = model.Model_Name;
        modelDropdown.appendChild(opt);
      });
      modelDropdown.disabled = false;
    });
});
