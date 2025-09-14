// Weather API configuration
const weatherApi = {
    key: '4eb3703790b356562054106543b748b2',
    baseUrl: 'https://api.openweathermap.org/data/2.5/weather'
};

// DOM Elements
let searchInputBox;
let homeBtn;
let predictorBtn;
let weatherView;
let predictorView;

// Initialize the application
function initApp() {
    // Get DOM elements
    searchInputBox = document.getElementById('input-box');
    homeBtn = document.getElementById('home-btn');
    predictorBtn = document.getElementById('predictor-btn');
    weatherView = document.getElementById('weather-view');
    predictorView = document.getElementById('predictor-view');
    
    // Set up event listeners
    if (homeBtn) homeBtn.addEventListener('click', showHomeView);
    if (predictorBtn) predictorBtn.addEventListener('click', showPredictorView);
    
    // Set up weather search
    if (searchInputBox) {
        searchInputBox.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                getWeatherReport(searchInputBox.value);
            }
        });
    }
    
    // Set up manual prediction
    const submitManualDataBtn = document.getElementById('submit-manual-data');
    if (submitManualDataBtn) {
        submitManualDataBtn.addEventListener('click', handleManualPrediction);
    }
    
    // Set up test level button
    const testLevelBtn = document.getElementById('test-level');
    if (testLevelBtn) {
        testLevelBtn.addEventListener('click', function() {
            const levelSelect = document.getElementById('cloudburst-level');
            if (levelSelect && levelSelect.value) {
                const level = parseInt(levelSelect.value);
                const testData = generateTestDataForLevel(level);
                showCloudburstPrediction(testData, 'manual-prediction');
            } else {
                swal('Error', 'Please select a test level', 'error');
            }
        });
    }
    
    // Show home view by default
    showHomeView();
}

// Handle manual prediction form submission
function handleManualPrediction() {
    const humidity = parseFloat(document.getElementById('humidity').value) || 0;
    const pressure = parseFloat(document.getElementById('pressure').value) || 1013;
    const windSpeed = parseFloat(document.getElementById('wind-speed').value) || 0;
    const cloudCover = parseFloat(document.getElementById('cloud-cover').value) || 0;
    const rainfall = parseFloat(document.getElementById('rainfall').value) || 0;
    const weatherCondition = document.getElementById('weather-condition').value;
    
    // Create a weather-like object for the prediction function
    const manualData = {
        main: { humidity, pressure },
        wind: { speed: windSpeed },
        clouds: { all: cloudCover },
        rain: { '1h': rainfall },
        weather: [{ main: weatherCondition }]
    };
    
    // Show the prediction
    showCloudburstPrediction(manualData, 'manual-prediction');
}

// Get weather report for a city
function getWeatherReport(city) {
    fetch(`${weatherApi.baseUrl}?q=${city}&appid=${weatherApi.key}&units=metric`)
        .then(response => response.json())
        .then(weather => {
            if (weather.cod === '404') {
                swal('Error', 'City not found', 'error');
                return;
            }
            showWeaterReport(weather);
            showCloudburstPrediction(weather, 'cloudburst-prediction');
        })
        .catch(error => {
            console.error('Error fetching weather:', error);
            swal('Error', 'Failed to fetch weather data', 'error');
        });
}

// Show weather report
function showWeaterReport(weather) {
    const weatherBody = document.getElementById('weather-body');
    if (!weatherBody) return;
    
    const weatherData = {
        city: weather.name,
        country: weather.sys.country,
        temp: Math.round(weather.main.temp),
        feelsLike: Math.round(weather.main.feels_like),
        humidity: weather.main.humidity,
        pressure: weather.main.pressure,
        windSpeed: weather.wind.speed,
        weatherMain: weather.weather[0].main,
        weatherDesc: weather.weather[0].description,
        icon: weather.weather[0].icon
    };
    
    weatherBody.innerHTML = `
        <div class="weather-box">
            <div class="location">${weatherData.city}, ${weatherData.country}</div>
            <div class="temp">${weatherData.temp}°C</div>
            <div class="weather">${weatherData.weatherMain} (${weatherData.weatherDesc})</div>
            <div class="details">
                <div>Feels like: ${weatherData.feelsLike}°C</div>
                <div>Humidity: ${weatherData.humidity}%</div>
                <div>Pressure: ${weatherData.pressure} mb</div>
                <div>Wind: ${weatherData.windSpeed} km/h</div>
            </div>
        </div>
    `;
}

// Show cloudburst prediction
function showCloudburstPrediction(weather, targetId = 'cloudburst-prediction') {
    const predictionElement = document.getElementById(targetId);
    if (!predictionElement) return;
    
    const riskLevel = calculateCloudburstRisk(weather);
    const safetyTips = getSafetyTips(riskLevel);
    
    predictionElement.innerHTML = `
        <div class="prediction-box">
            <h3>Cloudburst Risk: ${riskLevel}/20</h3>
            <div class="risk-level risk-${Math.min(5, Math.ceil(riskLevel / 4))}">
                ${getRiskLevelText(riskLevel)}
            </div>
            <div class="safety-tips">
                <h4>Safety Tips:</h4>
                <p>${safetyTips}</p>
            </div>
        </div>
    `;
}

// Calculate cloudburst risk (0-20 scale)
function calculateCloudburstRisk(weather) {
    let riskScore = 0;
    
    // Get weather data with defaults
    const humidity = weather.main?.humidity || 0;
    const pressure = weather.main?.pressure || 1013;
    const windSpeed = weather.wind?.speed || 0;
    const cloudCover = weather.clouds?.all || 0;
    const rainfall = weather.rain?.['1h'] || 0;
    const weatherCondition = weather.weather?.[0]?.main || 'Clear';
    
    // Add factors (each can add up to 10 points)
    if (humidity > 80) riskScore += 10;
    else if (humidity > 70) riskScore += 5;
    else if (humidity > 60) riskScore += 2;
    
    if (pressure < 1000) riskScore += 10;
    else if (pressure < 1010) riskScore += 5;
    else if (pressure < 1020) riskScore += 2;
    
    if (windSpeed > 40) riskScore += 10;
    else if (windSpeed > 25) riskScore += 5;
    else if (windSpeed > 15) riskScore += 2;
    
    if (cloudCover > 80) riskScore += 10;
    else if (cloudCover > 60) riskScore += 5;
    else if (cloudCover > 40) riskScore += 2;
    
    if (rainfall > 100) riskScore += 20; // Cloudburst threshold
    else if (rainfall > 50) riskScore += 15;
    else if (rainfall > 20) riskScore += 10;
    else if (rainfall > 10) riskScore += 5;
    else if (rainfall > 2) riskScore += 2;
    
    // Adjust based on weather condition
    switch (weatherCondition.toLowerCase()) {
        case 'thunderstorm':
            riskScore += 8;
            break;
        case 'heavy rain':
            riskScore += 10;
            break;
        case 'rain':
            riskScore += 5;
            break;
        case 'drizzle':
            riskScore += 2;
            break;
    }
    
    // Cap the score at 20
    return Math.min(20, Math.max(0, Math.round(riskScore)));
}

// Get risk level text
function getRiskLevelText(riskScore) {
    if (riskScore >= 18) return 'EXTREME RISK - CLOUDBURST LIKELY';
    if (riskScore >= 15) return 'VERY HIGH RISK';
    if (riskScore >= 12) return 'HIGH RISK';
    if (riskScore >= 8) return 'MODERATE RISK';
    if (riskScore >= 4) return 'LOW RISK';
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
        return 'MODERATE RISK! Stay alert for changing weather conditions. Keep emergency supplies ready. Avoid low-lying areas.';
    } else if (level >= 4) {
        return 'LOW RISK! Normal conditions, but stay informed about weather updates.';
    } else {
        return 'MINIMAL RISK! Enjoy the weather, but always stay informed.';
    }
}

// Generate test data for different risk levels
function generateTestDataForLevel(level) {
    // Default values for minimal risk
    let data = {
        main: {
            humidity: 50,
            pressure: 1013,
            temp: 20
        },
        wind: {
            speed: 10
        },
        clouds: {
            all: 30
        },
        rain: {
            '1h': 0
        },
        weather: [{
            main: 'Clear',
            description: 'clear sky'
        }]
    };

    // Adjust values based on risk level
    switch(level) {
        case 1: // Minimal risk
            break;
        case 2: // Low risk
            data.main.humidity = 65;
            data.clouds.all = 60;
            data.weather[0].main = 'Clouds';
            data.weather[0].description = 'scattered clouds';
            break;
        case 3: // Moderate risk
            data.main.humidity = 75;
            data.clouds.all = 80;
            data.weather[0].main = 'Rain';
            data.weather[0].description = 'light rain';
            data.rain['1h'] = 5;
            break;
        case 4: // High risk
            data.main.humidity = 85;
            data.main.pressure = 1005;
            data.wind.speed = 30;
            data.clouds.all = 90;
            data.weather[0].main = 'Rain';
            data.weather[0].description = 'heavy intensity rain';
            data.rain['1h'] = 30;
            break;
        case 5: // Extreme risk
            data.main.humidity = 95;
            data.main.pressure = 990;
            data.wind.speed = 50;
            data.clouds.all = 100;
            data.weather[0].main = 'Thunderstorm';
            data.weather[0].description = 'thunderstorm with heavy rain';
            data.rain['1h'] = 100;
            break;
    }
    
    return data;
}

// Show home view
function showHomeView() {
    if (homeBtn) homeBtn.classList.add('active');
    if (predictorBtn) predictorBtn.classList.remove('active');
    if (weatherView) weatherView.style.display = 'block';
    if (predictorView) predictorView.style.display = 'none';
}

// Show predictor view
function showPredictorView() {
    if (predictorBtn) predictorBtn.classList.add('active');
    if (homeBtn) homeBtn.classList.remove('active');
    if (weatherView) weatherView.style.display = 'none';
    if (predictorView) predictorView.style.display = 'block';
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);
