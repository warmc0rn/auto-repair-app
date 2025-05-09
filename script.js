// script.js

const yearSelect = document.getElementById("yearSelect");
const makeSelect = document.getElementById("makeSelect");
const modelSelect = document.getElementById("modelSelect");
const trimSelect = document.getElementById("trimSelect");
const engineSelect = document.getElementById("engineSelect");
const vinInput = document.getElementById("vinInput");
const submitBtn = document.getElementById("submitBtn");
const results = document.getElementById("results");

function populateYears() {
  const currentYear = new Date().getFullYear();
  for (let y = currentYear; y >= 1980; y--) {
    yearSelect.add(new Option(y, y));
  }
}

function fetchMakes(year) {
  return fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/GetMakesForVehicleType/car?format=json`)
    .then(res => res.json())
    .then(data => {
      makeSelect.innerHTML = '<option value="">Select Make</option>';
      data.Results.sort((a, b) => a.MakeName.localeCompare(b.MakeName)).forEach(make => {
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
      modelSelect.innerHTML = '<option value="">Select Model</option>';
      data.Results.sort((a, b) => a.Model_Name.localeCompare(b.Model_Name)).forEach(model => {
        const opt = document.createElement("option");
        opt.value = model.Model_Name;
        opt.textContent = model.Model_Name;
        modelSelect.appendChild(opt);
      });
      modelSelect.disabled = false;
    });
}

function fetchTrims(year, make, model) {
  return fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/GetVehicleTypesForMakeModelYear/make/${make}/model/${model}/modelyear/${year}?format=json`)
    .then(res => res.json())
    .then(data => {
      trimSelect.innerHTML = '<option value="">Select Trim</option>';
      data.Results.forEach(trim => {
        const opt = document.createElement("option");
        opt.value = trim.VehicleTypeName;
        opt.textContent = trim.VehicleTypeName;
        trimSelect.appendChild(opt);
      });
      trimSelect.disabled = false;
    });
}

function fetchEngines(year, make, model, trim) {
  return fetch(`/api/engines?year=${year}&make=${make}&model=${model}&trim=${trim}`)
    .then(res => res.json())
    .then(data => {
      engineSelect.innerHTML = '<option value="">Select Engine</option>';
      data.data.forEach(engine => {
        const opt = document.createElement("option");
        opt.value = engine.engine_name;
        opt.textContent = `${engine.engine_name} (${engine.horsepower} HP, ${engine.fuel_type})`;
        engineSelect.appendChild(opt);
      });
      engineSelect.disabled = false;
    })
    .catch(() => {
      engineSelect.innerHTML = '<option value="">Engine data unavailable</option>';
      engineSelect.disabled = true;
    });
}

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
            fetchTrims(info.ModelYear, info.Make, info.Model).then(() => {
              trimSelect.value = info.VehicleType;
              fetchEngines(info.ModelYear, info.Make, info.Model, info.VehicleType);
            });
          });
        });
      });
  }
});

submitBtn.addEventListener("click", () => {
  const year = yearSelect.value;
  const make = makeSelect.value;
  const model = modelSelect.value;
  const trim = trimSelect.value;
  const engine = engineSelect.value;

  if (year && make && model && trim && engine) {
    fetch(`https://api.vehicledb.io/maintenance?year=${year}&make=${make}&model=${model}&trim=${trim}&engine=${engine}&apikey=83656df82b8e11f098a60242ac120002`)
      .then(res => res.json())
      .then(data => {
        results.innerHTML = '<h3>Maintenance & Repairs</h3>';
        data.maintenance.forEach(item => {
          const div = document.createElement("div");
          div.className = "item";
          div.innerHTML = `<strong>${item.service}</strong>: ${item.description}`;
          results.appendChild(div);
        });
      });
  } else {
    alert("Please complete all selections first.");
  }
});

populateYears();
