const API_URL = "https://mental-health-score-predictor-yze9.onrender.com";
const form = document.querySelector("#predict-form");
const statusLabel = document.querySelector("#api-status");
const statusDot = document.querySelector(".status-dot");
const message = document.querySelector("#message");
const submitButton = document.querySelector("#submit");
const submitLabel = submitButton.querySelector("span");
const score = document.querySelector("#score");
const resultTitle = document.querySelector("#result-title");
const resultCopy = document.querySelector("#result-copy");

function setApiStatus(isOnline) {
  statusLabel.textContent = isOnline ? "Connected to API" : "API unavailable — try again shortly";
  statusDot.classList.toggle("online", isOnline);
  statusDot.classList.toggle("offline", !isOnline);
}

async function checkApi() {
  try {
    const response = await fetch(API_URL);
    setApiStatus(response.ok);
  } catch {
    setApiStatus(false);
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  message.hidden = true;
  const values = new FormData(form);
  const payload = {
    age: Number(values.get("age")),
    gender: values.get("gender"),
    country: values.get("country").trim(),
    academic_level: values.get("academic_level"),
    most_used_platform: values.get("most_used_platform"),
    purpose_of_use: values.get("purpose_of_use"),
    avg_daily_usage_hours: Number(values.get("avg_daily_usage_hours")),
    daily_unlocks: Number(values.get("daily_unlocks")),
    study_hours: Number(values.get("study_hours")),
    physical_activity_hours: Number(values.get("physical_activity_hours")),
    sleep_hours_per_night: Number(values.get("sleep_hours_per_night")),
    stress_level: values.get("stress_level")
  };

  submitButton.disabled = true;
  submitLabel.textContent = "Calculating…";
  try {
    const response = await fetch(API_URL + "/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (!response.ok) {
      const detail = Array.isArray(data.detail)
        ? data.detail.map((item) => item.msg).join(" ")
        : data.detail;
      throw new Error(detail || "The prediction could not be calculated.");
    }
    const predictedScore = Number(data.predicted_mental_health_score);
    if (!Number.isFinite(predictedScore)) throw new Error("The API returned an unexpected result.");

    score.textContent = predictedScore.toFixed(2);
    resultTitle.textContent = "Your model estimate is ready";
    resultCopy.textContent = "This is a machine-learning estimate based on survey patterns, not a diagnosis or measure of your worth.";
    setApiStatus(true);
    document.querySelector("#result").scrollIntoView({ behavior: "smooth", block: "nearest" });
  } catch (error) {
    message.textContent = error.message || "Could not reach the prediction service. Please try again.";
    message.hidden = false;
    setApiStatus(false);
  } finally {
    submitButton.disabled = false;
    submitLabel.textContent = "Get my estimate";
  }
});

checkApi();
