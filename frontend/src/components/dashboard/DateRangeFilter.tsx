import { getDateRangePreset } from '../../utils/dateHelpers';

interface DateRangeFilterProps {
  categories: string[];
  selectedCategory: string;
  selectedPreset: string;
  onCategoryChange: (category: string) => void;
  onPresetChange: (preset: string) => void;
  onCustomDateChange: (startDate: string, endDate: string) => void;
}

const presets = [
  { value: 'this-month', label: 'This Month' },
  { value: 'last-3-months', label: 'Last 3 Months' },
  { value: 'last-6-months', label: 'Last 6 Months' },
  { value: 'last-year', label: 'Last Year' },
  { value: 'custom', label: 'Custom' },
];

export function DateRangeFilter({
  categories,
  selectedCategory,
  selectedPreset,
  onCategoryChange,
  onPresetChange,
  onCustomDateChange,
}: DateRangeFilterProps) {
  const handlePresetClick = (preset: string) => {
    onPresetChange(preset);
    if (preset !== 'custom') {
      const { startDate, endDate } = getDateRangePreset(preset);
      onCustomDateChange(startDate, endDate);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3" id="date-range-filter">
      {/* Presets */}
      <div className="flex items-center gap-1 bg-dark-900/60 border border-dark-800 rounded-xl p-1">
        {presets
          .filter((p) => p.value !== 'custom')
          .map((preset) => (
            <button
              key={preset.value}
              onClick={() => handlePresetClick(preset.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                selectedPreset === preset.value
                  ? 'bg-primary-600 text-white shadow-glow'
                  : 'text-dark-400 hover:text-dark-200 hover:bg-dark-800'
              }`}
            >
              {preset.label}
            </button>
          ))}
      </div>

      {/* Category filter */}
      <select
        value={selectedCategory}
        onChange={(e) => onCategoryChange(e.target.value)}
        className="bg-dark-900/60 border border-dark-800 text-dark-300 text-sm rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:outline-none focus:border-transparent cursor-pointer"
      >
        <option value="">All Categories</option>
        {categories.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>

      {/* Custom date inputs */}
      {selectedPreset === 'custom' && (
        <div className="flex items-center gap-2">
          <input
            type="date"
            onChange={(e) => {
              const end = document.querySelector<HTMLInputElement>('#end-date');
              onCustomDateChange(e.target.value, end?.value || '');
            }}
            className="bg-dark-900/60 border border-dark-800 text-dark-300 text-sm rounded-xl px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:outline-none"
          />
          <span className="text-dark-500">to</span>
          <input
            id="end-date"
            type="date"
            onChange={(e) => {
              const start = document.querySelector<HTMLInputElement>('input[type="date"]:first-of-type');
              onCustomDateChange(start?.value || '', e.target.value);
            }}
            className="bg-dark-900/60 border border-dark-800 text-dark-300 text-sm rounded-xl px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:outline-none"
          />
        </div>
      )}
    </div>
  );
}
