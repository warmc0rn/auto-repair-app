const yearDropdown = document.getElementById("year");
const makeDropdown = document.getElementById("make");
const modelDropdown = document.getElementById("model");

// Populate years (1995–current)
const currentYear = new Date().getFullYear();
for (let y = currentYear; y >= 1995; y--) {
  const option = document.createElement("option");
  option.value = y;
  option.textContent = y;
  yearDropdown.appendChild(option);
}

yearDropdown.addEventListener("change", () => {
  const year = yearDropdown.value;
  if (year) {
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
        modelDropdown.innerHTML = '<option value="">Select Model</option>';
        modelDropdown.disabled = true;
      });
  }
});

makeDropdown.addEventListener("change", () => {
  const year = yearDropdown.value;
  const make = makeDropdown.value;
  if (year && make) {
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
  }
});

// Sample repair data (for demo purposes)
const repairData = {
  "2020_Honda_Accord": {
    steps: ["Jack up car", "Remove wheel", "Replace brake pads", "Reinstall wheel"],
    video: "https://www.youtube.com/embed/nC4kW-vP1Xc"
  },
  "2020_Toyota_Camry": {
    steps: ["Open hood", "Drain old oil", "Replace filter", "Refill with oil"],
    video: "https://www.youtube.com/embed/l4QAz2Idorw"
  }
};

function loadRepair() {
  const year = yearDropdown.value;
  const make = makeDropdown.value;
  const model = modelDropdown.value;

  if (!year || !make || !model) {
    alert("Please select year, make, and model.");
    return;
  }

  const key = `${year}_${make}_${model}`;
  const repair = repairData[key];

  if (!repair) {
    alert("No repair guide available for this vehicle (yet).");
    return;
  }

  localStorage.setItem("lastVehicle", key);

  const stepsEl = document.getElementById("steps");
  stepsEl.innerHTML = "";
  repair.steps.forEach(step => {
    const li = document.createElement("li");
    li.textContent = step;
    stepsEl.appendChild(li);
  });

  document.getElementById("video").src = repair.video;
  document.getElementById("guide").style.display = "block";
}

// Load previous selection
window.onload = function () {
  const saved = localStorage.getItem("lastVehicle");
  if (saved) {
    const [year, make, model] = saved.split("_");
    yearDropdown.value = year;
    fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/GetMakesForVehicleModelYear/modelyear/${year}?format=json`)
      .then(res => res.json())
      .then(data => {
        makeDropdown.innerHTML = '<option value="">Select Make</option>';
        data.Results.forEach(m => {
          const option = document.createElement("option");
          option.value = m.Make_Name;
          option.textContent = m.Make_Name;
          makeDropdown.appendChild(option);
        });
        makeDropdown.disabled = false;
        makeDropdown.value = make;

        return fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMakeYear/make/${make}/modelyear/${year}?format=json`);
      })
      .then(res => res.json())
      .then(data => {
        modelDropdown.innerHTML = '<option value="">Select Model</option>';
        data.Results.forEach(mod => {
          const option = document.createElement("option");
          option.value = mod.Model_Name;
          option.textContent = mod.Model_Name;
          modelDropdown.appendChild(option);
        });
        modelDropdown.disabled = false;
        modelDropdown.value = model;
      });
  }
};
