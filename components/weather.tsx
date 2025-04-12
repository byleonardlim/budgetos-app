type WeatherProps = {
    temperature: number;
    weather: string;
    location: string;
  };
  
  export const Weather = ({ temperature, weather, location }: WeatherProps) => {
    return (
      <div className="w-fit p-8 bg-stone-100">
        <h2 className="mb-8 font-bold text-lg capitalize">Current Weather for {location}</h2>
        <p className="text-sm">Condition: {weather}</p>
        <p className="text-sm">Temperature: {temperature}°C</p>
      </div>
    );
  };