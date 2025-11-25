document.addEventListener("DOMContentLoaded", function () {
  // fade effect
  AOS.init({
    duration: 1000,
    once: true,
  });

  // help video 
  const modal = document.getElementById("videoModal");
  const btn = document.getElementById("helpButton");
  const video = document.getElementById("popupVideo");
  const span = document.getElementsByClassName("close-button")[0];

  btn.onclick = function () {
    modal.style.display = "block";
    video.play();
  };

  span.onclick = function () {
    modal.style.display = "none";
    video.pause();
    video.currentTime = 0;
  };

  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
      video.pause();
      video.currentTime = 0; 
    }
  };

  // progress bar
  const steps = document.querySelectorAll(".step-card");
  const stepTitle = document.getElementById("currentStepNumber");
  const progressBar = document.getElementById("progressBar");
  const totalSteps = steps.length;
  const progressIncrement = 100 / totalSteps;
  let currentStep = 0;

  function updateProgressBar() {
    const progressValue = (currentStep + 1) * progressIncrement;
    progressBar.style.width = progressValue + "%";
    progressBar.setAttribute("aria-valuenow", progressValue.toFixed(1));
  }

  function nextStep() {
    if (currentStep < steps.length - 1) {
      steps[currentStep].classList.remove("active");
      currentStep++;
      setTimeout(() => {
        steps[currentStep].classList.add("active");
        stepTitle.textContent = currentStep + 1;
        AOS.refreshHard();
        const modalBody = document.querySelector(
          "#recommendationModal .modal-body"
        );
        if (modalBody) {
          modalBody.scrollTop = 0;
        }
      }, 50);
    }
    updateNavigationButtons();
    updateProgressBar();
  }

  function prevStep() {
    if (currentStep > 0) {
      steps[currentStep].classList.remove("active");
      currentStep--;
      setTimeout(() => {
        steps[currentStep].classList.add("active");
        stepTitle.textContent = currentStep + 1;
        AOS.refreshHard();
      }, 50);
    }
    updateNavigationButtons();
    updateProgressBar();
  }

  function updateNavigationButtons() {
    document.getElementById("prevStepBtn").style.display =
      currentStep > 0 ? "inline-block" : "none";

    const nextBtn = document.getElementById("nextStepBtn");
    const recommendBtn = document.getElementById("getRecommendationBtn");
    if (currentStep === steps.length - 1) {
      nextBtn.style.display = "none";
      recommendBtn.style.display = "inline-block";
    } else {
      recommendBtn.style.display = "none";
      nextBtn.style.display = "none";
    }
  }

  // --- Auto-Advance Logic ---

  // Step 1 & 2: Crop & Soil Selection (Image click) - Auto-Advance
  document
    .querySelectorAll("#step1 .img-selection, #step2 .img-selection")
    .forEach((img) => {
      img.addEventListener("click", function () {
        const stepId = this.closest(".step-card").id;
        document
          .querySelectorAll(`#${stepId} .img-selection`)
          .forEach((i) => i.classList.remove("selected"));
        this.classList.add("selected");
        setTimeout(nextStep, 200);
      });
    });

  // Step 3: Crop Age Selection (Radio or Date) - Auto-Advance
  const ageOptions = document.querySelectorAll('input[name="cropAgeOption"]');
  const sowingDate = document.getElementById("sowingDate");

  const handleStep3Advance = () => {
    clearTimeout(window.step3Timeout);
    window.step3Timeout = setTimeout(() => {
      if (
        currentStep === 2 &&
        (document.querySelector('input[name="cropAgeOption"]:checked') ||
          sowingDate.value)
      ) {
        nextStep();
      }
    }, 200);
  };

  ageOptions.forEach((radio) => {
    radio.addEventListener("change", function () {
      sowingDate.value = "";
      handleStep3Advance();
    });
  });

  sowingDate.addEventListener("change", function () {
    ageOptions.forEach((radio) => (radio.checked = false));
    handleStep3Advance();
  });

  // Step 4: Irrigation Selection (Image Selection AND Radio) - Auto-Advance
  const irrigationMethodSelections = document.querySelectorAll(
    "#irrigationMethodSelection .img-selection"
  );
  const irrigationStatusRadios = document.querySelectorAll(
    'input[name="irrigationStatus"]'
  );

  const checkStep4Complete = () => {
    const methodSelected =
      document.querySelector(
        "#irrigationMethodSelection .img-selection.selected"
      ) !== null;
    const statusSelected =
      document.querySelector('input[name="irrigationStatus"]:checked') !== null;
    if (currentStep === 3 && methodSelected && statusSelected) {
      nextStep();
    }
  };

  irrigationMethodSelections.forEach((selection) => {
    selection.addEventListener("click", function () {
      irrigationMethodSelections.forEach((s) => s.classList.remove("selected"));
      this.classList.add("selected");
      checkStep4Complete();
    });
  });

  irrigationStatusRadios.forEach((radio) => {
    radio.addEventListener("change", checkStep4Complete);
  });

  // Step 5: Plant Appearance (All 3 groups selected) - Auto-Advance
  document.querySelectorAll("#step5 .img-selection").forEach((img) => {
    img.addEventListener("click", function () {
      const group = this.closest(".appearance-group");
      group
        .querySelectorAll(".img-selection")
        .forEach((i) => i.classList.remove("selected"));
      this.classList.add("selected");
      const group1Selected = document.querySelector(
        "#leafColorGroup .img-selection.selected"
      );
      const group2Selected = document.querySelector(
        "#spotsGroup .img-selection.selected"
      );
      const group3Selected = document.querySelector(
        "#pestsGroup .img-selection.selected"
      );
      if (
        currentStep === 4 &&
        group1Selected &&
        group2Selected &&
        group3Selected
      ) {
        setTimeout(nextStep, 200);
      }
    });
  });

  // Step 6: Conditional Fertilizer Details
  const fertilizerRadios = document.querySelectorAll(
    'input[name="usedFertilizer"]'
  );
  const fertilizerDetails = document.getElementById("fertilizerDetails");
  fertilizerRadios.forEach((radio) => {
    radio.addEventListener("change", function () {
      if (document.getElementById("fertilizerYes").checked) {
        fertilizerDetails.style.display = "block";
      } else {
        fertilizerDetails.style.display = "none";
      }
    });
  });

  document.getElementById("prevStepBtn").addEventListener("click", prevStep);
  document
    .getElementById("getRecommendationBtn")
    .addEventListener("click", function () {
      if (document.getElementById("fertilizerYes").checked) {
        if (!document.getElementById("fertilizerType").value) {
          alert("Please select the fertilizer type you used.");
          return;
        }
        if (
          !document.querySelector('input[name="fertilizerQuantity"]:checked')
        ) {
          alert("Please select the quantity of fertilizer you used.");
          return;
        }
      }
      alert("Gathering data and generating recommendation...");
    });

    
  // --- Navbar Hover Interaction Logic for Dimming Active Link  ---
  const navLinks = document.querySelectorAll(".navbar-nav .nav-link");
  const activeLink = document.querySelector(".navbar-nav .nav-link.active");
  if (activeLink) {
    navLinks.forEach((link) => {
      if (!link.classList.contains("active")) {
        link.addEventListener("mouseover", function () {
          activeLink.classList.add("less-bright-active");
        });
        link.addEventListener("mouseout", function () {
          activeLink.classList.remove("less-bright-active");
        });
      }
    });
  }
  showStep(0);
});

/////////////////////////////////// Map ///////////////////////////

// GeoJSON for Indian States boundaries
const GEOJSON_URL =
  "https://gist.githubusercontent.com/jbrobst/56c13bbbf9d97d187fea01ca62ea5112/raw/e388c4cae20aa53cb5090210a42ebb9b765c0a36/india_states.geojson";
const DATA_FILE = "data.json";

let geojsonData = null;
let rawCropData = null;

const svg = d3.select("#map");
const width = svg.node().getBoundingClientRect().width;
const height = svg.node().getBoundingClientRect().height;
const projection = d3
  .geoMercator()
  .fitSize([width, height], { type: "FeatureCollection", features: [] });
const path = d3.geoPath().projection(projection);
const tooltip = d3.select("body").append("div").attr("class", "tooltip");
const colorScale = d3.scaleSequential(d3.interpolateViridis).domain([0, 1]);

const legendWidth = 300;
const legendHeight = 20;
const legendSvg = d3
  .select("#map-legend")
  .append("svg")
  .attr("width", legendWidth)
  .attr("height", legendHeight + 25);

// --- Core Logic Functions ---
async function init() {
  try {
    const [geoResponse, dataResponse] = await Promise.all([
      fetch(GEOJSON_URL),
      fetch(DATA_FILE),
    ]);

    geojsonData = await geoResponse.json();
    rawCropData = await dataResponse.json();

    if (!rawCropData || rawCropData.length === 0) {
      console.error("Failed to load or data file is empty.");
      return;
    }

    const uniqueCrops = [...new Set(rawCropData.map((d) => d.cropname))].sort();
    const select = d3.select("#crop-select");

    select
      .selectAll("option")
      .data(uniqueCrops)
      .enter()
      .append("option")
      .attr("value", (d) => d)
      .text((d) => d);

    const mapElement = d3.select("#map").node();
    const mapWidth = mapElement.getBoundingClientRect().width;
    const mapHeight = mapElement.getBoundingClientRect().height;

    projection.fitSize([mapWidth, mapHeight], geojsonData);

    const initialCrop = uniqueCrops[0] || "";
    updateMap(initialCrop);

    select.on("change", function () {
      updateMap(this.value);
    });
  } catch (error) {
    console.error(
      "Error loading required files. Ensure 'data.json' is in the correct path and GeoJSON URL is accessible.",
      error
    );
  }
}

function updateMap(selectedCrop) {
  const currentCropData = rawCropData.filter(
    (d) => d.cropname === selectedCrop
  );
  const productionMap = new Map();
  let maxProduction = 0;

  currentCropData.forEach((d) => {
    const production = parseFloat(d["Production (Lakh Tonnes)"]) || 0;
    if (d.statename !== "Others") {
      productionMap.set(d.statename, production);
      if (production > maxProduction) {
        maxProduction = production;
      }
    }
  });

  const states = svg
    .selectAll(".state")
    .data(geojsonData.features, (d) => d.properties.ST_NM);

  states
    .enter()
    .append("path")
    .attr("class", "state")
    .attr("d", path)
    .merge(states)
    .on("mouseover", handleMouseOver)
    .on("mousemove", handleMouseMove)
    .on("mouseout", handleMouseOut);
  states.exit().remove();
  updateTopProducers(selectedCrop, currentCropData);
}

function updateTopProducers(selectedCrop, currentCropData) {
  d3.select("#current-crop").text(selectedCrop);
  const top5 = currentCropData
    .filter((d) => d.statename !== "Others")
    .map((d) => ({
      statename: d.statename,
      Production_Lakh_Tonnes: parseFloat(d["Production (Lakh Tonnes)"]) || 0,
    }))
    .sort((a, b) => b.Production_Lakh_Tonnes - a.Production_Lakh_Tonnes)
    .slice(0, 5);
  const list = d3.select("#top-list").html("");

  if (top5.length === 0 || top5[0].Production_Lakh_Tonnes === 0) {
    list
      .append("li")
      .text("No significant production data available for this crop.");
  } else {
    top5.forEach((item, index) => {
      const formattedProduction =
        item.Production_Lakh_Tonnes.toFixed(2).toLocaleString();
      list
        .append("li")
        .text(
          `${index + 1}. ${item.statename}: ${formattedProduction} Lakh Tonnes`
        );
    });
  }
}

function handleMouseOver(event, d) {
  const stateName = d.properties.ST_NM;
  d3.select(this).attr("stroke", "#000").attr("stroke-width", 1.5);

  const selectedCrop = d3.select("#crop-select").property("value");
  const stateData = rawCropData.find(
    (item) => item.cropname === selectedCrop && item.statename === stateName
  );

  const production = stateData
    ? parseFloat(stateData["Production (Lakh Tonnes)"])
        .toFixed(2)
        .toLocaleString()
    : "N/A";

  tooltip.style("opacity", 1).html(`
            <strong>${stateName}</strong><br>
            Production: ${production} Lakh Tonnes
        `);
}

function handleMouseMove(event) {
  tooltip
    .style("left", event.pageX + 10 + "px")
    .style("top", event.pageY - 28 + "px");
}

function handleMouseOut(event, d) {
  d3.select(this).attr("stroke", "#333").attr("stroke-width", 0.5);
  tooltip.style("opacity", 0);
}
init();
