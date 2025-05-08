const apiKey = "83656df82b8e11f098a60242ac120002";

const vinInput = document.getElementById("vin");
const yearSelect = document.getElementById("year");
const makeSelect = document.getElementById("make");
const modelSelect = document.getElementById("model");
const typeSelect = document.getElementById("type");
const engineSelect = document.getElementById("engine");
const form = document.getElementById("vehicle-form");
const results = document.getElementById("results");

// Populate years
for (let y = new Date().getFullYear(); y >= 1990; y--) {
  const option = document.createElement("option");
  option.value = y;
  option.textContent = y;
  yearSelect.appendChild(option);
}

// Event listeners for dropdown changes
yearSelect.addEventListener("change", () => {
  fetchMakes(yearSelect.value);
});

makeSelect.addEventListener("change", () => {
  fetchModels(yearSelect.value, makeSelect.value);
});

modelSelect.addEventListener("change", () => {
  fetchTypes(yearSelect.value, makeSelect.value, modelSelect.value);
});

typeSelect.addEventListener("change", () => {
  fetchEngines(yearSelect.value, makeSelect.value, modelSelect.value, typeSelect.value);
});

// VIN input event
vinInput.addEventListener("change", () => {
  const vin = vinInput.value.trim();
  if (vin.length === 17) {
    fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/${vin}?format=json`)
      .then(res => res.json())
      .then(data => {
        const info = data.Results[0];
        yearSelect.value = info.ModelYear;
        fetchMakes(info.ModelYear).then(() => {
          makeSelect.value = info.Make;
          fetchModels(info.ModelYear, info.Make).then(() => {
            modelSelect.value = info.Model;
            fetchTypes(info.ModelYear, info.Make, info.Model).then(() => {
              typeSelect.value = info.VehicleType;
              fetchEngines(info.ModelYear, info.Make, info.Model, info.VehicleType).then(() => {
                engineSelect.value = info.EngineModel;
              });
            });
          });
        });
      });
  }
});

// Fetch functions
function fetchMakes(year) {
  return fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/GetMakesForVehicleType/car?format=json`)
    .then(res => res.json())
    .then(data => {
      makeSelect.innerHTML = `<option value="">Select Make</option>`;
      data.Results.forEach(make => {
        const opt = document.createElement("option");
        opt.value = make.MakeName;
        opt.textContent = make.MakeName;
        makeSelect.appendChild(opt);
      });
      makeSelect.disabled = false;
    });
}

function fetchModels(year, make) {
  return fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMakeYear/make/${make}/modelyear/${year}?format=json`)
    .then(res => res.json())
    .then(data => {
      modelSelect.innerHTML = `<option value="">Select Model</option>`;
      data.Results.forEach(model => {
        const opt = document.createElement("option");
        opt.value = model.Model_Name;
        opt.textContent = model.Model_Name;
        modelSelect.appendChild(opt);
      });
      modelSelect.disabled = false;
    });
}

function fetchTypes(year, make, model) {
  return fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/GetVehicleTypesForMakeModelYear/make/${make}/model/${model}/modelyear/${year}?format=json`)
    .then(res => res.json())
    .then(data => {
      typeSelect.innerHTML = `<option value="">Select Type</option>`;
      data.Results.forEach(type => {
        const opt = document.createElement("option");
        opt.value = type.VehicleTypeName;
        opt.textContent = type.VehicleTypeName;
        typeSelect.appendChild(opt);
      });
      typeSelect.disabled = false;
    });
}

function fetchEngines(year, make, model, type) {
  // NHTSA API does not provide engine details directly; this is a placeholder
  engineSelect.innerHTML = `<option value="Standard Engine">Standard Engine</option>`;
  engineSelect.disabled = false;
}

// Form submission
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const year = yearSelect.value;
  const make = makeSelect.value;
  const model = modelSelect.value;
  const trim = engineSelect.value;

  results.innerHTML = "<p>Fetching maintenance and repair data...</p>";

  const url = `https://api.vehicledatabases.com/maintenance?year=${year}&make=${make}&model=${model}&trim=${trim}`;
  fetch(url, {
    headers: {
      "x-api-key": apiKey
    }
  })
    .then(res => res.json())
    .then(data => {
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
    })
    .catch(() => {
      results.innerHTML = "<p>Error fetching data. Please try again later.</p>";
    });
});