import { WeatherData, RecommendationData } from '../types/weather';

// Function to get clothing recommendations based on temperature and weather conditions
export const getRecommendations = (weather: WeatherData): RecommendationData => {
  const temp = weather.current.temp_c;
  const condition = weather.current.condition.text.toLowerCase();
  const isRaining = condition.includes('rain') || condition.includes('drizzle');
  const isSnowing = condition.includes('snow');
  const isSunny = condition.includes('sun') || condition.includes('clear');
  const isWindy = weather.current.wind_kph > 20;
  const humidity = weather.current.humidity;
  const uv = weather.current.uv;

  // Initialize recommendation objects
  const attireFormal = [];
  const attireInformal = [];
  const items = [];
  const skincare = [];

  // Temperature-based clothing recommendations
  if (temp < 0) {
    // Very cold weather
    attireFormal.push('Heavy wool coat', 'Wool suit', 'Thermal underlayers', 'Wool scarf', 'Leather gloves', 'Wool socks', 'Formal boots');
    attireInformal.push('Heavy winter jacket', 'Thermal underlayers', 'Sweater', 'Fleece-lined pants', 'Wool hat', 'Thermal gloves', 'Winter boots');
    
    items.push('Insulated thermos', 'Hand warmers');
    skincare.push('Rich moisturizer', 'Lip balm', 'Hand cream');
  } else if (temp >= 0 && temp < 10) {
    // Cold weather
    attireFormal.push('Wool overcoat', 'Wool or tweed suit', 'Scarf', 'Leather gloves', 'Dress boots');
    attireInformal.push('Winter jacket', 'Sweater', 'Jeans or thick pants', 'Beanie', 'Gloves', 'Boots');
    
    items.push('Gloves', 'Scarf');
    skincare.push('Moisturizer', 'Lip balm');
  } else if (temp >= 10 && temp < 20) {
    // Cool weather
    attireFormal.push('Light overcoat or trench coat', 'Wool or cotton suit', 'Light scarf (optional)');
    attireInformal.push('Light jacket or blazer', 'Long-sleeve shirt', 'Jeans or chinos', 'Light sweater');
    
    items.push('Light scarf (morning/evening)');
    skincare.push('Moisturizer', 'Lip balm');
  } else if (temp >= 20 && temp < 25) {
    // Mild weather
    attireFormal.push('Light suit', 'Dress shirt', 'Tie (optional)', 'Dress shoes');
    attireInformal.push('T-shirt or light shirt', 'Light pants or jeans', 'Sneakers or casual shoes');
    
    items.push('Light jacket (evening)');
    skincare.push('Light moisturizer', 'Lip balm');
  } else if (temp >= 25 && temp < 30) {
    // Warm weather
    attireFormal.push('Lightweight suit', 'Light-colored dress shirt', 'Loafers');
    attireInformal.push('T-shirt', 'Shorts or light pants', 'Sandals or light shoes');
    
    items.push('Water bottle');
    skincare.push('Light moisturizer', 'Lip balm with SPF');
  } else {
    // Hot weather
    attireFormal.push('Lightweight cotton or linen suit', 'Short-sleeve dress shirt or lightweight long sleeve', 'Loafers without socks');
    attireInformal.push('Light t-shirt', 'Shorts', 'Sandals or breathable shoes');
    
    items.push('Water bottle', 'Portable fan');
    skincare.push('Oil-free moisturizer', 'Lip balm with SPF');
  }

  // Weather condition specific recommendations
  if (isRaining) {
    attireFormal.push('Waterproof overcoat', 'Waterproof dress shoes');
    attireInformal.push('Waterproof jacket', 'Waterproof shoes');
    
    items.push('Umbrella', 'Waterproof bag');
    skincare.push('Water-resistant sunscreen');
  }

  if (isSnowing) {
    attireFormal.push('Snow boots (to change at destination)', 'Wool socks');
    attireInformal.push('Snow boots', 'Waterproof pants');
    
    items.push('Ice scraper (if driving)');
  }

  if (isSunny) {
    attireFormal.push('Sunglasses');
    attireInformal.push('Sunglasses', 'Hat or cap');
    
    items.push('Sunglasses');
    skincare.push('Sunscreen (SPF 30+)');
  }

  if (isWindy) {
    attireFormal.push('Wind-resistant coat');
    attireInformal.push('Windbreaker');
    
    items.push('Secure hat');
  }

  // UV-based skincare recommendations
  if (uv >= 3 && uv < 6) {
    skincare.push('Sunscreen SPF 30+');
  } else if (uv >= 6 && uv < 8) {
    skincare.push('Sunscreen SPF 50+', 'Reapply every 2 hours');
  } else if (uv >= 8) {
    skincare.push('Sunscreen SPF 50+ (broad spectrum)', 'Reapply every 2 hours', 'Avoid prolonged sun exposure');
  }

  // Humidity-based recommendations
  if (humidity > 80) {
    skincare.push('Oil-free moisturizer', 'Oil-absorbing sheets');
  } else if (humidity < 30) {
    skincare.push('Hydrating moisturizer');
  }

  return {
    attire: {
      formal: attireFormal,
      informal: attireInformal
    },
    items,
    skincare
  };
};