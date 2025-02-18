import React, { useState, useEffect } from 'react';
import './App.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSun,
  faCloud,
  faCloudSun,
  faMoon,
  faCloudMoon,
  faSnowflake,
  faCloudRain,
  faBolt,
  faWind
} from '@fortawesome/free-solid-svg-icons';

function App() {
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('current');


  const API_KEY = '0a999f0a093897bf13677f558bc46d5d';
  const LAT = 49.1942;
  const LON = 16.6085;

  const getWeatherIcon = (code, isNight = false) => {
    if (code >= 200 && code < 300) return <FontAwesomeIcon icon={faBolt} size="2x" />;
    if (code >= 300 && code < 600) return <FontAwesomeIcon icon={faCloudRain} size="2x" />;
    if (code >= 600 && code < 700) return <FontAwesomeIcon icon={faSnowflake} size="2x" />;
    if (code === 800) {
      if (isNight) return <FontAwesomeIcon icon={faMoon} size="2x" />;
      return <FontAwesomeIcon icon={faSun} size="2x" />;
    }
    if (code === 801 || code === 802) {
      if (isNight) return <FontAwesomeIcon icon={faCloudMoon} size="2x" />;
      return <FontAwesomeIcon icon={faCloudSun} size="2x" />;
    }
    return <FontAwesomeIcon icon={faCloud} size="2x" />;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch current weather
        const currentResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${LAT}&lon=${LON}&units=metric&appid=${API_KEY}`
        );
        if (!currentResponse.ok) {
          throw new Error(`Weather API error: ${currentResponse.status}`);
        }
        const currentData = await currentResponse.json();

        
        const forecastResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${LAT}&lon=${LON}&units=metric&appid=${API_KEY}`
        );
        if (!forecastResponse.ok) {
          throw new Error(`Forecast API error: ${forecastResponse.status}`);
        }
        const forecastData = await forecastResponse.json();

        setWeatherData(currentData);
        setForecastData(forecastData);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatTime = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });
  };

  const isNighttime = (dt) => {
    const hour = new Date(dt * 1000).getHours();
    return hour >= 20 || hour < 6;
  };

  if (loading) return <div className="container">Loading...</div>;
  if (error) return <div className="container">Error: {error}</div>;
  if (!weatherData || !forecastData) return <div className="container">No weather data available</div>;

  const renderCurrentWeather = () => (
    <div className="weather-info">
      <h2>Current Weather for Brno</h2>
      <div className="temperature">
        <div className="icon-container">
          {getWeatherIcon(weatherData.weather[0].id, isNighttime(weatherData.dt))}
        </div>
        <div>
          <p className="weather-description">{weatherData.weather[0].description}</p>
          <p className="temp">{Math.round(weatherData.main.temp)}°C</p>
          <p className="feels-like">Feels like {Math.round(weatherData.main.feels_like)}°C</p>
        </div>
      </div>
      <div className="details">
        <p>Humidity: {weatherData.main.humidity}%</p>
        <p>Wind: {Math.round(weatherData.wind.speed)} m/s</p>
        <p>Pressure: {weatherData.main.pressure} hPa</p>
      </div>
    </div>
  );

  const renderHourlyForecast = () => {
    const next10Hours = forecastData.list.slice(0, 10);
    const firstRow = next10Hours.slice(0, 5);
    const secondRow = next10Hours.slice(5, 10);

    return (
      <div className="weather-info">
        <h2>Hourly Forecast for Brno</h2>
        <div className="hourly-grid">
          <div className="hourly-row">
            {firstRow.map((hour) => (
              <div key={hour.dt} className="hourly-item">
                <p className="time">{formatTime(hour.dt)}</p>
                <div className="icon-container">
                  {getWeatherIcon(hour.weather[0].id, isNighttime(hour.dt))}
                </div>
                <p className="temp">{Math.round(hour.main.temp)}°C</p>
                <p className="wind">
                  <FontAwesomeIcon icon={faWind} size="sm" /> {Math.round(hour.wind.speed)} m/s
                </p>
              </div>
            ))}
          </div>
          <div className="hourly-row">
            {secondRow.map((hour) => (
              <div key={hour.dt} className="hourly-item">
                <p className="time">{formatTime(hour.dt)}</p>
                <div className="icon-container">
                  {getWeatherIcon(hour.weather[0].id, isNighttime(hour.dt))}
                </div>
                <p className="temp">{Math.round(hour.main.temp)}°C</p>
                <p className="wind">
                  <FontAwesomeIcon icon={faWind} size="sm" /> {Math.round(hour.wind.speed)} m/s
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderDailyForecast = () => {
    
    const dailyData = forecastData.list.reduce((acc, item) => {
      const date = new Date(item.dt * 1000).toDateString();
      if (!acc[date]) {
        acc[date] = {
          dt: item.dt,
          temps: [],
          weatherId: item.weather[0].id,
          description: item.weather[0].description
        };
      }
      acc[date].temps.push(item.main.temp);
      return acc;
    }, {});

    const dailyForecasts = Object.values(dailyData).slice(0, 5); // 5 days forecast

    return (
      <div className="weather-info">
        <h2>5-Day Forecast for Brno</h2>
        <div className="daily-list">
          {dailyForecasts.map((day) => (
            <div key={day.dt} className="daily-item">
              <p className="date">{formatDate(day.dt)}</p>
              <div className="icon-container">
                {getWeatherIcon(day.weatherId)}
              </div>
              <div className="temp-range">
                <p className="max-temp">{Math.round(Math.max(...day.temps))}°C</p>
                <p className="min-temp">{Math.round(Math.min(...day.temps))}°C</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="container">
      <div className="weather-card">
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'current' ? 'active' : ''}`}
            onClick={() => setActiveTab('current')}
          >
            Current
          </button>
          <button
            className={`tab ${activeTab === 'hourly' ? 'active' : ''}`}
            onClick={() => setActiveTab('hourly')}
          >
            Hourly
          </button>
          <button
            className={`tab ${activeTab === 'daily' ? 'active' : ''}`}
            onClick={() => setActiveTab('daily')}
          >
            Daily
          </button>
        </div>
        {activeTab === 'current' && renderCurrentWeather()}
        {activeTab === 'hourly' && renderHourlyForecast()}
        {activeTab === 'daily' && renderDailyForecast()}
      </div>
    </div>
  );
}

export default App;