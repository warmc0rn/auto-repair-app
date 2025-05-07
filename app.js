const yearDropdown = document.getElementById("year");
const makeDropdown = document.getElementById("make");
const modelDropdown = document.getElementById("model");
const vinInput = document.getElementById("vin");
const lookupVinBtn = document.getElementById("lookupVin");

// Populate Year dropdown
const currentYear = new Date().getFullYear();
for (let y = currentYear; y >= 1995; y--) {
  const option = document.createElement("option");
  option.value = y;
  option.textContent = y;
  yearDropdown.appendChild(option);
}

// When user selects a year, load makes
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
        const option = document.createElement("option");
        option.value = make.Make_Name;
        option.textContent = make.Make_Name;
        makeDropdown.appendChild(option);
      });
      makeDropdown.disabled = false;
    });
});

// When user selects a make, load models
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
        const option = document.createElement("option");
        option.value = model.Model_Name;
        option.textContent = model.Model_Name;
        modelDropdown.appendChild(option);
      });
      modelDropdown.disabled = false;
    });
});

// VIN Lookup
lookupVinBtn.addEventListener("click", () => {
  const vin = vinInput.value.trim().toUpperCase();
  if (vin.length !== 17) {
    alert("Please enter a valid 17-digit VIN.");
    return;
  }

  fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/decodevinvalues/${vin}?format=json`)
    .then(res => res.json())
    .then(data => {
      const result = data.Results[0];
      const year = result.ModelYear;
      const make = result.Make;
      const model = result.Model;

      if (!year || !make || !model) {
        alert("VIN lookup failed. Please check the number.");
        return;
      }

      yearDropdown.value = year;
      makeDropdown.innerHTML = `<option value="${make}">${make}</option>`;
      makeDropdown.disabled = false;
      modelDropdown.innerHTML = `<option value="${model}">${model}</option>`;
      modelDropdown.disabled = false;
    })
    .catch(err => {
      alert("Error decoding VIN.");
      console.error(err);
    });
});
