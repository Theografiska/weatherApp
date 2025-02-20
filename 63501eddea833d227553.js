import "./styles.css";
import { format, parseISO } from 'date-fns';

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
                cityHeading.textContent = `No such place as "${location}" was found in the database. Please check your input.`;
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
celsiusFahrenheitBtn.addEventListener("click", toggleCelsFahr);

async function fetchGif(description) {
    try {
        description += " sky weather conditions";
        const result = await fetch(`https://api.giphy.com/v1/gifs/translate?api_key=7Xtr62UwpOXqjueVijtlHHrPHMGf20j6&s=${encodeURIComponent(description)}`, {
            mode: 'cors'
        })
        const processed = await result.json();
        console.log(processed);
        return processed.data.images.fixed_height.url;
    } catch (error) {
        console.error("Error fetching GIF:", error);
        return null; // or a fallback URL
    } 
}

async function renderWeatherData(data) {
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

    // current weather section
    const currentHeading = document.createElement("h2");
    currentHeading.textContent = "Current weather"
    cityHeading.appendChild(currentHeading);

    const currentDayDiv = document.createElement("div");
    currentDayDiv.className = "day-div current";
    currentDayDiv.style.background = "linear-gradient(135deg, #a4cded, #8cbad6)";

    const cityHeader = document.createElement("h3");
    cityHeader.textContent = `${locationInput.value} (${data.resolvedAddress})`;
    currentDayDiv.appendChild(cityHeader);

    const currentDayText = document.createElement("div");
    currentDayText.className = "current-day-text";

    // temperature row for celsius
    const tempParaC = document.createElement("p");
    tempParaC.id = "temp-cels";
    tempParaC.className = "cels";
    tempParaC.textContent = `${convertToCelsius(data.currentConditions.temp)} °C`;
    currentDayText.appendChild(tempParaC);
    const feelsLikeParaC = document.createElement("p");
    feelsLikeParaC.className = "cels";
    feelsLikeParaC.textContent = `Feels like: ${convertToCelsius(data.currentConditions.feelslike)} °C`;
    currentDayText.appendChild(feelsLikeParaC);

    // temperature row for fahrenheit (hidden initially)
    const tempParaF = document.createElement("p");
    tempParaF.id = "temp-fahr";
    tempParaF.className = "fahr hidden";
    tempParaF.textContent = `${data.currentConditions.temp} °F`;
    currentDayText.appendChild(tempParaF);
    const feelsLikeParaF = document.createElement("p");
    feelsLikeParaF.className = "fahr hidden";
    let feelsLikeF = data.currentConditions.feelslike;
    feelsLikeParaF.textContent = `Feels like: ${feelsLikeF} °F`;
    currentDayText.appendChild(feelsLikeParaF);

    const windspeedKph = document.createElement("p");
    windspeedKph.className = "cels"   
    windspeedKph.textContent = `Windspeed: ${convertToKmh(data.currentConditions.windspeed)} km/h`;
    currentDayText.appendChild(windspeedKph); 

    const windspeedMph = document.createElement("p");
    windspeedMph.className = "fahr hidden"   
    windspeedMph.textContent = `Windspeed: ${data.currentConditions.windspeed} mph`;
    currentDayText.appendChild(windspeedMph); 

    const humidity = document.createElement("p");
    humidity.textContent = `Humidity: ${data.currentConditions.humidity}%`;
    currentDayText.appendChild(humidity);

    currentDayDiv.appendChild(currentDayText);

    const iconFromAPI = data.currentConditions.icon;
    const emojiDiv = document.createElement("div");
    emojiDiv.id = "emoji-div";
    emojiDiv.textContent = weatherIcons[iconFromAPI] ? weatherIcons[iconFromAPI] : "❓"; 
    /* This checks if the iconFromAPI key exists in the weatherIcons object. 
    If it does, weatherIcons[iconFromAPI] will return an emoji (e.g., "⛅" for "partly-cloudy-day"). 
    If it does not exist, it returns undefined, which is a falsy value. If the condition is true (key exists in weatherIcons). 
    The emoji corresponding to iconFromAPI is assigned to textContent. If the condition is false (key does not exist in weatherIcons). 
    The fallback value "❓" (question mark emoji) is used instead.*/
    const weatherP = document.createElement("span");
    weatherP.textContent = ` ${data.currentConditions.conditions}`;
    emojiDiv.appendChild(weatherP);
    currentDayDiv.appendChild(emojiDiv);

    const weatherGif = document.createElement("img");
    const gifURL = await fetchGif(data.currentConditions.conditions);
    if (gifURL) {
        weatherGif.src = gifURL;
    } else {
        // Handle the case where the GIF fetch fails.  Display a placeholder, message, or nothing.
        weatherGif.src = "placeholder.gif"; // Example: replace with your placeholder
        console.log("Could not find a GIF for " + data.currentConditions.conditions);
        // or
        // weatherGif.style.display = "none"; // Hide the image element
        // or
        // weatherGif.alt = "Could not load GIF";
    }
    currentDayDiv.appendChild(weatherGif);

    cityHeading.appendChild(currentDayDiv);


    // forecast section
    const forecastHeader = document.createElement("h2");
    forecastHeader.textContent = `5-day weather forecast`;
    forecastDiv.appendChild(forecastHeader);

    const daysArray = data.days;
    for (let i = 0; i < 5; i++) {
        const unformattedDate = daysArray[i].datetime;
        const formattedDate = format(parseISO(unformattedDate), "MMM dd (eee)");
        const dayDiv = document.createElement("div");
        dayDiv.className = "day-div";

        const dateH3 = document.createElement("h4");
        if (i === 0) {
            dateH3.textContent = `Today, ${formattedDate}`
        } else if (i === 1) {
            dateH3.textContent = `Tomorrow, ${formattedDate}`
        } else {
            dateH3.textContent = formattedDate;
        }
        dayDiv.appendChild(dateH3);

        // temperature row for celsius
        const tempParaC = document.createElement("p");
        tempParaC.className = "cels";
        let minTempC = convertToCelsius(daysArray[i].tempmin);
        let maxTempC = convertToCelsius(daysArray[i].tempmax);
        tempParaC.textContent = `${minTempC} ... ${maxTempC} °C`;
        dayDiv.appendChild(tempParaC);

        // temperature row for fahrenheit (hidden initially)
        const tempParaF = document.createElement("p");
        tempParaF.className = "fahr hidden";
        let minTempF = daysArray[i].tempmin;
        let maxTempF = daysArray[i].tempmax;
        tempParaF.textContent = `${minTempF} ... ${maxTempF} °F`;
        dayDiv.appendChild(tempParaF);

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

    // resetting the button if new city was chosen
    celsiusFahrenheitBtn.textContent = "Show °F";
    celsiusFahrenheitBtn.style.backgroundColor = "#4CAF50";
}

function convertToCelsius(fahrenheit) {
    return (((fahrenheit - 32) * 5 ) / 9).toFixed(1);
}

function convertToKmh(mph) {
    return (mph * 1.60934).toFixed(1);
}

function toggleCelsFahr() {
    const allFehrenheitParas = document.querySelectorAll(".fahr");
    const allCelsiusParas = document.querySelectorAll(".cels");
    if (celsiusFahrenheitBtn.textContent === "Show °F") {
        allFehrenheitParas.forEach(para => {
            para.className = "fahr";
        });

        allCelsiusParas.forEach(para => {
            para.className = "cels hidden";
        })

        celsiusFahrenheitBtn.textContent = "Show °C";
        celsiusFahrenheitBtn.style.backgroundColor = "#ff7043";
    } else {
        allFehrenheitParas.forEach(para => {
            para.className = "fahr hidden";
        });

        allCelsiusParas.forEach(para => {
            para.className = "cels";
        })

        celsiusFahrenheitBtn.textContent = "Show °F";
        celsiusFahrenheitBtn.style.backgroundColor = "#4CAF50";
    }
}

function changeBackground(data) {

}