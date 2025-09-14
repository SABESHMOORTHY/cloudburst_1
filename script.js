
//making object of weatherapi
const weatherApi = {
    key: '4eb3703790b356562054106543b748b2',
    baseUrl: 'https://api.openweathermap.org/data/2.5/weather'
}

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Get the input elements
    let searchInputBox = document.getElementById('input-box');
    const testLevelBtn = document.getElementById('test-level');
    
    // Add event listener for keypress on search box
    searchInputBox.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            const city = searchInputBox.value.trim();
            if (city !== '') {
                getWeatherReport(city);
            }
        }
    });
    
    // Add event listener for test level button
    testLevelBtn.addEventListener('click', function() {
        const levelSelect = document.getElementById('cloudburst-level');
        const selectedLevel = parseInt(levelSelect.value);
        
        if (isNaN(selectedLevel) || selectedLevel < 1 || selectedLevel > 20) {
            swal("Select a Level", "Please select a valid cloudburst level to test", "warning");
            return;
        }
        
        // Generate test data for the selected level
        const testData = generateTestDataForLevel(selectedLevel);
        
        // Clear any previous weather display
        document.getElementById('weather-body').style.display = 'block';
        document.getElementById('cloudburst-prediction').style.display = 'block';
        
        // Show the test data
        showCloudburstPrediction(testData);
    });
});

// Function to generate test data for a specific cloudburst level
function generateTestDataForLevel(level) {
    // Base values that will be adjusted based on level
    const baseRain = level * 12.5; // Scale rain with level (0-250mm)
    const baseHumidity = 40 + (level * 2); // 40-80%
    const basePressure = 1020 - (level * 1.5); // 1020-990 mb
    const baseWind = Math.min(5 + (level * 1.5), 40); // 5-40 km/h
    const baseClouds = Math.min(20 + (level * 4), 100); // 20-100%
    
    // Weather conditions based on level
    let weatherCondition = 'Clear';
    if (level >= 10) weatherCondition = 'Thunderstorm';
    else if (level >= 5) weatherCondition = 'Rain';
    else if (level >= 3) weatherCondition = 'Drizzle';
    
    return {
        main: {
            humidity: Math.min(100, baseHumidity + (Math.random() * 10 - 5)),
            pressure: Math.max(950, basePressure + (Math.random() * 10 - 5)),
            temp: 25 + (Math.random() * 10 - 5),
            feels_like: 25 + (Math.random() * 10 - 5),
            temp_min: 20 + (Math.random() * 10 - 5),
            temp_max: 30 + (Math.random() * 10 - 5)
        },
        wind: {
            speed: baseWind + (Math.random() * 5 - 2.5),
            deg: Math.floor(Math.random() * 360)
        },
        rain: {
            '1h': level >= 14 ? baseRain + (Math.random() * 20 - 10) : 0
        },
        clouds: {
            all: baseClouds + (Math.random() * 10 - 5)
        },
        weather: [
            {
                main: weatherCondition,
                description: 'Test condition for level ' + level,
                icon: level >= 10 ? '11d' : level >= 5 ? '10d' : '01d'
            }
        ],
        name: 'Test Location (Level ' + level + ')'
    };
}


//get waether report

function getWeatherReport(city) {
    fetch(`${weatherApi.baseUrl}?q=${city}&appid=${weatherApi.key}&units=metric`)  // fetch method fetching the data from  base url ...metric is used for unit in celcius......here i am appending the base url to get data by city name .  
        .then(weather => {   //weather is from api
            return weather.json(); // return data from api in JSON
        }).then(showWeaterReport);  // calling showweatherreport function

}

//show weather report

function showWeaterReport(weather) {
    let city_code = weather.cod;
    
    // Clear any previous weather display
    let weather_body = document.getElementById('weather-body');
    let cloudburst_prediction = document.getElementById('cloudburst-prediction');
    
    if (city_code === '400') { 
        swal("Empty Input", "Please enter any city", "error");
        weather_body.style.display = 'none';
        cloudburst_prediction.style.display = 'none';
        reset();
        return;
    } else if (city_code === '404') {
        swal("City Not Found", "The entered city wasn't found. Please check the spelling and try again.", "warning");
        weather_body.style.display = 'none';
        cloudburst_prediction.style.display = 'none';
        reset();
        return;
    }
    
    // Show weather information
    weather_body.style.display = 'block';
    cloudburst_prediction.style.display = 'block';
    
    let todayDate = new Date();
    
    // Update weather information
    weather_body.innerHTML = `
        <div class="location-deatils">
            <div class="city" id="city">${weather.name}, ${weather.sys.country}</div>
            <div class="date" id="date">${dateManage(todayDate)}</div>
        </div>
        <div class="weather-status">
            <div class="temp" id="temp">${Math.round(weather.main.temp)}&deg;C</div>
            <div class="weather" id="weather">
                ${weather.weather[0].main} <i class="${getIconClass(weather.weather[0].main)}"></i>
            </div>
            <div class="min-max" id="min-max">
                ${Math.floor(weather.main.temp_min)}&deg;C (min) / ${Math.ceil(weather.main.temp_max)}&deg;C (max)
            </div>
            <div id="updated_on">Updated as of ${getTime(todayDate)}</div>
        </div>
        <hr>
        <div class="day-details">
            <div class="basic">
                Feels like ${weather.main.feels_like}&deg;C | 
                Humidity ${weather.main.humidity}%<br>
                Pressure ${weather.main.pressure} mb | 
                Wind ${weather.wind.speed} KMPH
            </div>
        </div>
    `;
    
    // Add cloudburst prediction
    showCloudburstPrediction(weather);
    
    // Update background based on weather
    changeBg(weather.weather[0].main);
    
    // Reset the input field
    reset();
}

//making a function for the  last update current time 

function getTime(todayDate) {
    let hour =addZero(todayDate.getHours());
    let minute =addZero(todayDate.getMinutes());
    return `${hour}:${minute}`;
}

//date manage for return  current date
function dateManage(dateArg) {
    let days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    let months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    let year = dateArg.getFullYear();
    let month = months[dateArg.getMonth()];
    let date = dateArg.getDate();
    let day = days[dateArg.getDay()];
    // console.log(year+" "+date+" "+day+" "+month);
    return `${date} ${month} (${day}) , ${year}`
}

// function for the dynamic background change  according to weather status
function changeBg(status) {
    if (status === 'Clouds') {
        document.body.style.backgroundImage = 'url(clouds.jpg)';
        

    } else if (status === 'Rain') {
        document.body.style.backgroundImage = 'url(rainy.jpg)';
    } else if (status === 'Clear') {
        document.body.style.backgroundImage = 'url(clear.jpg)';
    }
    else if (status === 'Snow') {
        document.body.style.backgroundImage = 'url(snow.jpg)';
    }
    else if (status === 'Sunny') {
        document.body.style.backgroundImage = 'url(sunny.jpg)';
    } else if (status === 'Thunderstorm') {
        document.body.style.backgroundImage = 'url(thunderstorm.png)';
    } else if (status === 'Drizzle') {
        document.body.style.backgroundImage = 'url(drizzle.jpg)';
    } else if (status === 'Mist' || status === 'Haze' || status === 'Fog') {
        document.body.style.backgroundImage = 'url(mist.jpg)';
    }

    else {
        document.body.style.backgroundImage = 'url(bg.jpg)';
    }
}

//making a function for the classname of icon
function getIconClass(classarg) {
    if (classarg === 'Rain') {
        return 'fas fa-cloud-showers-heavy';
    } else if (classarg === 'Clouds') {
        return 'fas fa-cloud';
    } else if (classarg === 'Clear') {
        return 'fas fa-cloud-sun';
    } else if (classarg === 'Snow') {
        return 'fas fa-snowman';
    } else if (classarg === 'Sunny') {
        return 'fas fa-sun';
    } else if (classarg === 'Mist') {
        return 'fas fa-smog';
    } else if (classarg === 'Thunderstorm' || classarg === 'Drizzle') {
        return 'fas fa-thunderstorm';
    } else {
        return 'fas fa-cloud-sun';
    }
}

function reset() {
    let input = document.getElementById('input-box');
    input.value = "";
}

// funtion to add zero if hour and minute less than 10
function addZero(i) {
    if (i < 10) {
        i = "0" + i;
    }
    return i;
}

// Cloudburst severity levels (1-20)
const CLOUDBURST_LEVELS = [
    { level: 1, label: "Minimal", rainfall_mm_per_hr: "0-5", description: "Very light drizzle, no risk" },
    { level: 2, label: "Very Low", rainfall_mm_per_hr: "5-10", description: "Light rain, no flooding expected" },
    { level: 3, label: "Low", rainfall_mm_per_hr: "10-15", description: "Light steady rain" },
    { level: 4, label: "Mild", rainfall_mm_per_hr: "15-20", description: "Noticeable rainfall, no hazard" },
    { level: 5, label: "Moderate", rainfall_mm_per_hr: "20-25", description: "Moderate rain, slightly reduced visibility" },
    { level: 6, label: "Significant", rainfall_mm_per_hr: "25-30", description: "Moderate to heavy rain, isolated puddles" },
    { level: 7, label: "High", rainfall_mm_per_hr: "30-40", description: "Heavy rain, drainage stress possible" },
    { level: 8, label: "Very High", rainfall_mm_per_hr: "40-50", description: "Localized waterlogging possible" },
    { level: 9, label: "Extreme", rainfall_mm_per_hr: "50-60", description: "Short-term flooding risk" },
    { level: 10, label: "Severe", rainfall_mm_per_hr: "60-70", description: "Heavy downpour, visibility very poor" },
    { level: 11, label: "Very Severe", rainfall_mm_per_hr: "70-80", description: "Flash flooding likely in low-lying areas" },
    { level: 12, label: "Critical", rainfall_mm_per_hr: "80-90", description: "Drainage overwhelmed, landslide risk in hilly regions" },
    { level: 13, label: "Very Critical", rainfall_mm_per_hr: "90-100", description: "Conditions approaching cloudburst" },
    { level: 14, label: "Cloudburst Threshold", rainfall_mm_per_hr: "100-110", description: "Meets definition of cloudburst (≥100 mm/hr)" },
    { level: 15, label: "Cloudburst Level-1", rainfall_mm_per_hr: "110-125", description: "Sudden intense rain, flash floods certain" },
    { level: 16, label: "Cloudburst Level-2", rainfall_mm_per_hr: "125-150", description: "Severe damage to roads, structures possible" },
    { level: 17, label: "Cloudburst Level-3", rainfall_mm_per_hr: "150-175", description: "Large-scale landslides, river overflow" },
    { level: 18, label: "Cloudburst Level-4", rainfall_mm_per_hr: "175-200", description: "Widespread destruction, major infrastructure damage" },
    { level: 19, label: "Cloudburst Level-5", rainfall_mm_per_hr: "200-250", description: "Catastrophic flooding, total travel shutdown" },
    { level: 20, label: "Super Cloudburst", rainfall_mm_per_hr: ">250", description: "Extreme disaster, mass evacuation needed" }
];

// Cloudburst prediction function
function showCloudburstPrediction(weatherData) {
    const predictionElement = document.getElementById('cloudburst-prediction');
    const isTestData = weatherData.name && weatherData.name.startsWith('Test Location');
    
    // Get relevant weather data
    const humidity = weatherData.main.humidity;
    const pressure = weatherData.main.pressure;
    const windSpeed = weatherData.wind.speed;
    const cloudCover = weatherData.clouds ? weatherData.clouds.all : 0;
    const weatherCondition = weatherData.weather[0].main;
    const rain1h = weatherData.rain ? weatherData.rain['1h'] || 0 : 0;
    
    // If this is test data, use the level from the test data
    let cloudburstLevel = 1;
    if (isTestData) {
        const levelMatch = weatherData.name.match(/Level (\d+)/);
        if (levelMatch) {
            cloudburstLevel = parseInt(levelMatch[1]);
        }
    }
    
    // Calculate risk score (0-100) if not test data
    let riskScore = 0;
    
    if (!isTestData) {
        // Base score from current rain (if any)
        if (rain1h > 0) {
            // Map rain amount to a score (0-70)
            riskScore += Math.min(Math.floor(rain1h * 1.4), 70);
        }
        
        // Add factors (each can add up to 10 points)
        if (humidity > 80) riskScore += 10;
        else if (humidity > 70) riskScore += 5;
        else if (humidity > 60) riskScore += 2;
        
        if (pressure < 1000) riskScore += 10;
        else if (pressure < 1010) riskScore += 5;
        
        if (windSpeed > 20) riskScore += 10;
        else if (windSpeed > 10) riskScore += 5;
        
        if (cloudCover > 80) riskScore += 10;
        else if (cloudCover > 60) riskScore += 5;
        
        // Weather condition adjustments
        if (['Thunderstorm', 'Heavy Rain'].includes(weatherCondition)) {
            riskScore += 15;
        } else if (weatherCondition === 'Rain') {
            riskScore += 10;
        } else if (weatherCondition === 'Drizzle') {
            riskScore += 5;
        }
        
        // Cap the risk score at 100
        riskScore = Math.min(Math.max(Math.round(riskScore), 0), 100);
        
        // Map to cloudburst level (1-20)
        cloudburstLevel = Math.min(Math.ceil((riskScore / 100) * 20), 20);
    }
    
    const levelData = CLOUDBURST_LEVELS[cloudburstLevel - 1];
    
    // Determine icon and color based on severity
    let iconClass, alertClass;
    if (cloudburstLevel >= 15) {
        iconClass = 'fas fa-exclamation-triangle';
        alertClass = 'alert-critical';
    } else if (cloudburstLevel >= 10) {
        iconClass = 'fas fa-exclamation-circle';
        alertClass = 'alert-high';
    } else if (cloudburstLevel >= 5) {
        iconClass = 'fas fa-cloud-rain';
        alertClass = 'alert-moderate';
    } else {
        iconClass = 'fas fa-cloud-sun';
        alertClass = 'alert-low';
    }
    
    // Display the prediction
    predictionElement.innerHTML = `
        <div class="cloudburst-alert ${alertClass}">
            <div class="alert-header">
                <h3><i class="${iconClass}"></i> Cloudburst Alert: ${levelData.label} (Level ${levelData.level}/20)</h3>
                ${isTestData ? '<div class="test-badge">TEST MODE</div>' : ''}
            </div>
            
            <div class="severity-meter">
                <div class="severity-label">Severity Level: ${levelData.level}/20</div>
                <div class="severity-bar">
                    <div class="severity-fill" style="width: ${(cloudburstLevel / 20) * 100}%;"></div>
                </div>
                <div class="severity-description">${levelData.description}</div>
            </div>
            
            <div class="rainfall-info">
                <div class="rainfall-amount">
                    <i class="fas fa-tint"></i>
                    <span>Rainfall: ${rain1h > 0 ? rain1h.toFixed(1) + ' mm/h' : 'No rain'}</span>
                    <small>(${levelData.rainfall_mm_per_hr} mm/h typical for this level)</small>
                </div>
            </div>
            
            <div class="weather-factors">
                <div class="factor">
                    <i class="fas fa-tint"></i>
                    <span>Humidity: ${humidity}%</span>
                    <div class="factor-meter"><div style="width: ${humidity}%;"></div></div>
                </div>
                <div class="factor">
                    <i class="fas fa-tachometer-alt"></i>
                    <span>Pressure: ${pressure} mb</span>
                    <div class="factor-meter"><div style="width: ${100 - ((pressure - 950) / 70 * 100)}%;"></div></div>
                </div>
                <div class="factor">
                    <i class="fas fa-wind"></i>
                    <span>Wind: ${windSpeed.toFixed(1)} KMPH</span>
                    <div class="factor-meter"><div style="width: ${Math.min(windSpeed / 50 * 100, 100)}%;"></div></div>
                </div>
                <div class="factor">
                    <i class="fas fa-cloud"></i>
                    <span>Cloud Cover: ${cloudCover}%</span>
                    <div class="factor-meter"><div style="width: ${cloudCover}%;"></div></div>
                </div>
            </div>
            
            <div class="alert-actions">
                ${cloudburstLevel >= 10 ? `
                <button class="btn-alert" onclick="alert('${getSafetyTips(cloudburstLevel)}')">
                    <i class="fas fa-exclamation-circle"></i> Safety Tips
                </button>
                ` : ''}
                ${isTestData ? `
                <button class="btn-alert" onclick="document.getElementById('cloudburst-level').selectedIndex = 0; document.getElementById('cloudburst-prediction').style.display = 'none';">
                    <i class="fas fa-times"></i> Clear Test
                </button>
                ` : ''}
            </div>
        </div>
    `;
}

// Function to get safety tips based on cloudburst level
function getSafetyTips(level) {
    if (level >= 18) {
        return 'EXTREME DANGER! Evacuate to higher ground immediately. Avoid all travel. Stay away from rivers and streams. Follow emergency services instructions.';
    } else if (level >= 15) {
        return 'DANGER! Move to higher ground. Avoid all travel. Stay indoors on upper floors. Have emergency supplies ready.';
    } else if (level >= 12) {
        return 'High Risk: Stay indoors. Avoid low-lying areas. Prepare for possible evacuation. Monitor local alerts.';
    } else if (level >= 10) {
        return 'Moderate Risk: Be prepared to move to higher ground. Avoid crossing flooded areas. Stay informed.';
    } else if (level >= 7) {
        return 'Be aware of weather conditions. Avoid unnecessary travel. Keep emergency supplies ready.';
    } else {
        return 'Normal conditions. Stay aware of weather updates.';
    }
}