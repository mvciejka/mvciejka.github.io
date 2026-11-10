// ============================================================
//
//              Obsługa API OpenWeatherMap
//
// ============================================================

const apiKey = "6e6867ccf173ef49bf15681d25570c36";
const apiUrlTemplate = (city, type, mode) => `https://api.openweathermap.org/data/2.5/${type}?q=${city}&appid=${apiKey}&mode=${mode}&units=metric&lang=pl`;

function xhrRequestXml(url) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url);

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        // responseXML jest gotowym dokumentem, jeśli serwer zwrócił poprawny XML
        const doc = xhr.responseXML
          ?? new DOMParser().parseFromString(xhr.responseText, "application/xml");
        resolve(doc);
      } else {
        reject(new Error("Nie udało się pobrać danych pogodowych."));
      }
    };

    xhr.onerror = () => reject(new Error("Błąd sieci podczas pobierania danych."));

    xhr.send();
  });
}

async function apiRequest(city, type, mode) {
  const url = apiUrlTemplate(city, type, mode);

  if (mode === "xml") {
    return xhrRequestXml(url);
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Nie udało się pobrać danych pogodowych.");
  }
  return response.json();
}

function clearResults() {
  const results = document.getElementById("results");
  results.innerHTML = "";
}


// ============================================================
//
//              Tworzenie kontenera z danymi pogodowymi
//
// ============================================================
function createWeatherContainer({cityName, fromTime, temperature, feels_like, clouds, type, icon}) {
  const results = document.getElementById("results");

  // Formatowanie daty
  const fromDate = new Date(fromTime).toLocaleDateString('pl-PL', {
    hour: "2-digit",
    minute: "2-digit",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });


  const weatherInfo = `
      <h2>${cityName}</h2>
      <h3>${fromDate}</h3>
      <div class="image">
          <img src="https://openweathermap.org/img/wn/${icon}.png" alt="Ikona pogody">
      </div>
      <table class="weather-table">
        <tr>
          <th>Temperatura:</th>
          <td>${temperature} °C</td>
        </tr>
        <tr>
          <th>Odczuwalna:</th>
          <td>${feels_like} °C</td>
        </tr>
        <tr>
          <th>Zachmurzenie:</th>
          <td>${clouds}</td>
        </tr>
      </table>
    `;

  const newDiv = document.createElement("div");
  newDiv.innerHTML = weatherInfo;
  newDiv.classList.add("container");
  results.appendChild(newDiv);
}

// cnt = 40 - 5 dni co 3 godziny, czyli 8 pomiarów na dzień, razem 40 pomiarów
function displayWeatherForecast(data, mode, cnt = 40) {
  var list_length = 0;

  if (mode === "json") {
    list_length = data.length;
  } else {
    list_length = data.getElementsByTagName("time").length;
  }
  if (cnt > list_length) {
    cnt = list_length;
  }

  for (let i = 0; i < cnt; i++) {
    if (mode === "json") {
      const weatherInfo = {
        temperature: data.list[i].main.temp,
        feels_like: data.list[i].main.feels_like,
        clouds: data.list[i].weather[0].description,
        cityName: data.city.name,
        fromTime: data.list[i].dt * 1000,
        type: "json",
        icon: data.list[i].weather[0].icon
      }
      createWeatherContainer(weatherInfo);
    } else if (mode === "xml") {
      console.log("xml");
      const cityName = data.getElementsByTagName("name")[0].textContent;
      console.log("cityName: ", cityName);
      const temperature = data.getElementsByTagName("temperature")[i].getAttribute("value");
      console.log("temp: ", temperature);
      const feels_like = data.getElementsByTagName("feels_like")[i].getAttribute("value");
      console.log("feels_like: ", feels_like);
      const clouds = data.getElementsByTagName("clouds")[i].getAttribute("value");
      console.log("clouds: ", clouds);
      const fromTime = data.getElementsByTagName("time")[i].getAttribute("from");
      console.log("fromTime: ", fromTime);

      const weatherInfo = {
        temperature: temperature,
        feels_like: feels_like,
        clouds: clouds,
        cityName: cityName,
        fromTime: fromTime,
        type: "xml",
        icon: data.getElementsByTagName("symbol")[i].getAttribute("var")
      }

      createWeatherContainer(weatherInfo);
    }
  }
}

function displayCurrentWeather(data, mode) {
  if (mode === "json") {
    const weatherInfo = {
      temperature: data.main.temp,
      feels_like: data.main.feels_like,
      clouds: data.weather[0].description,
      cityName: data.name,
      fromTime: data.dt * 1000,
      type: "json",
      icon: data.weather[0].icon
    }
    createWeatherContainer(weatherInfo);
  } else if (mode === "xml") {
    const cityName = data.getElementsByTagName("city")[0].getAttribute("name");
    const temperature = data.getElementsByTagName("temperature")[0].getAttribute("value");
    const feels_like = data.getElementsByTagName("feels_like")[0].getAttribute("value");
    const clouds = data.getElementsByTagName("clouds")[0].getAttribute("name");
    const fromTime = data.getElementsByTagName("lastupdate")[0].getAttribute("value");

    const weatherInfo = {
      temperature: temperature,
      feels_like: feels_like,
      clouds: clouds,
      cityName: cityName,
      fromTime: fromTime,
      type: "xml",
      icon: data.getElementsByTagName("weather")[0].getAttribute("icon")
    }

    createWeatherContainer(weatherInfo);
  }
}


async function getWeather() {
  const city = document.getElementById("city").value;
  clearResults();
  try {
    const data = await apiRequest(city, "weather", "xml");
    console.log("Pobrane dane xml: ", data);
    displayCurrentWeather(data, "xml");

    const jsonData = await apiRequest(city, "forecast", "json");
    console.log("Pobrane dane json: ", jsonData);
    displayWeatherForecast(jsonData, "json");
  } catch (error) {
    console.error(error);
    alert("Wystąpił błąd podczas pobierania danych pogodowych.");
  }
}

// ============================================================
//
//              main
//
// ============================================================
async function main() {
  clearResults();
  const data = await apiRequest("Szczecin", "weather", "xml");
  displayCurrentWeather(data, "xml");
}

main();
