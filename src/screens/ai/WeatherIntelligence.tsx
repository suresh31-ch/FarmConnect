/**
 * Weather Intelligence & Hyperlocal Agri Meteorological Advisory
 * Features live weather metrics, 7-day forecast strip, extreme rain alerts,
 * and automated farming action recommendations (irrigation, spraying, harvest timing).
 */

import React, { useState, useEffect } from 'react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Icon } from '../../components/common/Icon';

export interface DailyForecast {
  day: string;
  condition: string;
  tempMax: number;
  tempMin: number;
  rainChance: number;
  icon: string;
}

const mock7DayForecast: DailyForecast[] = [
  { day: 'Today', condition: 'Light Rain', tempMax: 31, tempMin: 24, rainChance: 65, icon: 'partly_cloudy_day' },
  { day: 'Fri', condition: 'Heavy Rain', tempMax: 29, tempMin: 23, rainChance: 85, icon: 'thunderstorm' },
  { day: 'Sat', condition: 'Scattered Showers', tempMax: 30, tempMin: 24, rainChance: 50, icon: 'rainy' },
  { day: 'Sun', condition: 'Sunny / Clear', tempMax: 33, tempMin: 25, rainChance: 10, icon: 'wb_sunny' },
  { day: 'Mon', condition: 'Partly Cloudy', tempMax: 34, tempMin: 25, rainChance: 20, icon: 'partly_cloudy_day' },
  { day: 'Tue', condition: 'Clear Sky', tempMax: 35, tempMin: 26, rainChance: 5, icon: 'wb_sunny' },
  { day: 'Wed', condition: 'Humid & Mild', tempMax: 33, tempMin: 25, rainChance: 15, icon: 'cloud' }
];

export const WeatherIntelligence: React.FC = () => {
  const [selectedLocation, setSelectedLocation] = useState('Tenali, Guntur District');
  const [weatherData, setWeatherData] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchWeatherData = async () => {
      try {
        const res = await fetch(`/api/weather?location=${encodeURIComponent(selectedLocation)}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted) setWeatherData(data);
        }
      } catch (err) {
        console.error('Failed to fetch weather telemetry:', err);
      }
    };
    fetchWeatherData();
    return () => { isMounted = false; };
  }, [selectedLocation]);

  // TODO: Connect OpenWeatherMap API / IMD Weather Advisory REST API
  // Example Code:
  // const fetchWeather = async (lat: number, lon: number) => {
  //   const res = await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=metric&appid=${process.env.OPENWEATHER_KEY}`);
  //   return await res.json();
  // };

  return (
    <div className="space-y-6">
      {/* HEADER BANNER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-950 via-teal-900 to-green-950 text-white shadow-2xl border border-emerald-500/30">
        <div className="space-y-1">
          <Badge variant="emerald" size="md" icon="partly_cloudy_day">
            Hyperlocal Agri Meteorology
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Smart Weather & Farming Advisory
          </h1>
          <p className="text-xs sm:text-sm text-emerald-200/80">
            Satellite radar updates, soil moisture telemetry, and automated spraying/harvest timing warnings.
          </p>
        </div>

        {/* Location Dropdown Selector */}
        <div className="flex items-center gap-2 bg-black/40 p-2 rounded-2xl border border-white/10 shrink-0">
          <Icon name="location_on" size={18} className="text-emerald-400" />
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer"
          >
            <option value="Tenali, Guntur District" className="bg-slate-900 text-white">Tenali, Guntur District</option>
            <option value="Vijayawada, Krishna District" className="bg-slate-900 text-white">Vijayawada, Krishna</option>
            <option value="Kurnool, Rayalaseema" className="bg-slate-900 text-white">Kurnool, AP</option>
            <option value="Warangal, Telangana" className="bg-slate-900 text-white">Warangal, Telangana</option>
          </select>
        </div>
      </div>

      {/* WEATHER ALERT BANNER */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/40 text-amber-200 flex items-start gap-3 backdrop-blur-md">
        <Icon name="warning" size={24} className="text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs sm:text-sm">
          <p className="font-extrabold text-amber-300">
            ⚠️ Coastal Rainfall Warning (Next 24 to 48 Hours)
          </p>
          <p className="text-amber-100/80">
            Heavy rainfall (40-60mm) with gusty winds expected in Guntur & Krishna districts on Friday. Ensure field drainage channels are cleared immediately.
          </p>
        </div>
      </div>

      {/* CURRENT WEATHER METRICS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Temperature Hero Card */}
        <Card variant="glass" className="lg:col-span-5 p-6 sm:p-8 space-y-6 border-emerald-500/30 bg-emerald-950/30 text-white">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-emerald-300">{selectedLocation}</span>
              <h2 className="text-4xl sm:text-5xl font-black mt-1">28°C</h2>
              <p className="text-xs text-slate-300 font-semibold mt-1">Feels like 31°C • Light Rain Showers</p>
            </div>
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-teal-400/20 to-emerald-500/30 border border-emerald-400/40 flex items-center justify-center text-teal-300 shadow-xl">
              <Icon name="partly_cloudy_day" size={48} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-emerald-800/50 text-xs">
            <div className="space-y-1">
              <span className="text-slate-400">Sunrise / Sunset</span>
              <p className="font-bold text-emerald-200 flex items-center gap-1">
                <Icon name="wb_twilight" size={16} /> 6:02 AM / 6:48 PM
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-slate-400">Rainfall Probability</span>
              <p className="font-bold text-teal-300 flex items-center gap-1">
                <Icon name="water_drop" size={16} /> 65% Chance
              </p>
            </div>
          </div>
        </Card>

        {/* Detailed Sensor Telemetry Cards */}
        <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { label: 'Relative Humidity', val: '78%', note: 'High - Fungal risk', icon: 'humidity_percentage', color: 'text-teal-400' },
            { label: 'Wind Velocity', val: '14 km/h', note: 'South-East Breeze', icon: 'air', color: 'text-emerald-400' },
            { label: 'Soil Moisture', val: '68%', note: 'Sufficient water level', icon: 'grass', color: 'text-amber-400' },
            { label: 'UV Index', val: '6 (Moderate)', note: 'Wear sun protection', icon: 'wb_sunny', color: 'text-rose-400' },
            { label: 'Atmospheric Pressure', val: '1012 hPa', note: 'Stable barometer', icon: 'speed', color: 'text-blue-400' },
            { label: 'Dew Point', val: '23°C', note: 'Foliar wetness active', icon: 'opacity', color: 'text-indigo-400' },
          ].map((m, i) => (
            <Card key={i} variant="glass" className="p-4 space-y-1.5 border-emerald-500/20">
              <div className={`flex items-center justify-between ${m.color}`}>
                <span className="text-xs font-semibold text-slate-400">{m.label}</span>
                <Icon name={m.icon} size={20} />
              </div>
              <div className="text-xl font-black text-white">{m.val}</div>
              <p className="text-[10px] text-slate-400 font-medium">{m.note}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* 7-DAY FORECAST STRIP */}
      <Card variant="glass" className="p-6 space-y-4 border-emerald-500/20 bg-slate-950/40">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Icon name="calendar_view_week" size={20} className="text-emerald-400" />
          7-Day Weather Outlook
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
          {mock7DayForecast.map((f, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-2xl text-center space-y-2 border transition-all ${
                idx === 0
                  ? 'bg-emerald-950/60 border-emerald-500/50 text-white shadow-lg shadow-emerald-950/50'
                  : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-emerald-500/30'
              }`}
            >
              <span className="text-xs font-bold block">{f.day}</span>
              <Icon name={f.icon} size={28} className="mx-auto text-emerald-400" />
              <div className="text-xs font-extrabold">
                {f.tempMax}° / <span className="text-slate-400 font-normal">{f.tempMin}°</span>
              </div>
              <span className="text-[10px] text-teal-300 font-semibold block">
                💧 {f.rainChance}%
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* FARMING ADVISORY SUGGESTIONS */}
      <Card variant="glass" className="p-6 space-y-4 border-emerald-500/30 bg-emerald-950/20">
        <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
          <Icon name="psychology" size={22} className="text-emerald-400" />
          AI Agricultural Action Recommendations
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-black/30 border border-emerald-500/20 space-y-2">
            <div className="flex items-center gap-2 font-bold text-xs text-amber-300">
              <Icon name="shower" size={18} />
              <span>Irrigation Timing</span>
            </div>
            <p className="text-xs text-slate-300">
              <strong className="text-white">Pause Irrigation Today:</strong> Rainfall probability is 65% with 68% existing soil moisture. Save diesel & electrical power.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-black/30 border border-emerald-500/20 space-y-2">
            <div className="flex items-center gap-2 font-bold text-xs text-rose-300">
              <Icon name="sanitizer" size={18} />
              <span>Pesticide Spray Advisory</span>
            </div>
            <p className="text-xs text-slate-300">
              <strong className="text-white">Avoid Spraying on Friday:</strong> Expected heavy showers will wash away pesticide sprays. Optimal window: Saturday morning (6 AM - 9 AM).
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-black/30 border border-emerald-500/20 space-y-2">
            <div className="flex items-center gap-2 font-bold text-xs text-emerald-300">
              <Icon name="agriculture" size={18} />
              <span>Harvest Recommendation</span>
            </div>
            <p className="text-xs text-slate-300">
              <strong className="text-white">Harvest Mature Paddy by Thursday:</strong> Complete threshing before Friday rainfall to prevent grain discoloration and moisture loss.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
