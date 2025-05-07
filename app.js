const yearDropdown = document.getElementById("year");
const makeDropdown = document.getElementById("make");
const modelDropdown = document.getElementById("model");

// Load years from 1995 to current
const currentYear = new Date().getFullYear();
for (let y = currentYear; y >= 1995; y--) {
  const option = document.createElement("option");
  option.value = y;
  option.textContent = y;
  yearDropdown.appendChild(option);
}

// When Year changes, fetch Makes
yearDropdown.addEventListener("change", () => {
  const year = yearDropdown.value;

  makeDropdown.innerHTML = '<option value="">Loading...</option>';
  makeDropdown.disabled = true;
  modelDropdown.innerHTML = '<option value="">Select Model</option>';
  modelDropdown.disabled = true;

  fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/GetMakesForVehicleModelYear/modelyear/${year}?format=json`)
    .then(res => res.json())
    .then(data => {
      makeDropdown.innerHTML = '<option value="">Select Make</option>';
      data.Results.forEach(make => {
        const option = document.createElement("option");
        option.value = make.Make_Name;
        option.textContent = make.Make_Name;
        makeDropdown.appendChild(option);
      });
      makeDropdown.disabled = false;
    });
});

// When Make changes, fetch Models
makeDropdown.addEventListener("change", () => {
  const year = yearDropdown.value;
  const make = makeDropdown.value;

  modelDropdown.innerHTML = '<option value="">Loading...</option>';
  modelDropdown.disabled = true;

  fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMakeYear/make/${make}/modelyear/${year}?format=json`)
    .then(res => res.json())
    .then(data => {
      modelDropdown.innerHTML = '<option value="">Select Model</option>';
      data.Results.forEach(model => {
        const option = document.createElement("option");
        option.value = model.Model_Name;
        option.textContent = model.Model_Name;
        modelDropdown.appendChild(option);
      });
      modelDropdown.disabled = false;
    });
});
