const repairData = {
  "2020_Toyota_Camry": {
    steps: ["Open the hood", "Drain old oil", "Replace filter", "Refill with new oil"],
    video: "https://www.youtube.com/embed/l4QAz2Idorw"
  },
  "2021_Honda_Accord": {
    steps: ["Jack up car", "Remove wheel", "Replace brake pads", "Reinstall wheel"],
    video: "https://www.youtube.com/embed/nC4kW-vP1Xc"
  }
};

function loadRepair() {
  const year = document.getElementById("year").value;
  const make = document.getElementById("make").value;
  const model = document.getElementById("model").value;

  if (!year || !make || !model) {
    alert("Please select year, make, and model.");
    return;
  }

  const key = `${year}_${make}_${model}`;
  const repair = repairData[key];

  if (!repair) {
    alert("No guide available for this vehicle.");
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

// Load saved vehicle on start
window.onload = function () {
  const saved = localStorage.getItem("lastVehicle");
  if (saved && repairData[saved]) {
    const [year, make, model] = saved.split("_");
    document.getElementById("year").value = year;
    document.getElementById("make").value = make;
    document.getElementById("model").value = model;
    loadRepair();
  }
};
