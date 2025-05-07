const yearDropdown = document.getElementById("year");
const makeDropdown = document.getElementById("make");
const modelDropdown = document.getElementById("model");
const trimDropdown = document.getElementById("trim");
const engineTypeDropdown = document.getElementById("engine-type");
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

// Load Makes when Year is selected
yearDropdown.addEventListener("change", () => {
  const year = yearDropdown.value;
  if (!year) return;

  makeDropdown.disabled = true;
  modelDropdown.disabled = true;
  trimDropdown.disabled = true;
  engineTypeDropdown.disabled = true;
  makeDropdown.innerHTML = '<option value="">Loading...</option>';
  modelDropdown.innerHTML = '<option value="">Select Model</option>';
  trimDropdown.innerHTML = '<option value="">Select Trim</option>';
  engineTypeDropdown.innerHTML = '<option value="">Select Engine Type</option>';

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
    })
    .catch(err => {
      console.error("Error loading makes:", err);
      makeDropdown.innerHTML = '<option value="">Error loading makes</option>';
    });
});

// Load Models when Make is selected
makeDropdown.addEventListener("change", () => {
  const year = yearDropdown.value;
  const make = makeDropdown.value;
  if (!year || !make) return;

  modelDropdown.disabled = true;
  trimDropdown.disabled = true;
  engineTypeDropdown.disabled = true;
  modelDropdown.innerHTML = '<option value="">Loading...</option>';
  trimDropdown.innerHTML = '<option value="">Select Trim</option>';
  engineTypeDropdown.innerHTML = '<option value="">Select Engine Type</option>';

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
    })
    .catch(err => {
      console.error("Error loading models:", err);
      modelDropdown.innerHTML = '<option value="">Error loading models</option>';
    });
});

// Load Trim and Engine Type when Model is selected
modelDropdown.addEventListener("change", () => {
  const year = yearDropdown.value;
  const make = makeDropdown.value;
  const model = modelDropdown.value;
  if (!year || !make || !model) return;

  trimDropdown.disabled = true;
  engineTypeDropdown.disabled = true;
  trimDropdown.innerHTML = '<option value="">Loading...</option>';
  engineTypeDropdown.innerHTML = '<option value="">Loading...</option>';

  // Replace with an actual API for trims and engine types
  // Example of hardcoded trims and engine types
  fetch(`https://example.com/api/vehicle-trims?year=${year}&make=${make}&model=${model}`)
    .then(res => res.json())
    .then(data => {
      trimDropdown.innerHTML = '<option value="">Select Trim</option>';
      engineTypeDropdown.innerHTML = '<option value="">Select Engine Type</option>';

      data.trims.forEach(trim => {
        const option = document.createElement("option");
        option.value = trim;
        option.textContent = trim;
        trimDropdown.appendChild(option);
      });

      data.engineTypes.forEach(engine => {
        const option = document.createElement("option");
        option.value = engine;
        option.textContent = engine;
        engineTypeDropdown.appendChild(option);
      });

      trimDropdown.disabled = false;
      engineTypeDropdown.disabled = false;
    })
    .catch(err => {
      console.error("Error loading trims and engine types:", err);
      trimDropdown.innerHTML = '<option value="">Error loading trims</option>';
      engineTypeDropdown.innerHTML = '<option value="">Error loading engine types</option>';
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
        alert("VIN lookup failed. Please check the VIN.");
        return;
      }

      // Set dropdowns based on VIN result
      yearDropdown.value = year;

      makeDropdown.innerHTML = `<option value="${make}">${make}</option>`;
      makeDropdown.disabled = false;

      modelDropdown.innerHTML = `<option value="${model}">${model}</option>`;
      modelDropdown.disabled = false;

      // Load trims and engine types
      trimDropdown.disabled = true;
      engineTypeDropdown.disabled = true;
      fetch(`https://example.com/api/vehicle-trims?year=${year}&make=${make}&model=${model}`)
        .then(res => res.json())
        .then(data => {
          trimDropdown.innerHTML = '<option value="">Select Trim</option>';
          engineTypeDropdown.innerHTML = '<option value="">Select Engine Type</option>';

          data.trims.forEach(trim => {
            const option = document.createElement("option");
            option.value = trim;
            option.textContent = trim;
            trimDropdown.appendChild(option);
          });

          data.engineTypes.forEach(engine => {
            const option = document.createElement("option");
            option.value = engine;
            option.textContent = engine;
            engineTypeDropdown.appendChild(option);
          });

          trimDropdown.disabled = false;
          engineTypeDropdown.disabled = false;
        })
        .catch(err => {
          console.error("Error loading trims and engine types:", err);
          trimDropdown.innerHTML = '<option value="">Error loading trims</option>';
          engineTypeDropdown.innerHTML = '<option value="">Error loading engine types</option>';
        });
    })
    .catch(err => {
      console.error("Error decoding VIN:", err);
      alert("Failed to decode VIN.");
    });
});
