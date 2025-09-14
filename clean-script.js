// Weather API configuration
const weatherApi = {
    key: '4eb3703790b356562054106543b748b2',
    baseUrl: 'https://api.openweathermap.org/data/2.5/weather'
};

// DOM Elements
const searchInputBox = document.getElementById('input-box');
const homeBtn = document.getElementById('home-btn');
const predictorBtn = document.getElementById('predictor-btn');
const weatherBody = document.getElementById('weather-body');
const predictorPanel = document.getElementById('predictor-panel');
const submitManualDataBtn = document.getElementById('submit-manual-data');
const testLevelBtn = document.getElementById('test-level-btn');

// Initialize the application
function initApp() {
    // Set up event listeners
    if (searchInputBox) {
        searchInputBox.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                getWeatherReport(searchInputBox.value);
            }
        });
    }

    // Navigation buttons
    if (homeBtn) homeBtn.addEventListener('click', showHomeView);
    if (predictorBtn) predictorBtn.addEventListener('click', showPredictorView);
    
    // Manual prediction form
    if (submitManualDataBtn) {
        submitManualDataBtn.addEventListener('click', handleManualPrediction);
    }
    
    // Test level button
    if (testLevelBtn) {
        testLevelBtn.addEventListener('click', showTestLevelModal);
    }
    
    // Show home view by default
    showHomeView();
}

// Show home view
function showHomeView() {
    if (homeBtn) homeBtn.classList.add('active');
    if (predictorBtn) predictorBtn.classList.remove('active');
    if (weatherBody) weatherBody.style.display = 'block';
    if (predictorPanel) predictorPanel.style.display = 'none';
    
    const appMain = document.querySelector('.app-main');
    if (appMain) appMain.classList.remove('predictor-active');
}

// Show predictor view
function showPredictorView() {
    if (predictorBtn) predictorBtn.classList.add('active');
    if (homeBtn) homeBtn.classList.remove('active');
    if (weatherBody) weatherBody.style.display = 'none';
    if (predictorPanel) predictorPanel.style.display = 'block';
    
    const appMain = document.querySelector('.app-main');
    if (appMain) appMain.classList.add('predictor-active');
}

// Handle manual prediction form submission
function handleManualPrediction() {
    const humidity = parseFloat(document.getElementById('humidity').value) || 0;
    const pressure = parseFloat(document.getElementById('pressure').value) || 0;
    const windSpeed = parseFloat(document.getElementById('wind-speed').value) || 0;
    const cloudCover = parseFloat(document.getElementById('cloud-cover').value) || 0;
    const rainfall = parseFloat(document.getElementById('rainfall').value) || 0;
    const weatherCondition = document.getElementById('weather-condition').value;

    const weatherData = {
        main: {
            humidity: humidity,
            pressure: pressure
        },
        wind: {
            speed: windSpeed
        },
        clouds: {
            all: cloudCover
        },
        rain: {
            '1h': rainfall
        },
        weather: [
            {
                main: weatherCondition
            }
        ],
        name: 'Manual Input'
    };

    showCloudburstPrediction(weatherData, 'manual-prediction');
}

// Get weather report for a city
function getWeatherReport(city) {
    fetch(`${weatherApi.baseUrl}?q=${city}&appid=${weatherApi.key}&units=metric`)
        .then(response => response.json())
        .then(weather => {
            showWeaterReport(weather);
            showCloudburstPrediction(weather, 'cloudburst-prediction');
        })
        .catch(error => {
            console.error('Error fetching weather data:', error);
            swal('Error', 'Failed to fetch weather data. Please try again.', 'error');
        });
}

// Show weather report
function showWeaterReport(weather) {
    if (!weather || !weather.weather) {
        swal('Error', 'Invalid weather data received', 'error');
        return;
    }

    const weatherBody = document.getElementById('weather-body');
    if (!weatherBody) return;

    const weatherDesc = weather.weather[0].main;
    const temp = Math.round(weather.main.temp);
    const feelsLike = Math.round(weather.main.feels_like);
    const humidity = weather.main.humidity;
    const windSpeed = weather.wind.speed;
    const pressure = weather.main.pressure;

    weatherBody.innerHTML = `
        <div class="weather-box">
            <div class="temp">${temp}°C</div>
            <div class="weather">${weatherDesc}</div>
        </div>
        <div class="details">
            <div class="detail">
                <i class="fas fa-temperature-low"></i>
                <span>Feels like: ${feelsLike}°C</span>
            </div>
            <div class="detail">
                <i class="fas fa-tint"></i>
                <span>Humidity: ${humidity}%</span>
            </div>
            <div class="detail">
                <i class="fas fa-wind"></i>
                <span>Wind: ${windSpeed} km/h</span>
            </div>
            <div class="detail">
                <i class="fas fa-tachometer-alt"></i>
                <span>Pressure: ${pressure} mb</span>
            </div>
        </div>
    `;
}

// Show cloudburst prediction
function showCloudburstPrediction(weather, targetId = 'cloudburst-prediction') {
    const predictionElement = document.getElementById(targetId);
    if (!predictionElement) return;

    const riskScore = calculateCloudburstRisk(weather);
    const riskLevel = getRiskLevelText(riskScore);
    const safetyTips = getSafetyTips(riskScore);

    let riskClass = 'low-risk';
    if (riskScore >= 15) riskClass = 'high-risk';
    else if (riskScore >= 10) riskClass = 'medium-risk';

    predictionElement.innerHTML = `
        <div class="prediction-box ${riskClass}">
            <h3><i class="fas fa-cloud-showers-heavy"></i> Cloudburst Risk</h3>
            <div class="risk-level">${riskLevel} (${riskScore}/20)</div>
            <div class="safety-tips">
                <h4>Safety Tips:</h4>
                <p>${safetyTips}</p>
            </div>
        </div>
    `;
}

// Calculate cloudburst risk (0-20 scale)
function calculateCloudburstRisk(weather) {
    if (!weather || !weather.main || !weather.wind || !weather.clouds) return 0;

    const humidity = weather.main.humidity || 0;
    const pressure = weather.main.pressure || 0;
    const windSpeed = weather.wind.speed || 0;
    const cloudCover = weather.clouds.all || 0;
    const rain1h = (weather.rain && weather.rain['1h']) || 0;
    const weatherCondition = (weather.weather && weather.weather[0] && weather.weather[0].main) || '';

    let riskScore = 0;

    // Weather condition has the most impact
    if (weatherCondition.includes('Thunderstorm') || weatherCondition.includes('Heavy Rain')) {
        riskScore += 15;
    } else if (weatherCondition.includes('Rain')) {
        riskScore += 10;
    } else if (weatherCondition.includes('Drizzle')) {
        riskScore += 5;
    }

    // Add factors (each can add up to 10 points)
    if (humidity > 80) riskScore += 10;
    else if (humidity > 70) riskScore += 5;
    else if (humidity > 60) riskScore += 2;

    if (pressure < 1000) riskScore += 10;
    else if (pressure < 1010) riskScore += 5;
    else if (pressure < 1020) riskScore += 2;

    if (windSpeed > 30) riskScore += 10;
    else if (windSpeed > 20) riskScore += 5;
    else if (windSpeed > 10) riskScore += 2;

    if (cloudCover > 80) riskScore += 10;
    else if (cloudCover > 60) riskScore += 5;
    else if (cloudCover > 40) riskScore += 2;

    if (rain1h > 50) riskScore += 10;
    else if (rain1h > 20) riskScore += 5;
    else if (rain1h > 5) riskScore += 2;

    // Cap the score at 20
    return Math.min(20, riskScore);
}

// Get risk level text
function getRiskLevelText(riskScore) {
    if (riskScore >= 18) return 'EXTREME RISK';
    if (riskScore >= 15) return 'VERY HIGH RISK';
    if (riskScore >= 12) return 'HIGH RISK';
    if (riskScore >= 8) return 'MODERATE RISK';
    if (riskScore >= 5) return 'LOW RISK';
    return 'MINIMAL RISK';
}

// Get safety tips based on risk level
function getSafetyTips(level) {
    if (level >= 18) {
        return 'EXTREME DANGER! Evacuate to higher ground immediately. Avoid all travel. Stay away from rivers and streams. Follow emergency services instructions.';
    } else if (level >= 15) {
        return 'DANGER! Move to higher ground. Avoid all travel. Stay indoors on upper floors. Have emergency supplies ready.';
    } else if (level >= 12) {
        return 'HIGH RISK! Be prepared to move to higher ground. Avoid unnecessary travel. Stay updated with weather alerts.';
    } else if (level >= 8) {
        return 'MODERATE RISK: Stay alert for weather updates. Avoid low-lying areas. Have an emergency plan ready.';
    } else if (level >= 5) {
        return 'LOW RISK: Normal conditions, but stay aware of weather updates.';
    } else {
        return 'MINIMAL RISK: No significant risk of cloudburst.';
    }
}

// Show test level modal
function showTestLevelModal() {
    swal({
        title: 'Test Cloudburst Risk',
        html: `
            <p>Select a test level to see how different conditions affect cloudburst risk:</p>
            <select id="cloudburst-level" class="swal2-select">
                <option value="">-- Select a level --</option>
                <option value="minimal">Minimal Risk</option>
                <option value="low">Low Risk</option>
                <option value="moderate">Moderate Risk</option>
                <option value="high">High Risk</option>
                <option value="extreme">Extreme Risk</option>
            </select>
        `,
        showCancelButton: true,
        confirmButtonText: 'Test',
        cancelButtonText: 'Cancel',
        focusConfirm: false,
        preConfirm: () => {
            const level = document.getElementById('cloudburst-level').value;
            if (!level) {
                swal.showValidationMessage('Please select a test level');
                return false;
            }
            return level;
        }
    }).then((result) => {
        if (result.value) {
            const testData = generateTestDataForLevel(result.value);
            showCloudburstPrediction(testData, 'manual-prediction');
        }
    });
}

// Generate test data for cloudburst levels
function generateTestDataForLevel(level) {
    const testData = {
        main: {},
        wind: {},
        clouds: {},
        weather: [{}]
    };

    switch (level) {
        case 'extreme':
            testData.main = { humidity: 95, pressure: 990 };
            testData.wind = { speed: 40 };
            testData.clouds = { all: 100 };
            testData.rain = { '1h': 60 };
            testData.weather[0].main = 'Thunderstorm';
            testData.name = 'Extreme Risk Test';
            break;
        case 'high':
            testData.main = { humidity: 85, pressure: 1000 };
            testData.wind = { speed: 25 };
            testData.clouds = { all: 90 };
            testData.rain = { '1h': 30 };
            testData.weather[0].main = 'Heavy Rain';
            testData.name = 'High Risk Test';
            break;
        case 'moderate':
            testData.main = { humidity: 75, pressure: 1010 };
            testData.wind = { speed: 15 };
            testData.clouds = { all: 70 };
            testData.rain = { '1h': 10 };
            testData.weather[0].main = 'Rain';
            testData.name = 'Moderate Risk Test';
            break;
        case 'low':
            testData.main = { humidity: 65, pressure: 1015 };
            testData.wind = { speed: 10 };
            testData.clouds = { all: 50 };
            testData.rain = { '1h': 2 };
            testData.weather[0].main = 'Drizzle';
            testData.name = 'Low Risk Test';
            break;
        default: // minimal
            testData.main = { humidity: 50, pressure: 1020 };
            testData.wind = { speed: 5 };
            testData.clouds = { all: 20 };
            testData.weather[0].main = 'Clear';
            testData.name = 'Minimal Risk Test';
    }

    return testData;
}

// Initialize the app when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initApp);
