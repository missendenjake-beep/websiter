const quickPlaces = [
  'Luton',
  'London',
  'Manchester',
  'Birmingham',
  'Leeds',
  'Liverpool',
  'Bristol',
  'Oxford',
  'Cambridge',
  'York',
  'Newcastle',
  'Norwich',
  'Plymouth',
  'Leicester'
];

const weatherCodes = {
  0: { label: 'Clear sky', icon: '☀️' },
  1: { label: 'Mostly clear', icon: '🌤️' },
  2: { label: 'Partly cloudy', icon: '⛅' },
  3: { label: 'Overcast', icon: '☁️' },
  45: { label: 'Fog', icon: '🌫️' },
  48: { label: 'Depositing rime fog', icon: '🌫️' },
  51: { label: 'Light drizzle', icon: '🌦️' },
  53: { label: 'Drizzle', icon: '🌦️' },
  55: { label: 'Heavy drizzle', icon: '🌧️' },
  56: { label: 'Freezing drizzle', icon: '🌧️' },
  57: { label: 'Heavy freezing drizzle', icon: '🌧️' },
  61: { label: 'Light rain', icon: '🌦️' },
  63: { label: 'Rain', icon: '🌧️' },
  65: { label: 'Heavy rain', icon: '🌧️' },
  66: { label: 'Freezing rain', icon: '🌧️' },
  67: { label: 'Heavy freezing rain', icon: '🌧️' },
  71: { label: 'Light snow', icon: '🌨️' },
  73: { label: 'Snow', icon: '❄️' },
  75: { label: 'Heavy snow', icon: '❄️' },
  77: { label: 'Snow grains', icon: '❄️' },
  80: { label: 'Rain showers', icon: '🌦️' },
  81: { label: 'Heavy showers', icon: '🌧️' },
  82: { label: 'Violent showers', icon: '⛈️' },
  85: { label: 'Snow showers', icon: '🌨️' },
  86: { label: 'Heavy snow showers', icon: '🌨️' },
  95: { label: 'Thunderstorm', icon: '⛈️' },
  96: { label: 'Thunderstorm with hail', icon: '⛈️' },
  99: { label: 'Thunderstorm with hail', icon: '⛈️' }
};

const state = {
  customMode: false,
  currentLocation: null,
  weather: null,
  backgroundImage: null
};

const appName = document.querySelector('#appName');
const placeInput = document.querySelector('#placeInput');
const customInput = document.querySelector('#customInput');
const customPanel = document.querySelector('#customPanel');
const customTab = document.querySelector('#customTab');
const closePanel = document.querySelector('#closePanel');
const countryInput = document.querySelector('#countryInput');
const globalSearchWrap = document.querySelector('#globalSearchWrap');
const searchForm = document.querySelector('#searchForm');
const quickPlacesWrap = document.querySelector('#quickPlaces');
const locationLabel = document.querySelector('#locationLabel');
const currentTempEl = document.querySelector('#currentTemp');
const weatherSummary = document.querySelector('#weatherSummary');
const weatherIcon = document.querySelector('#weatherIcon');
const feelsLikeEl = document.querySelector('#feelsLike');
const windSpeedEl = document.querySelector('#windSpeed');
const rainChanceEl = document.querySelector('#rainChance');
const humidityEl = document.querySelector('#humidity');
const forecastList = document.querySelector('#forecastList');

function createQuickPlaceButtons() {
  quickPlacesWrap.innerHTML = '';

  quickPlaces.forEach((place) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'quick-chip';
    button.textContent = place;
    button.addEventListener('click', () => {
      placeInput.value = place;
      fetchWeatherForQuery(place);
    });
    quickPlacesWrap.appendChild(button);
  });
}

function setBackground(placeName) {
  const imageUrl = `https://images.unsplash.com/featured/1600x900/?${encodeURIComponent(placeName)}&auto=format&fit=crop&w=1600&q=80`;
  document.body.style.backgroundImage = `linear-gradient(rgba(15, 23, 42, 0.33), rgba(15, 23, 42, 0.43)), url('${imageUrl}')`;
}

function updateAppName() {
  appName.textContent = state.customMode ? "Arthur's weather" : 'Weather App';
  document.title = state.customMode ? "Arthur's weather" : 'Weather App';
}

function revealCustomPanel() {
  customPanel.classList.add('visible');
}

function hideCustomPanel() {
  customPanel.classList.remove('visible');
}

function activateCustomMode() {
  state.customMode = true;
  document.body.classList.add('arthur-mode');
  globalSearchWrap.classList.remove('hidden');
  updateAppName();
  revealCustomPanel();
}

function handleCustomCodeInput() {
  const value = customInput.value.trim().toLowerCase();
  if (value === 'jake missenden') {
    activateCustomMode();
    countryInput.focus();
    return;
  }

  if (value.length > 0 && value !== 'jake missenden') {
    customInput.value = '';
    customInput.placeholder = 'Try again...';
  }
}

function setupCustomPanel() {
  customTab.addEventListener('click', () => {
    customPanel.classList.toggle('visible');
  });

  closePanel.addEventListener('click', hideCustomPanel);

  customInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleCustomCodeInput();
    }
  });

  customInput.addEventListener('blur', handleCustomCodeInput);

  countryInput.addEventListener('keydown', async (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      const query = countryInput.value.trim();
      if (!query) return;
      await fetchWeatherForQuery(query, true);
    }
  });
}

function getWeatherCodeData(code) {
  return weatherCodes[code] || { label: 'Weather', icon: '🌤️' };
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric' }).format(date);
}

function renderForecast(data) {
  forecastList.innerHTML = '';

  const daily = data.daily || {};
  const dates = daily.time || [];
  const tempsMax = daily.temperature_2m_max || [];
  const tempsMin = daily.temperature_2m_min || [];
  const codes = daily.weather_code || [];

  dates.slice(0, 6).forEach((date, index) => {
    const item = document.createElement('div');
    item.className = 'forecast-item';

    const code = codes[index];
    const weather = getWeatherCodeData(code);

    item.innerHTML = `
      <span>${formatDate(date)}</span>
      <div class="forecast-icon">${weather.icon}</div>
      <strong>${Math.round(tempsMax[index])}°</strong>
      <span>${Math.round(tempsMin[index])}° • ${weather.label}</span>
    `;

    forecastList.appendChild(item);
  });
}

function renderWeatherData(weather, locationName, regionName) {
  const current = weather.current || {};
  const weatherCode = getWeatherCodeData(current.weather_code);
  const labelText = `${locationName}${regionName ? `, ${regionName}` : ''}`;

  locationLabel.textContent = labelText;
  currentTempEl.textContent = `${Math.round(current.temperature_2m)}°C`;
  weatherSummary.textContent = weatherCode.label;
  weatherIcon.textContent = weatherCode.icon;
  feelsLikeEl.textContent = `${Math.round(current.apparent_temperature)}°C`;
  windSpeedEl.textContent = `${Math.round(current.wind_speed_10m)} km/h`;
  rainChanceEl.textContent = `${Math.round(current.precipitation || 0)}%`;
  humidityEl.textContent = `${Math.round(current.relative_humidity_2m || 0)}%`;

  renderForecast(weather);
  setBackground(locationName);
}

async function geocodeLocation(query, forceGlobal = false) {
  const params = new URLSearchParams({
    name: query,
    count: '10',
    language: 'en',
    format: 'json'
  });

  if (!forceGlobal && !state.customMode) {
    params.set('countrycode', 'GB');
  }

  const url = `https://geocoding-api.open-meteo.com/v1/search?${params.toString()}`;
  const response = await fetch(url);
  const data = await response.json();
  const results = data.results || [];

  if (!results.length) {
    throw new Error('No matching place was found. Try another location.');
  }

  if (!forceGlobal && !state.customMode) {
    const englandMatch = results.filter((item) => {
      const country = (item.country || '').toLowerCase();
      const admin1 = (item.admin1 || '').toLowerCase();
      return country.includes('united kingdom') || admin1.includes('england');
    });

    return englandMatch.length ? englandMatch[0] : results[0];
  }

  return results[0];
}

async function fetchWeatherData(latitude, longitude, timezone) {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: 'temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,precipitation',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min',
    timezone: 'auto',
    forecast_days: '6'
  });

  const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
  const response = await fetch(url);
  const data = await response.json();

  if (!data.current) {
    throw new Error('Weather data could not be loaded.');
  }

  return data;
}

async function fetchWeatherForQuery(query, forceGlobal = false) {
  try {
    const result = await geocodeLocation(query, forceGlobal);
    const weather = await fetchWeatherData(result.latitude, result.longitude, result.timezone);

    const locationName = result.name || query;
    const regionName = result.admin1 || result.country || 'England';

    state.currentLocation = { locationName, regionName };
    renderWeatherData(weather, locationName, regionName);

    placeInput.value = locationName;
    weatherSummary.textContent = getWeatherCodeData(weather.current.weather_code).label;
  } catch (error) {
    window.alert(error.message || 'Could not load the weather for that location.');
  }
}

searchForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const query = placeInput.value.trim();
  if (!query) {
    return;
  }

  if (state.customMode) {
    await fetchWeatherForQuery(query, true);
  } else {
    await fetchWeatherForQuery(query, false);
  }
});

createQuickPlaceButtons();
setupCustomPanel();
updateAppName();
fetchWeatherForQuery('Luton', false);
