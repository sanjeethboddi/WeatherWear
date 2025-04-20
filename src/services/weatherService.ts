import axios from 'axios';
import { WeatherData, ForecastDay, HourForecast } from '../types/weather';

const BASE_URL = 'https://api.open-meteo.com/v1';
const GEO_URL = 'https://geocoding-api.open-meteo.com/v1';

const getLocationCoordinates = async (location: string) => {
  try {
    const response = await axios.get(`${GEO_URL}/search`, {
      params: {
        name: location,
        count: 1,
        language: 'en',
        format: 'json'
      }
    });

    if (!response.data.results?.[0]) {
      throw new Error('Location not found');
    }

    return response.data.results[0];
  } catch (error) {
    console.error('Error fetching location data:', error);
    throw new Error('Failed to find location');
  }
};

const getWeatherCode = (code: number): { text: string; icon: string } => {
  // WMO Weather interpretation codes (WW)
  const weatherCodes: Record<number, { text: string; icon: string }> = {
    0: { text: 'Clear sky', icon: '//cdn.weatherapi.com/weather/64x64/day/113.png' },
    1: { text: 'Mainly clear', icon: '//cdn.weatherapi.com/weather/64x64/day/116.png' },
    2: { text: 'Partly cloudy', icon: '//cdn.weatherapi.com/weather/64x64/day/116.png' },
    3: { text: 'Overcast', icon: '//cdn.weatherapi.com/weather/64x64/day/122.png' },
    45: { text: 'Foggy', icon: '//cdn.weatherapi.com/weather/64x64/day/248.png' },
    48: { text: 'Depositing rime fog', icon: '//cdn.weatherapi.com/weather/64x64/day/248.png' },
    51: { text: 'Light drizzle', icon: '//cdn.weatherapi.com/weather/64x64/day/266.png' },
    53: { text: 'Moderate drizzle', icon: '//cdn.weatherapi.com/weather/64x64/day/266.png' },
    55: { text: 'Dense drizzle', icon: '//cdn.weatherapi.com/weather/64x64/day/266.png' },
    61: { text: 'Slight rain', icon: '//cdn.weatherapi.com/weather/64x64/day/176.png' },
    63: { text: 'Moderate rain', icon: '//cdn.weatherapi.com/weather/64x64/day/176.png' },
    65: { text: 'Heavy rain', icon: '//cdn.weatherapi.com/weather/64x64/day/308.png' },
    71: { text: 'Slight snow fall', icon: '//cdn.weatherapi.com/weather/64x64/day/326.png' },
    73: { text: 'Moderate snow fall', icon: '//cdn.weatherapi.com/weather/64x64/day/332.png' },
    75: { text: 'Heavy snow fall', icon: '//cdn.weatherapi.com/weather/64x64/day/338.png' },
    77: { text: 'Snow grains', icon: '//cdn.weatherapi.com/weather/64x64/day/326.png' },
    80: { text: 'Slight rain showers', icon: '//cdn.weatherapi.com/weather/64x64/day/176.png' },
    81: { text: 'Moderate rain showers', icon: '//cdn.weatherapi.com/weather/64x64/day/176.png' },
    82: { text: 'Violent rain showers', icon: '//cdn.weatherapi.com/weather/64x64/day/308.png' },
    85: { text: 'Slight snow showers', icon: '//cdn.weatherapi.com/weather/64x64/day/326.png' },
    86: { text: 'Heavy snow showers', icon: '//cdn.weatherapi.com/weather/64x64/day/338.png' },
    95: { text: 'Thunderstorm', icon: '//cdn.weatherapi.com/weather/64x64/day/200.png' },
    96: { text: 'Thunderstorm with slight hail', icon: '//cdn.weatherapi.com/weather/64x64/day/392.png' },
    99: { text: 'Thunderstorm with heavy hail', icon: '//cdn.weatherapi.com/weather/64x64/day/395.png' },
  };

  return weatherCodes[code] || { text: 'Unknown', icon: '//cdn.weatherapi.com/weather/64x64/day/113.png' };
};

export const fetchWeatherData = async (location: string): Promise<WeatherData> => {
  try {
    const locationData = await getLocationCoordinates(location);
    
    const response = await axios.get(`${BASE_URL}/forecast`, {
      params: {
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        hourly: 'temperature_2m,relativehumidity_2m,apparent_temperature,precipitation_probability,weathercode,windspeed_10m',
        daily: 'weathercode,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,uv_index_max,precipitation_probability_max',
        current_weather: true,
        timezone: 'auto',
        forecast_days: 10
      }
    });

    const data = response.data;
    const current = data.current_weather;
    const currentWeatherCode = getWeatherCode(current.weathercode);
    const now = new Date();
    const currentHourIndex = now.getHours();

    // Transform the data to match our WeatherData interface
    const transformedData: WeatherData = {
      location: {
        name: locationData.name,
        region: locationData.admin1 || '',
        country: locationData.country,
        lat: locationData.latitude,
        lon: locationData.longitude,
        tz_id: data.timezone,
        localtime_epoch: Math.floor(now.getTime() / 1000),
        localtime: now.toISOString(),
      },
      current: {
        last_updated_epoch: Math.floor(now.getTime() / 1000),
        last_updated: now.toISOString(),
        temp_c: current.temperature,
        temp_f: (current.temperature * 9/5) + 32,
        is_day: current.is_day,
        condition: currentWeatherCode,
        wind_mph: current.windspeed * 0.621371,
        wind_kph: current.windspeed,
        wind_degree: current.winddirection,
        wind_dir: '', // Not provided by Open Meteo
        pressure_mb: 0, // Not provided in current weather
        pressure_in: 0,
        precip_mm: 0,
        precip_in: 0,
        humidity: data.hourly.relativehumidity_2m[currentHourIndex],
        cloud: 0, // Not provided
        feelslike_c: data.hourly.apparent_temperature[currentHourIndex],
        feelslike_f: (data.hourly.apparent_temperature[currentHourIndex] * 9/5) + 32,
        vis_km: 0, // Not provided
        vis_miles: 0,
        uv: data.daily.uv_index_max[0],
        gust_mph: 0,
        gust_kph: 0
      },
      forecast: {
        forecastday: data.daily.time.map((date: string, index: number): ForecastDay => {
          const startHour = index === 0 ? currentHourIndex : 0;
          const endHour = index === 0 ? 24 : 24;
          
          const hourlyData: HourForecast[] = Array.from({ length: endHour - startHour }, (_, i) => {
            const hourIndex = startHour + i + (index * 24);
            return {
              time_epoch: new Date(data.hourly.time[hourIndex]).getTime() / 1000,
              time: data.hourly.time[hourIndex],
              temp_c: data.hourly.temperature_2m[hourIndex],
              temp_f: (data.hourly.temperature_2m[hourIndex] * 9/5) + 32,
              is_day: 1, // Simplified
              condition: getWeatherCode(data.hourly.weathercode[hourIndex]),
              wind_mph: data.hourly.windspeed_10m[hourIndex] * 0.621371,
              wind_kph: data.hourly.windspeed_10m[hourIndex],
              wind_degree: 0,
              wind_dir: '',
              pressure_mb: 0,
              pressure_in: 0,
              precip_mm: 0,
              precip_in: 0,
              humidity: data.hourly.relativehumidity_2m[hourIndex],
              cloud: 0,
              feelslike_c: data.hourly.apparent_temperature[hourIndex],
              feelslike_f: (data.hourly.apparent_temperature[hourIndex] * 9/5) + 32,
              windchill_c: 0,
              windchill_f: 0,
              heatindex_c: 0,
              heatindex_f: 0,
              dewpoint_c: 0,
              dewpoint_f: 0,
              will_it_rain: 0,
              chance_of_rain: data.hourly.precipitation_probability[hourIndex],
              will_it_snow: 0,
              chance_of_snow: 0,
              vis_km: 0,
              vis_miles: 0,
              gust_mph: 0,
              gust_kph: 0,
              uv: data.daily.uv_index_max[index]
            };
          });

          return {
            date: date,
            date_epoch: new Date(date).getTime() / 1000,
            day: {
              maxtemp_c: data.daily.temperature_2m_max[index],
              maxtemp_f: (data.daily.temperature_2m_max[index] * 9/5) + 32,
              mintemp_c: data.daily.temperature_2m_min[index],
              mintemp_f: (data.daily.temperature_2m_min[index] * 9/5) + 32,
              avgtemp_c: (data.daily.temperature_2m_max[index] + data.daily.temperature_2m_min[index]) / 2,
              avgtemp_f: ((data.daily.temperature_2m_max[index] + data.daily.temperature_2m_min[index]) / 2 * 9/5) + 32,
              maxwind_mph: Math.max(...data.hourly.windspeed_10m.slice(index * 24, (index + 1) * 24)) * 0.621371,
              maxwind_kph: Math.max(...data.hourly.windspeed_10m.slice(index * 24, (index + 1) * 24)),
              totalprecip_mm: 0,
              totalprecip_in: 0,
              totalsnow_cm: 0,
              avgvis_km: 0,
              avgvis_miles: 0,
              avghumidity: Math.round(
                data.hourly.relativehumidity_2m
                  .slice(index * 24, (index + 1) * 24)
                  .reduce((sum: number, val: number) => sum + val, 0) / 24
              ),
              daily_will_it_rain: data.daily.precipitation_probability_max[index] > 50 ? 1 : 0,
              daily_chance_of_rain: data.daily.precipitation_probability_max[index],
              daily_will_it_snow: 0,
              daily_chance_of_snow: 0,
              condition: getWeatherCode(data.daily.weathercode[index]),
              uv: data.daily.uv_index_max[index]
            },
            astro: {
              sunrise: '',
              sunset: '',
              moonrise: '',
              moonset: '',
              moon_phase: '',
              moon_illumination: '',
              is_moon_up: 0,
              is_sun_up: 1
            },
            hour: hourlyData
          };
        })
      }
    };

    return transformedData;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw new Error('Failed to fetch weather data');
  }
};