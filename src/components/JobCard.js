import React from "react";

function JobCard({ job, onApply }) {
  return (
    <div className="border rounded-lg p-4 shadow hover:shadow-lg transition mb-3">

      <h3 className="text-lg font-bold">{job.title}</h3>
      <p className="text-gray-600">{job.location}</p>
      <p className="text-green-600 font-semibold">₹{job.salary}</p>

      <button
        onClick={() => onApply(job.id)}
        className="bg-blue-600 text-white px-3 py-1 mt-3 rounded">
        Apply
      </button>

    </div>
  );
}

export default JobCard;