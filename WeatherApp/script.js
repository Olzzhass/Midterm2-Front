const API = "b7835243ac48fc04e329679b80a59ca8";
const API_URL = "https://api.openweathermap.org/data/2.5/weather";
const weatherCardsGrid = document.querySelector(".forecast-grid");
let currentTemp = 0;
let forecastTemps = [];
let json = null;

function searchWeather() {
    const city = document.getElementById('city').value.trim();
    if (city) {
        getWeather(city);
    } else {
        alert("Please enter a city name.");
    }
}

async function getWeather(city) {
    const requestUrl = `${API_URL}?q=${city}&appid=${API}&units=metric`;
    await fetchWeatherData(requestUrl);
}

async function getWeatherByLocation(lat, lon) {
    const requestUrl = `${API_URL}?lat=${lat}&lon=${lon}&appid=${API}&units=metric`;
    await fetchWeatherData(requestUrl);
}

async function fetchWeatherData(requestUrl) {
    try {
        const response = await fetch(requestUrl);
        const data = await response.json();
        if (data.cod === 200) {
            updateWeatherInfo(data);
            getForecastDetails(data.name, data.coord.lat, data.coord.lon);
        } else {
            document.getElementById('weather-city').textContent = "City not found";
            resetWeatherInfo();
            resetForecastInfo();
        }
    } catch (error) {
        console.error("Error fetching weather data:", error);
        document.getElementById('weather-city').textContent = "Error fetching weather data";
        resetWeatherInfo();
    }
}

function updateWeatherInfo(data) {
    document.getElementById('weather-city').textContent = data.name;
    document.getElementById('weather-temp').textContent = data.main.temp + " °C";
    currentTemp = data.main.temp;
    document.getElementById('weather-desc').textContent = data.weather[0].description;
    document.getElementById('weather-humidity').textContent = data.main.humidity;
    document.getElementById('weather-wind').textContent = data.wind.speed;

    const weatherMain = data.weather[0].main;
    document.querySelector('.weather_right img').src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    document.querySelector('.weather_right img').alt = weatherMain;
    document.getElementById('celcius').checked = true;
    document.getElementById('farahngeit').checked = false;
}

function resetWeatherInfo() {
    document.getElementById('weather-temp').textContent = "--";
    document.getElementById('weather-desc').textContent = "--";
    document.getElementById('weather-humidity').textContent = "--";
    document.getElementById('weather-wind').textContent = "--";

    document.querySelector('.weather_right img').src = '/WeatherApp/icon/no-result.svg';
}

function resetForecastInfo() {
    weatherCardsGrid.innerHTML = `
        <div class="forecast-card">
            <p class="forecast-date">______</p>
            <img src="/WeatherApp/icon/no-result.svg" alt="No Result icon" id="icon1" class="forecast-icon">
            <p class="forecast_desc">Weather: ______</p>
            <p class="forecast_temp">Max: -- °C</p>
            <p class="forecast_temp">Min: -- °C</p>
        </div>
        <div class="forecast-card">
            <p class="forecast-date">______</p>
            <img src="/WeatherApp/icon/no-result.svg" alt="No Result icon" id="icon1" class="forecast-icon">
            <p class="forecast_desc">Weather: ______</p>
            <p class="forecast_temp">Max: -- °C</p>
            <p class="forecast_temp">Min: -- °C</p>
        </div>
        <div class="forecast-card">
            <p class="forecast-date">______</p>
            <img src="/WeatherApp/icon/no-result.svg" alt="No Result icon" id="icon1" class="forecast-icon">
            <p class="forecast_desc">Weather: ______</p>
            <p class="forecast_temp">Max: -- °C</p>
            <p class="forecast_temp">Min: -- °C</p>
        </div>
        <div class="forecast-card">
            <p class="forecast-date">______</p>
            <img src="/WeatherApp/icon/no-result.svg" alt="No Result icon" id="icon1" class="forecast-icon">
            <p class="forecast_desc">Weather: ______</p>
            <p class="forecast_temp">Max: -- °C</p>
            <p class="forecast_temp">Min: -- °C</p>
        </div>
        <div class="forecast-card">
            <p class="forecast-date">______</p>
            <img src="/WeatherApp/icon/no-result.svg" alt="No Result icon" id="icon1" class="forecast-icon">
            <p class="forecast_desc">Weather: ______</p>
            <p class="forecast_temp">Max: -- °C</p>
            <p class="forecast_temp">Min: -- °C</p>
        </div>`;
}

async function getForecastDetails(city, lat, lon) {
    const FORECAST_API_URL = `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API}&units=metric`;

    fetch(FORECAST_API_URL).then(res => res.json()).then(data => {
        const uniqueForecastDays = [];
        const fiveDaysForecast = data.list.filter(forecast => {
            const forecastDate = new Date(forecast.dt_txt).getDate();
            if(!uniqueForecastDays.includes(forecastDate)) {
                return uniqueForecastDays.push(forecastDate);
            }
        });

        weatherCardsGrid.innerHTML = "";

        json = fiveDaysForecast;

        fiveDaysForecast.forEach((weatherItem, index) => {
            if(index != 0) {
                weatherCardsGrid.insertAdjacentHTML("beforeend", createForecastCard(weatherItem));
            }
        });
    }).catch(() => {
        alert("Error when forecast details");
    });
}

function createForecastCard(weatherItem) {

    const date = new Date(weatherItem.dt_txt.split(" ")[0]);
    const dayOfWeek = date.toLocaleString('en-us', { weekday: 'long' });

    return `<div class="forecast-card" id="forecast-day1">
                <p class="forecast-date" id="date1">${dayOfWeek}</p>
                <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="Weather Icon" id="icon1" class="forecast-icon">
                <p class="forecast_desc" id="desc1">${weatherItem.weather[0].description}</p>
                <p class="forecast_temp" id="tempMax1">Max: ${weatherItem.main.temp_max} °C</p>
                <p class="forecast_temp" id="tempMin1">Min: ${weatherItem.main.temp_min} °C</p>
            </div>`;
}

function getCurrentLocationWeather() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                getWeatherByLocation(latitude, longitude);
                document.getElementById('city').value = '';
            },
            (error) => {
                console.error("Error getting location:", error);
                alert("Unable to retrieve location. Please allow location access.");
            }
        );
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

function convertTemp(temp) {
    const isCelcius = document.getElementById('celcius').checked;
    return isCelcius ? temp : (temp * 9/5) + 32;
}

function getTemperatureUnit() {
    return document.getElementById('celcius').checked ? "°C" : "°F";
}

function toggleCheckbox(checkbox) {
    if (!checkbox.checked) {
        checkbox.checked = true;
    }
}

function updateForecastCardFarahnheit(weatherItem) {
    const date = new Date(weatherItem.dt_txt.split(" ")[0]);
    const dayOfWeek = date.toLocaleString('en-us', { weekday: 'long' });

    return `<div class="forecast-card" id="forecast-day1">
                <p class="forecast-date" id="date1">${dayOfWeek}</p>
                <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="Weather Icon" id="icon1" class="forecast-icon">
                <p class="forecast_desc" id="desc1">${weatherItem.weather[0].description}</p>
                <p class="forecast_temp" id="tempMax1">Max: ${convertTemp(weatherItem.main.temp_max)} °F</p>
                <p class="forecast_temp" id="tempMin1">Min: ${convertTemp(weatherItem.main.temp_min)} °F</p>
            </div>`;
}

function convertToCelcius() {
    document.getElementById('weather-temp').textContent = currentTemp + " °C";

    weatherCardsGrid.innerHTML = '';

    for (let i = 1; i < 6; i++) {
        weatherCardsGrid.insertAdjacentHTML("beforeend", createForecastCard(json[i]));
    }
}

function convertToFarahngeit() {
    document.getElementById('weather-temp').textContent = convertTemp(currentTemp) + " °F";

    weatherCardsGrid.innerHTML = '';

    for (let i = 1; i < 6; i++) {
        weatherCardsGrid.insertAdjacentHTML("beforeend", updateForecastCardFarahnheit(json[i]));
    }
}

document.getElementById("celcius").addEventListener("change", function() {
    if (this.checked) {
        document.getElementById("farahngeit").checked = false;
    }

    convertToCelcius();
});

document.getElementById("farahngeit").addEventListener("change", function() {
    if (this.checked) {
        document.getElementById("celcius").checked = false;
    }

    convertToFarahngeit();
});

window.onload = () => {
    getCurrentLocationWeather();
};

document.querySelector(".curr_loc_btn").addEventListener("click", getCurrentLocationWeather);

document.querySelector(".search_btn").addEventListener("click", searchWeather);
