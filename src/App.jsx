import React, { useState, useEffect } from "react";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import { format, subDays } from "date-fns";

// Configuración de las disciplinas
const DISCIPLINES = {
  software: {
    label: "Desarrollo de Software",
    type: "numeric",
    goal: 4,
    unit: "hrs",
  },
  gym: { label: "Gym", type: "boolean", goal: 1, unit: "check" }, // 1 = true
  piano: { label: "Piano", type: "numeric", goal: 1, unit: "hrs" },
  sleeping: { label: "Dormir", type: "numeric", goal: 8, unit: "hrs" },
  reading: { label: "Lectura", type: "numeric", goal: 1, unit: "hrs" },
};

function App() {
  // Estado para guardar los datos: { "2023-10-27": { software: 2, gym: 1, ... } }
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem("life-tracker-data");
    return saved ? JSON.parse(saved) : {};
  });

  const [selectedDiscipline, setSelectedDiscipline] = useState("software");
  const [todayInputs, setTodayInputs] = useState({});

  // Guardar en LocalStorage cada vez que data cambia
  useEffect(() => {
    localStorage.setItem("life-tracker-data", JSON.stringify(data));
  }, [data]);

  // Manejar cambios en el formulario de hoy
  const handleInputChange = (key, value) => {
    setTodayInputs((prev) => ({ ...prev, [key]: value }));
  };

  // Guardar el día
  const saveDay = () => {
    const todayStr = format(new Date(), "yyyy-MM-dd");
    const newData = {
      ...data,
      [todayStr]: { ...data[todayStr], ...todayInputs },
    };
    setData(newData);
    alert("¡Progreso guardado!");
  };

  // Preparar datos para el Heatmap (transformar objeto a array)
  const getHeatmapValues = (disciplineKey) => {
    const entries = [];
    const goal = DISCIPLINES[disciplineKey].goal;

    Object.keys(data).forEach((date) => {
      const val = data[date][disciplineKey] || 0;
      // Normalizamos el valor de 0 a 4 para los colores css
      // Si el valor >= meta, intensidad máxima (4). Si es 0, intensidad 0.
      let intensity = 0;
      if (val > 0) {
        intensity = Math.ceil((val / goal) * 4);
        if (intensity > 4) intensity = 4;
      }
      entries.push({ date: date, count: intensity, rawValue: val });
    });
    return entries;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-green-400">
          Mi Life Tracker
        </h1>

        {/* --- SECCIÓN DE REGISTRO DIARIO --- */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8 border border-gray-700">
          <h2 className="text-xl mb-4 font-semibold">
            Registrar Actividad de Hoy ({format(new Date(), "yyyy-MM-dd")})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(DISCIPLINES).map(([key, config]) => (
              <div key={key} className="flex flex-col">
                <label className="text-sm text-gray-400 mb-1">
                  {config.label}
                </label>
                {config.type === "boolean" ? (
                  <button
                    onClick={() =>
                      handleInputChange(key, todayInputs[key] ? 0 : 1)
                    }
                    className={`p-2 rounded font-bold transition-colors ${
                      todayInputs[key]
                        ? "bg-green-600 text-white"
                        : "bg-gray-700 text-gray-400"
                    }`}
                  >
                    {todayInputs[key] ? "Completado" : "No realizado"}
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      className="bg-gray-700 border border-gray-600 p-2 rounded w-full text-white"
                      placeholder={`Meta: ${config.goal}`}
                      onChange={(e) =>
                        handleInputChange(key, parseFloat(e.target.value))
                      }
                      value={todayInputs[key] || ""}
                    />
                    <span className="text-xs text-gray-500">{config.unit}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
          <button
            onClick={saveDay}
            className="mt-6 w-full bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded transition-all"
          >
            Guardar Día
          </button>
        </div>

        {/* --- SECCIÓN DE VISUALIZACIÓN --- */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
          <div className="flex gap-2 overflow-x-auto mb-6 pb-2">
            {Object.entries(DISCIPLINES).map(([key, config]) => (
              <button
                key={key}
                onClick={() => setSelectedDiscipline(key)}
                className={`px-4 py-1 rounded-full text-sm whitespace-nowrap ${
                  selectedDiscipline === key
                    ? "bg-blue-600 text-white"
                    : "bg-gray-700 hover:bg-gray-600 text-gray-300"
                }`}
              >
                {config.label}
              </button>
            ))}
          </div>

          <h3 className="text-lg font-medium mb-4">
            Historial de:{" "}
            <span className="text-blue-400">
              {DISCIPLINES[selectedDiscipline].label}
            </span>
          </h3>

          <div className="w-full">
            <CalendarHeatmap
              startDate={subDays(new Date(), 365)}
              endDate={new Date()}
              values={getHeatmapValues(selectedDiscipline)}
              classForValue={(value) => {
                if (!value) {
                  return "color-empty";
                }
                return `color-scale-${value.count}`;
              }}
              tooltipDataAttrs={(value) => {
                // Tooltip simple al pasar el mouse
                return {
                  "data-tip": `${value.date || ""} tiene ${
                    value.rawValue || 0
                  } ${DISCIPLINES[selectedDiscipline].unit}`,
                };
              }}
              showWeekdayLabels={true}
            />
          </div>
          <div className="mt-4 flex items-center justify-end text-xs text-gray-500 gap-1">
            <span>Menos</span>
            <div className="w-3 h-3 bg-[#161b22]"></div>
            <div className="w-3 h-3 bg-[#0e4429]"></div>
            <div className="w-3 h-3 bg-[#006d32]"></div>
            <div className="w-3 h-3 bg-[#26a641]"></div>
            <div className="w-3 h-3 bg-[#39d353]"></div>
            <span>Más</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
