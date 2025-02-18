import "./styles.css";

console.log('Hi');

const locationInput = document.querySelector("#location-input");
const searchBtn = document.querySelector("#search-btn");
const forecastDiv = document.querySelector("#forecast-div");
const cityHeading = document.querySelector("#city-heading");

async function getWeather() {
    try {
        const location = locationInput.value;
        const result = await fetch(`https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${location}?unitGroup=us&key=SS9Y6VJ23PJ46ZFSVAQ7ARBCF&contentType=json`);
        const data = await result.json();
        console.log(data);
        renderWeatherData(data);
        return data;
    } catch (err) {
        console.log(err);
    }
}

searchBtn.addEventListener("click", getWeather)
function renderWeatherData(data) {
    const weatherIcons = {
        "clear-day": "☀️",
        "clear-night": "🌙",
        "rain": "🌧️",
        "snow": "❄️",
        "sleet": "🌨️",
        "wind": "💨",
        "fog": "🌫️",
        "cloudy": "☁️",
        "partly-cloudy-day": "⛅",
        "partly-cloudy-night": "🌤️"
      };

    const cityHeader = document.createElement("h2");
    cityHeader.textContent = data.resolvedAddress;
    cityHeading.appendChild(cityHeader);

    const daysArray = data.days;

    for (let i = 0; i < 5; i++) {
        console.log(`Day: ${daysArray[i].datetime}, weather: ${daysArray[i].conditions}`);
        const dayDiv = document.createElement("div");
        dayDiv.className = "day-div";

        const dateP = document.createElement("p");
        dateP.textContent = daysArray[i].datetime;
        dayDiv.appendChild(dateP);

        const iconFromAPI = daysArray[i].icon;
        const emojiDiv = document.createElement("div");
        emojiDiv.textContent = weatherIcons[iconFromAPI] ? weatherIcons[iconFromAPI] : "❓"; 
        /* This checks if the iconFromAPI key exists in the weatherIcons object. 
        If it does, weatherIcons[iconFromAPI] will return an emoji (e.g., "⛅" for "partly-cloudy-day"). 
        If it does not exist, it returns undefined, which is a falsy value. If the condition is true (key exists in weatherIcons). 
        The emoji corresponding to iconFromAPI is assigned to textContent. If the condition is false (key does not exist in weatherIcons). 
        The fallback value "❓" (question mark emoji) is used instead.*/
        dayDiv.appendChild(emojiDiv);

        const weatherP = document.createElement("p");
        weatherP.textContent = daysArray[i].conditions;
        dayDiv.appendChild(weatherP);
        
        forecastDiv.appendChild(dayDiv);
    }
}