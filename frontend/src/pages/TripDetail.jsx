import { useParams } from 'react-router-dom';

const TripDetail = () => {
  const { id } = useParams();
  return (
    <div className="max-w-2xl mx-auto mt-10 p-6">
      <h1 className="text-2xl font-bold mb-2">Trip Detail</h1>
      <p className="text-gray-600">Trip ID: {id}</p>
      <p className="text-gray-500 mt-4">
        Detail view coming in the next story.
      </p>
    </div>
  );
};

export default TripDetail;
