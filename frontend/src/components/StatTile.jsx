const StatTile = ({ label, value }) => (
  <div className="bg-white border border-gray-200 rounded-lg p-5">
    <p className="text-gray-600 text-sm">{label}</p>
    <p className="text-2xl font-bold mt-1">
      {value === undefined ? '—' : value.toLocaleString()}
    </p>
  </div>
);

export default StatTile;
