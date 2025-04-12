// components/weather.tsx
type WeatherProps = {
  temperature: number;
  weather: string;
  location: string;
};

export const Weather = ({ temperature, weather, location }: WeatherProps) => {
  // Map weather conditions to appropriate icons
  const getWeatherIcon = () => {
    const condition = weather.toLowerCase();
    if (condition.includes('sun') || condition.includes('clear')) {
      return '☀️';
    } else if (condition.includes('cloud')) {
      return '☁️';
    } else if (condition.includes('rain')) {
      return '🌧️';
    } else if (condition.includes('snow')) {
      return '❄️';
    } else if (condition.includes('wind')) {
      return '💨';
    } else {
      return '🌤️';
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg min-w-[240px]">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="font-bold text-lg">{location}</h2>
          <p className="text-gray-500 text-sm mt-1">Current Weather</p>
        </div>
        <div className="text-3xl">{getWeatherIcon()}</div>
      </div>
      
      <div className="mt-4">
        <div className="flex justify-between items-end">
          <p className="text-4xl font-bold">{temperature}°</p>
          <p className="text-gray-600 capitalize">{weather}</p>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-xs text-gray-500">Humidity</p>
            <p className="font-medium">65%</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Wind</p>
            <p className="font-medium">8 mph</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Feels Like</p>
            <p className="font-medium">{temperature + 2}°</p>
          </div>
        </div>
      </div>
    </div>
  );
};