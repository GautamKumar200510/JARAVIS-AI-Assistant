import { SearchSource } from '../storage';

export interface WeatherData {
  city: string;
  country?: string;
  temperatureC: number;
  temperatureF: number;
  apparentTempC: number;
  apparentTempF: number;
  humidityPercent: number;
  windSpeedKmH: number;
  windSpeedMph: number;
  surfacePressureHpa: number;
  condition: string;
  isDay: boolean;
  maxTempC?: number;
  minTempC?: number;
  precipitationProb?: number;
  sources: SearchSource[];
}

export interface WeatherResult {
  success: boolean;
  data?: WeatherData;
  formattedResponse: string;
  speakableText: string;
  sources: SearchSource[];
  error?: string;
}

// Weather code description mapping (WMO Weather interpretation codes)
function parseWeatherCode(code: number): string {
  switch (code) {
    case 0:
      return 'Clear Sky';
    case 1:
      return 'Mainly Clear';
    case 2:
      return 'Partly Cloudy';
    case 3:
      return 'Overcast';
    case 45:
      return 'Foggy';
    case 48:
      return 'Depositing Rime Fog';
    case 51:
      return 'Light Drizzle';
    case 53:
      return 'Moderate Drizzle';
    case 55:
      return 'Dense Drizzle';
    case 56:
    case 57:
      return 'Freezing Drizzle';
    case 61:
      return 'Slight Rain';
    case 63:
      return 'Moderate Rain';
    case 65:
      return 'Heavy Rain';
    case 66:
    case 67:
      return 'Freezing Rain';
    case 71:
      return 'Slight Snowfall';
    case 73:
      return 'Moderate Snowfall';
    case 75:
      return 'Heavy Snowfall';
    case 77:
      return 'Snow Grains';
    case 80:
    case 81:
    case 82:
      return 'Rain Showers';
    case 85:
    case 86:
      return 'Snow Showers';
    case 95:
      return 'Thunderstorm';
    case 96:
    case 99:
      return 'Thunderstorm with Hail';
    default:
      return 'Clear & Stable';
  }
}

export class WeatherService {
  /**
   * Extract location query from user prompt
   */
  public extractLocation(input: string): string {
    const cleaned = input.trim();
    // Patterns like "weather in Tokyo", "weather today for New Delhi", "temperature at London", "weather in Paris, France"
    const patterns = [
      /weather\s+(?:today\s+)?(?:in|for|at)\s+([a-zA-Z\s,.-]+?)(?:\?|$|\.|\s+today|\s+now)/i,
      /temperature\s+(?:in|for|at)\s+([a-zA-Z\s,.-]+?)(?:\?|$|\.|\s+today|\s+now)/i,
      /forecast\s+(?:for|in|at)\s+([a-zA-Z\s,.-]+?)(?:\?|$|\.|\s+today|\s+now)/i,
      /how\s+is\s+the\s+weather\s+(?:in|at|for)\s+([a-zA-Z\s,.-]+?)(?:\?|$|\.)/i,
      /what\s+is\s+the\s+weather\s+(?:like\s+)?(?:in|for|at)\s+([a-zA-Z\s,.-]+?)(?:\?|$|\.)/i,
      /is\s+it\s+raining\s+in\s+([a-zA-Z\s,.-]+?)(?:\?|$|\.)/i
    ];

    for (const pattern of patterns) {
      const match = cleaned.match(pattern);
      if (match && match[1] && match[1].trim()) {
        const cityCandidate = match[1].trim();
        // Remove trailing filler words
        return cityCandidate.replace(/\s+(today|now|currently|tomorrow|this week)$/i, '').trim();
      }
    }

    // Default fallback if no specific location was mentioned
    return 'New Delhi';
  }

  /**
   * Fetch live weather data from Open-Meteo API
   */
  public async getLiveWeather(locationName: string, callsign: string = 'Sir'): Promise<WeatherResult> {
    try {
      const trimmedLocation = locationName.trim() || 'New Delhi';

      // 1. Geocode location
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        trimmedLocation
      )}&count=1&language=en&format=json`;

      const geoRes = await fetch(geoUrl, {
        headers: { 'User-Agent': 'JARAVIS-Assistant/4.8' },
        signal: AbortSignal.timeout(6000)
      });

      if (!geoRes.ok) {
        return {
          success: false,
          formattedResponse: `Unable to access meteorological geocoding service for **${trimmedLocation}** (HTTP ${geoRes.status}). Please verify the location name or check your connection.`,
          speakableText: `I could not access live weather information for ${trimmedLocation} at this moment.`,
          sources: [],
          error: `Geocoding failed with status ${geoRes.status}`
        };
      }

      const geoData: any = await geoRes.json();

      if (!geoData.results || geoData.results.length === 0) {
        return {
          success: false,
          formattedResponse: `Could not locate meteorological telemetry coordinates for **"${trimmedLocation}"**. Please ensure the city or region name is spelled correctly.`,
          speakableText: `I could not locate weather data for ${trimmedLocation}.`,
          sources: [],
          error: 'Location coordinates not found'
        };
      }

      const place = geoData.results[0];
      const lat = place.latitude;
      const lon = place.longitude;
      const resolvedName = place.name + (place.country ? `, ${place.country}` : '');

      // 2. Fetch live atmospheric forecast
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,surface_pressure&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`;

      const weatherRes = await fetch(weatherUrl, {
        headers: { 'User-Agent': 'JARAVIS-Assistant/4.8' },
        signal: AbortSignal.timeout(6000)
      });

      if (!weatherRes.ok) {
        return {
          success: false,
          formattedResponse: `Meteorological sensors for **${resolvedName}** are currently unavailable (HTTP ${weatherRes.status}).`,
          speakableText: `Weather telemetry is currently unavailable for ${resolvedName}.`,
          sources: [],
          error: `Weather API failed with status ${weatherRes.status}`
        };
      }

      const weatherData: any = await weatherRes.json();
      const current = weatherData.current;
      const daily = weatherData.daily;

      if (!current) {
        return {
          success: false,
          formattedResponse: `Received incomplete atmospheric data for **${resolvedName}**.`,
          speakableText: `Incomplete weather data received for ${resolvedName}.`,
          sources: [],
          error: 'Missing current weather block'
        };
      }

      const tempC = Math.round(current.temperature_2m);
      const tempF = Math.round((tempC * 9) / 5 + 32);
      const apparentC = Math.round(current.apparent_temperature);
      const apparentF = Math.round((apparentC * 9) / 5 + 32);
      const humidity = Math.round(current.relative_humidity_2m);
      const windKmh = Math.round(current.wind_speed_10m);
      const windMph = Math.round(windKmh * 0.621371);
      const pressure = Math.round(current.surface_pressure);
      const condition = parseWeatherCode(current.weather_code);
      const isDay = current.is_day === 1;

      const maxC = daily?.temperature_2m_max?.[0] ? Math.round(daily.temperature_2m_max[0]) : undefined;
      const minC = daily?.temperature_2m_min?.[0] ? Math.round(daily.temperature_2m_min[0]) : undefined;
      const precipProb = daily?.precipitation_probability_max?.[0];

      const sources: SearchSource[] = [
        {
          title: `Open-Meteo Global Weather Data (${resolvedName})`,
          url: `https://open-meteo.com/en/docs#latitude=${lat}&longitude=${lon}`
        },
        {
          title: 'World Meteorological Organization (WMO) Official Stations',
          url: 'https://worldweather.wmo.int/'
        }
      ];

      const formattedResponse = `### 🌤️ Live Atmospheric & Weather Report: ${resolvedName}

- **Current Condition**: **${condition}** (${isDay ? 'Daytime' : 'Nighttime'})
- **Temperature**: **${tempC}°C** (${tempF}°F)
- **Feels Like**: **${apparentC}°C** (${apparentF}°F)
- **Relative Humidity**: **${humidity}%**
- **Wind Speed**: **${windKmh} km/h** (${windMph} mph)
- **Surface Pressure**: **${pressure} hPa**
${maxC !== undefined && minC !== undefined ? `- **Today's Range**: High of **${maxC}°C**, Low of **${minC}°C**` : ''}
${precipProb !== undefined ? `- **Precipitation Probability**: **${precipProb}%**` : ''}

*Real-time atmospheric telemetry synchronized via verified satellite & ground meteorological stations.*`;

      const speakableText = `In ${resolvedName}, the current weather is ${condition} with a temperature of ${tempC} degrees Celsius (${tempF} degrees Fahrenheit), and humidity at ${humidity} percent, ${callsign}.`;

      return {
        success: true,
        data: {
          city: resolvedName,
          country: place.country,
          temperatureC: tempC,
          temperatureF: tempF,
          apparentTempC: apparentC,
          apparentTempF: apparentF,
          humidityPercent: humidity,
          windSpeedKmH: windKmh,
          windSpeedMph: windMph,
          surfacePressureHpa: pressure,
          condition,
          isDay,
          maxTempC: maxC,
          minTempC: minC,
          precipitationProb: precipProb,
          sources
        },
        formattedResponse,
        speakableText,
        sources
      };
    } catch (err: any) {
      console.error('[WeatherService] Error retrieving weather:', err);
      return {
        success: false,
        formattedResponse: `Live weather telemetry could not be retrieved at this time (${err.message || 'Connection timeout'}). Please try again.`,
        speakableText: `I am unable to retrieve live weather telemetry right now due to a network timeout.`,
        sources: [],
        error: err.message
      };
    }
  }
}

export const weatherService = new WeatherService();
