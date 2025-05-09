// Helper to sort select options alphabetically
function sortSelectOptions(selectElement) {
  const options = Array.from(selectElement.options)
    .filter(option => option.value)
    .sort((a, b) => a.text.localeCompare(b.text));
  selectElement.innerHTML = '<option value="">Select ' + selectElement.id.charAt(0).toUpperCase() + selectElement.id.slice(1) + '</option>';
  options.forEach(option => selectElement.appendChild(option));
}

// Example usage after populating dropdowns
function populateMakes(year) {
  const makeSelect = document.getElementById('make');
  makeSelect.innerHTML = '<option value="">Loading...</option>';
  makeSelect.disabled = true;

  fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/GetMakesForVehicleType/car?format=json`)
    .then(response => response.json())
    .then(data => {
      makeSelect.innerHTML = '<option value="">Select Make</option>';
      data.Results.forEach(make => {
        const option = document.createElement('option');
        option.value = make.MakeName;
        option.text = make.MakeName;
        makeSelect.appendChild(option);
      });
      sortSelectOptions(makeSelect);
      makeSelect.disabled = false;
    });
}

function populateModels(make, year) {
  const modelSelect = document.getElementById('model');
  modelSelect.innerHTML = '<option value="">Loading...</option>';
  modelSelect.disabled = true;

  fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMakeYear/make/${make}/modelyear/${year}?format=json`)
    .then(response => response.json())
    .then(data => {
      modelSelect.innerHTML = '<option value="">Select Model</option>';
      data.Results.forEach(model => {
        const option = document.createElement('option');
        option.value = model.Model_Name;
        option.text = model.Model_Name;
        modelSelect.appendChild(option);
      });
      sortSelectOptions(modelSelect);
      modelSelect.disabled = false;
    });
}

// Add similar logic for year, trim, engine, and VIN lookup to match
