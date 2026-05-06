// --- Helper Function: Get Numeric Value (consistent UX) ---
const getValue = (id) => parseFloat(document.getElementById(id).value) || 0;

// --- Dosing Logic Constant Factors ---
// These guides represent cautious starting points, not maximum limits.
// Logic: Calculate a 'baseline' number, then offer a range around it.

const STOCKING_FACTORS = {
  // 1 fish per ~2L (cautious) up to 1 fish per ~1.2L (average maint)
  nano: {
    baselinePerLiter: 0.6, // 1 fish per ~1.7L baseline
    minTankLiters: 10, // Nano tanks need minimum size
    minQuantity: 6, // Small tetras should be in schools
    label: "Community Nanos (Tetras/Guppies)",
  },
  // 1 fish per ~10L (cautious) to 1 fish per ~6L
  medium: {
    baselinePerLiter: 0.12, // 1 fish per ~8L baseline
    minTankLiters: 40, // Need 10G+ minimum
    minQuantity: 3, // Small livebearers/community groups
    label: "Medium Community (Mollies/Swordtails)",
  },
  // Fancy Goldfish: Minimum 75L (20G) for 1st fish, 40L (10G) for each additional
  goldfish: {
    baselinePerLiter: 0.0125, // Derived for fancy goldfish, very conservative bioload.
    minTankLiters: 75,
    minQuantity: 1,
    label: "Goldfish (Fancy)",
  },
  // Large Cichlids: Extremely conservative estimation.
  // Minimum 150L (40G) for single Oscar, massive maintenance required.
  cichlid: {
    baselinePerLiter: 0.005, // Very, very cautious estimation.
    minTankLiters: 150,
    minQuantity: 1,
    label: "Large Cichlids (Oscars)",
  },
};

// --- Main Calculation Logic ---
function estimateStocking() {
  const unit = document.getElementById("unit").value;
  const category = document.getElementById("fish-category").value;
  const res = document.getElementById("result");

  // Get Inputs
  const volInput = getValue("tank-vol");

  // Minimal sanity check (theme consistent)
  if (volInput <= 0) {
    res.innerText = "Please enter a valid tank volume.";
    return;
  }

  // --- Step 1: Normalize Volume to Liters (Internal Calculation) ---
  // Cautious math is simpler in Liters.
  let internalVolLiters = volInput; // Defaults to Liters if unit === 'metric'

  if (unit === "us") {
    internalVolLiters = volInput / 0.264172; // Gallons to Liters
  }

  // --- Step 2: Retrieve Category Factors & Apply Minimum Tank Size Check ---
  const guide = STOCKING_FACTORS[category];

  // Check if the user's tank is too small for the selected category
  if (internalVolLiters < guide.minTankLiters) {
    res.innerHTML = `This tank size (${volInput} ${unit === "us" ? "Gallons" : "Liters"}) is too small for ${guide.label}. A minimum of ${guide.minTankLiters} Liters (${Math.round(guide.minTankLiters * 0.264172)} Gallons) is recommended.`;
    return;
  }

  // --- Step 3: Calculate the Baseline Quantity ---
  // (Volume * Factor)
  let baselineQty = internalVolLiters * guide.baselinePerLiter;

  // --- Step 4: Formatting the Output Range ---
  // Cautious range: Conservative to Standard bioload

  let lowRange = Math.round(baselineQty * 0.85); // 15% conservative
  let highRange = Math.round(baselineQty * 1.3); // Standard maintenance bioload

  // Standard school size enforcement (if Low Range is too small for schooling fish)
  if (lowRange < guide.minQuantity) {
    lowRange = guide.minQuantity;
  }

  // Safety check (high range must be >= low range)
  if (highRange < lowRange) {
    highRange = lowRange;
  }

  // --- Step 5: Final Output (consistent styled result box) ---
  res.innerHTML = `
        Estimated Safe Stocking Range:
        <strong>${lowRange} — ${highRange} fish</strong><br>
        <span style="font-size: 0.9rem; color: #334e68;">
            (A cautious starting point for ${guide.label} in a ${internalVolLiters.toFixed(0)}L tank.)
        </span>
    `;
}

// --- Global Setup & Keyboard Support ---

// Trigger calculation when pressing Enter (consistent UX)
document.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    estimateStocking();
  }
});

function clearAll() {
  // Reset dropdowns to default (polish carried over)
  document.getElementById("unit").value = "us";
  document.getElementById("fish-category").value = "nano";

  // Clear main input/result
  document.getElementById("tank-vol").value = "";
  document.getElementById("result").innerText = "";
  document.getElementById("result").innerHTML = "";
}
