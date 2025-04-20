import axios from 'axios';
import { WeatherData, ForecastDay, HourForecast, Location } from '../types/weather';
import { set } from 'date-fns';
import { be } from 'date-fns/locale';
import { time } from 'framer-motion';


const BASE_URL = 'https://api.open-meteo.com/v1';
const GEO_URL = 'https://geocoding-api.open-meteo.com/v1';


export const setCoordinatesForLocation = async (location: Location, setLocation): Promise<void> => {
  try {
    const city = location.name;
    const stateOrCountry = location.admin1 || location.country;
    
    console.log('Searching for location:', { city, stateOrCountry });
    
    const response = await axios.get(`${GEO_URL}/search`, {
      params: {
        name: city,
        count: 20,
        language: 'en',
        format: 'json'
      }
    });

    if (!response.data.results?.[0]) {
      throw new Error('Location not found');
    }

    // Filter results based on state or country
    let results = response.data.results;
    console.log('results', results);
    
    if (stateOrCountry) {
      // First try to match by state (admin1)
      results = results.filter((result: any) => {
        const stateMatch = result.admin1?.toLowerCase() === stateOrCountry.toLowerCase();
        const stateCodeMatch = result.admin1_code?.toLowerCase() === stateOrCountry.toLowerCase();
        return stateMatch || stateCodeMatch;
      });

      // If no state matches, try country
      if (results.length === 0) {
        results = response.data.results.filter((result: any) => {
          const countryMatch = result.country?.toLowerCase() === stateOrCountry.toLowerCase();
          const countryCodeMatch = result.country_code?.toLowerCase() === stateOrCountry.toLowerCase();
          return countryMatch || countryCodeMatch;
        });
      }
    }

    // If still no matches, use the first result
    if (results.length === 0) {
      results = [response.data.results[0]];
    }

    // Return the best match with formatted name
    const bestMatch = results[0];
    const formattedName = bestMatch.admin1 
      ? `${bestMatch.name}, ${bestMatch.admin1}`
      : `${bestMatch.name}, ${bestMatch.country}`;

    console.log('Found  location:', {
      name: bestMatch.name,
      state: bestMatch.admin1,
      country: bestMatch.country,
      formattedName
    });

    console.log("best match", bestMatch);

    setLocation({
      id: 0, 
      name: bestMatch.name,
      latitude: bestMatch.latitude,
      longitude: bestMatch.longitude,
      country: bestMatch.country,
      admin1: bestMatch.admin1,
      timezone: bestMatch.timezone
    });
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

const getWindDirection = (degrees: number): string => {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
};

export const fetchWeatherData = async (location: Location): Promise<WeatherData> => {
  try {
    const response = await axios.get(`${BASE_URL}/forecast`, {
      params: {
        latitude: location.latitude,
        longitude: location.longitude,
        current: [
          'temperature_2m',
          'relative_humidity_2m',
          'apparent_temperature',
          'is_day',
          'precipitation',
          'rain',
          'showers',
          'snowfall',
          'weather_code',
          'cloud_cover',
          'pressure_msl',
          'surface_pressure',
          'wind_speed_10m',
          'wind_direction_10m',
          'wind_gusts_10m',
          'uv_index',
          'uv_index_clear_sky'
        ].join(','),
        hourly: [
          'temperature_2m',
          'relative_humidity_2m',
          'dew_point_2m',
          'apparent_temperature',
          'precipitation_probability',
          'precipitation',
          'rain',
          'showers',
          'snowfall',
          'snow_depth',
          'weather_code',
          'pressure_msl',
          'surface_pressure',
          'cloud_cover',
          'cloud_cover_low',
          'cloud_cover_mid',
          'cloud_cover_high',
          'visibility',
          'wind_speed_10m',
          'wind_speed_80m',
          'wind_speed_120m',
          'wind_speed_180m',
          'wind_direction_10m',
          'wind_direction_80m',
          'wind_direction_120m',
          'wind_direction_180m',
          'wind_gusts_10m',
          'temperature_80m',
          'temperature_120m',
          'temperature_180m',
          'uv_index',
          'uv_index_clear_sky'
        ].join(','),
        daily: [
          'weather_code',
          'temperature_2m_max',
          'temperature_2m_min',
          'apparent_temperature_max',
          'apparent_temperature_min',
          'sunrise',
          'sunset',
          'daylight_duration',
          'sunshine_duration',
          'precipitation_sum',
          'rain_sum',
          'showers_sum',
          'snowfall_sum',
          'precipitation_hours',
          'precipitation_probability_max',
          'wind_speed_10m_max',
          'wind_gusts_10m_max',
          'wind_direction_10m_dominant',
          'shortwave_radiation_sum',
          'et0_fao_evapotranspiration',
          'uv_index_max',
          'uv_index_clear_sky_max'
        ].join(','),
        timezone: 'auto',
        forecast_days: 10
      }
    });

    if (!response.data) {
      throw new Error('No weather data received');
    }

    const { current, daily, hourly } = response.data;

    if (!current || !daily || !hourly) {
      throw new Error('Incomplete weather data received');
    }

    // Validate arrays before mapping
    if (!Array.isArray(daily.time) || !Array.isArray(daily.temperature_2m_max) || 
        !Array.isArray(daily.temperature_2m_min) || !Array.isArray(daily.weather_code) ||
        !Array.isArray(daily.sunrise) || !Array.isArray(daily.sunset)) {
      throw new Error('Invalid daily forecast data structure');
    }

    // More lenient validation for hourly data
    if (!Array.isArray(hourly.time)) {
      throw new Error('Invalid hourly time data');
    }

    // Ensure required arrays exist, but don't require all of them
    const requiredHourlyArrays = ['temperature_2m', 'weather_code', 'is_day'];
    for (const key of requiredHourlyArrays) {
      if (!Array.isArray(hourly[key])) {
        console.warn(`Missing hourly data for ${key}, using default values`);
        hourly[key] = Array(hourly.time.length).fill(0);
      }
    }

    // Transform the response to match WeatherData type
    const transformedData: WeatherData = {
      location: {
        name: location.name,
        region: location.admin1 || '',
        country: location.country,
        lat: location.latitude,
        lon: location.longitude,
        tz_id: response.data.timezone,
        localtime_epoch: Math.floor(Date.now() / 1000),
        localtime: new Date().toISOString()
      },
      current: {
        last_updated_epoch: Math.floor(Date.now() / 1000),
        last_updated: new Date().toISOString(),
        temp_c: current.temperature_2m,
        temp_f: (current.temperature_2m * 9/5) + 32,
        is_day: current.is_day,
        condition: {
          text: getWeatherCode(current.weather_code).text,
          icon: getWeatherCode(current.weather_code).icon,
          code: current.weather_code
        },
        wind_mph: current.wind_speed_10m * 2.237,
        wind_kph: current.wind_speed_10m * 3.6,
        wind_degree: current.wind_direction_10m,
        wind_dir: getWindDirection(current.wind_direction_10m),
        pressure_mb: current.pressure_msl,
        pressure_in: current.pressure_msl * 0.02953,
        precip_mm: current.precipitation,
        precip_in: current.precipitation * 0.03937,
        humidity: current.relative_humidity_2m,
        cloud: current.cloud_cover,
        feelslike_c: current.apparent_temperature,
        feelslike_f: (current.apparent_temperature * 9/5) + 32,
        vis_km: 10,
        vis_miles: 6.2,
        uv: current.uv_index,
        gust_mph: current.wind_gusts_10m * 2.237,
        gust_kph: current.wind_gusts_10m * 3.6
      },
      forecast: {
        forecastday: daily.time.map((date: string, index: number) => {
          // Validate index bounds
          if (index >= daily.temperature_2m_max.length || 
              index >= daily.temperature_2m_min.length || 
              index >= daily.weather_code.length ||
              index >= daily.sunrise.length || 
              index >= daily.sunset.length) {
            throw new Error('Index out of bounds in daily forecast data');
          }

          return {
            date: date,
            date_epoch: Math.floor(new Date(date).getTime() / 1000),
            day: {
              maxtemp_c: daily.temperature_2m_max[index],
              maxtemp_f: (daily.temperature_2m_max[index] * 9/5) + 32,
              mintemp_c: daily.temperature_2m_min[index],
              mintemp_f: (daily.temperature_2m_min[index] * 9/5) + 32,
              avgtemp_c: (daily.temperature_2m_max[index] + daily.temperature_2m_min[index]) / 2,
              avgtemp_f: ((daily.temperature_2m_max[index] + daily.temperature_2m_min[index]) / 2 * 9/5) + 32,
              maxwind_mph: daily.wind_speed_10m_max?.[index] * 2.237 || 0,
              maxwind_kph: daily.wind_speed_10m_max?.[index] * 3.6 || 0,
              totalprecip_mm: daily.precipitation_sum?.[index] || 0,
              totalprecip_in: (daily.precipitation_sum?.[index] || 0) * 0.03937,
              totalsnow_cm: (daily.snowfall_sum?.[index] || 0) / 10,
              avgvis_km: 10,
              avgvis_miles: 6.2,
              avghumidity: 50,
              daily_will_it_rain: (daily.precipitation_sum?.[index] || 0) > 0 ? 1 : 0,
              daily_chance_of_rain: daily.precipitation_probability_max?.[index] || 0,
              daily_will_it_snow: (daily.snowfall_sum?.[index] || 0) > 0 ? 1 : 0,
              daily_chance_of_snow: (daily.snowfall_sum?.[index] || 0) > 0 ? (daily.precipitation_probability_max?.[index] || 0) : 0,
              condition: {
                text: getWeatherCode(daily.weather_code[index]).text,
                icon: getWeatherCode(daily.weather_code[index]).icon,
                code: daily.weather_code[index]
              },
              uv: daily.uv_index_max?.[index] || 0
            },
            astro: {
              sunrise: daily.sunrise[index],
              sunset: daily.sunset[index],
              moonrise: "00:00 AM",
              moonset: "00:00 AM",
              moon_phase: "New Moon",
              moon_illumination: "0"
            },
            hour: hourly.time
              .filter((time: string) => time.startsWith(date))
              .map((time: string, hourIndex: number) => {
                // More lenient validation for hourly data
                if (hourIndex >= hourly.temperature_2m.length || 
                    hourIndex >= hourly.weather_code.length || 
                    hourIndex >= hourly.is_day.length) {
                  console.warn(`Index ${hourIndex} out of bounds in hourly forecast data, using default values`);
                  return {
                    time_epoch: Math.floor(new Date(time).getTime() / 1000),
                    time: time,
                    temp_c: 0,
                    temp_f: 32,
                    is_day: 1,
                    condition: {
                      text: 'Unknown',
                      icon: '//cdn.weatherapi.com/weather/64x64/day/113.png',
                      code: 0
                    },
                    wind_mph: 0,
                    wind_kph: 0,
                    wind_degree: 0,
                    wind_dir: 'N',
                    pressure_mb: 0,
                    pressure_in: 0,
                    precip_mm: 0,
                    precip_in: 0,
                    humidity: 0,
                    cloud: 0,
                    feelslike_c: 0,
                    feelslike_f: 32,
                    windchill_c: 0,
                    windchill_f: 32,
                    heatindex_c: 0,
                    heatindex_f: 32,
                    dewpoint_c: 0,
                    dewpoint_f: 32,
                    will_it_rain: 0,
                    chance_of_rain: 0,
                    will_it_snow: 0,
                    chance_of_snow: 0,
                    vis_km: 10,
                    vis_miles: 6.2,
                    gust_mph: 0,
                    gust_kph: 0,
                    uv: 0
                  };
                }

                return {
                  time_epoch: Math.floor(new Date(time).getTime() / 1000),
                  time: time,
                  temp_c: hourly.temperature_2m[hourIndex],
                  temp_f: (hourly.temperature_2m[hourIndex] * 9/5) + 32,
                  is_day: hourly.is_day[hourIndex],
                  condition: {
                    text: getWeatherCode(hourly.weather_code[hourIndex]).text,
                    icon: getWeatherCode(hourly.weather_code[hourIndex]).icon,
                    code: hourly.weather_code[hourIndex]
                  },
                  wind_mph: hourly.wind_speed_10m?.[hourIndex] * 2.237 || 0,
                  wind_kph: hourly.wind_speed_10m?.[hourIndex] * 3.6 || 0,
                  wind_degree: hourly.wind_direction_10m?.[hourIndex] || 0,
                  wind_dir: getWindDirection(hourly.wind_direction_10m?.[hourIndex] || 0),
                  pressure_mb: hourly.pressure_msl?.[hourIndex] || 0,
                  pressure_in: (hourly.pressure_msl?.[hourIndex] || 0) * 0.02953,
                  precip_mm: hourly.precipitation?.[hourIndex] || 0,
                  precip_in: (hourly.precipitation?.[hourIndex] || 0) * 0.03937,
                  humidity: hourly.relative_humidity_2m?.[hourIndex] || 0,
                  cloud: hourly.cloud_cover?.[hourIndex] || 0,
                  feelslike_c: hourly.apparent_temperature?.[hourIndex] || 0,
                  feelslike_f: ((hourly.apparent_temperature?.[hourIndex] || 0) * 9/5) + 32,
                  windchill_c: hourly.apparent_temperature?.[hourIndex] || 0,
                  windchill_f: ((hourly.apparent_temperature?.[hourIndex] || 0) * 9/5) + 32,
                  heatindex_c: hourly.apparent_temperature?.[hourIndex] || 0,
                  heatindex_f: ((hourly.apparent_temperature?.[hourIndex] || 0) * 9/5) + 32,
                  dewpoint_c: hourly.dew_point_2m?.[hourIndex] || 0,
                  dewpoint_f: ((hourly.dew_point_2m?.[hourIndex] || 0) * 9/5) + 32,
                  will_it_rain: (hourly.precipitation?.[hourIndex] || 0) > 0 ? 1 : 0,
                  chance_of_rain: hourly.precipitation_probability?.[hourIndex] || 0,
                  will_it_snow: (hourly.snowfall?.[hourIndex] || 0) > 0 ? 1 : 0,
                  chance_of_snow: (hourly.snowfall?.[hourIndex] || 0) > 0 ? (hourly.precipitation_probability?.[hourIndex] || 0) : 0,
                  vis_km: hourly.visibility?.[hourIndex] || 10,
                  vis_miles: (hourly.visibility?.[hourIndex] || 10) * 0.621371,
                  gust_mph: hourly.wind_gusts_10m?.[hourIndex] * 2.237 || 0,
                  gust_kph: hourly.wind_gusts_10m?.[hourIndex] * 3.6 || 0,
                  uv: hourly.uv_index?.[hourIndex] || 0
                };
              })
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