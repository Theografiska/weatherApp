import "./styles.css";
import { format, parseISO } from 'date-fns';

console.log('Hi');

const locationInput = document.querySelector("#location-input");
const searchBtn = document.querySelector("#search-btn");
const forecastDiv = document.querySelector("#forecast-div");
const cityHeading = document.querySelector("#city-heading");
const celsiusFahrenheitBtn = document.querySelector("#celsius-fahrenheit-btn")

async function getWeather() {
    try {
        const location = locationInput.value;
        const result = await fetch(`https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${location}?unitGroup=us&key=SS9Y6VJ23PJ46ZFSVAQ7ARBCF&contentType=json`);

        if (!result.ok) {
            if (result.status === 400) {
                clearPreviousLocation();
                celsiusFahrenheitBtn.className = "hidden";
                forecastDiv.textContent = `No such place as "${location}" was found in the database. Please check your input.`;
                throw new Error("Location not found. Please check your input.");
            } else {
                throw new Error(`Error: ${result.status} - ${result.statusText}`);
            }
        }

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
    clearPreviousLocation();

    celsiusFahrenheitBtn.className = "";

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

    const cityDescription = document.createElement("p");
    cityDescription.textContent = `5 day weather forecast for ${locationInput.value}.`;
    cityHeading.appendChild(cityDescription);

    const daysArray = data.days;

    for (let i = 0; i < 5; i++) {
        const unformattedDate = daysArray[i].datetime;
        const formattedDate = format(parseISO(unformattedDate), "MMM dd (eee)");
        console.log(`Day: ${formattedDate}, weather: ${daysArray[i].conditions}`);
        const dayDiv = document.createElement("div");
        dayDiv.className = "day-div";

        const dateH3 = document.createElement("h3");
        if (i === 0) {
            dateH3.textContent = `Today, ${formattedDate}`
        } else if (i === 1) {
            dateH3.textContent = `Tomorrow, ${formattedDate}`
        } else {
            dateH3.textContent = formattedDate;
        }
        dayDiv.appendChild(dateH3);

        const tempP = document.createElement("p");
        let minTemp = convertToCelsius(daysArray[i].tempmin).toFixed(1);
        let maxTemp = convertToCelsius(daysArray[i].tempmax).toFixed(1);
        tempP.textContent = `${minTemp} ... ${maxTemp} degrees °C`;
        dayDiv.appendChild(tempP);

        function toggleCelsFahr() {
            if (toggleCelsFahr.textContent === "Show ºF") {
                minTemp = daysArray[i].tempmin;
                maxTemp = daysArray[i].tempmax;
                tempP.textContent = `${minTemp} ... ${maxTemp} degrees °F`;
                toggleCelsFahr.textContent = "Show °C";
            } else {
                minTemp = convertToCelsius(daysArray[i].tempmin).toFixed(1);
                maxTemp = convertToCelsius(daysArray[i].tempmax).toFixed(1);
                tempP.textContent = `${minTemp} ... ${maxTemp} degrees °C`;
                toggleCelsFahr.textContent = "Show ºF";
            }
        }
        celsiusFahrenheitBtn.addEventListener("click", toggleCelsFahr);

        const iconFromAPI = daysArray[i].icon;
        const emojiDiv = document.createElement("div");
        emojiDiv.textContent = weatherIcons[iconFromAPI] ? weatherIcons[iconFromAPI] : "❓"; 
        /* This checks if the iconFromAPI key exists in the weatherIcons object. 
        If it does, weatherIcons[iconFromAPI] will return an emoji (e.g., "⛅" for "partly-cloudy-day"). 
        If it does not exist, it returns undefined, which is a falsy value. If the condition is true (key exists in weatherIcons). 
        The emoji corresponding to iconFromAPI is assigned to textContent. If the condition is false (key does not exist in weatherIcons). 
        The fallback value "❓" (question mark emoji) is used instead.*/
        const weatherP = document.createElement("span");
        weatherP.textContent = ` ${daysArray[i].conditions}`;
        emojiDiv.appendChild(weatherP);
        dayDiv.appendChild(emojiDiv);

        

        forecastDiv.appendChild(dayDiv);
    }
}

function clearPreviousLocation() {
    forecastDiv.textContent = "";
    cityHeading.textContent = "";
}

function convertToCelsius(fahrenheit) {
    return ((fahrenheit - 32) *5 ) / 9;
}

function convertToFahrenheit(celsius) {
    return (celsius * 9) / 5 +32;   
}