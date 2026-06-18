import React from "react";

const Loader = () => {
  return (
    <div className="flex items-center justify-center space-x-2 py-10 w-full">
      <div className="w-3 h-3 bg-red-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
      <div className="w-3 h-3 bg-red-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
      <div className="w-3 h-3 bg-red-600 rounded-full animate-bounce"></div>
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default Loader;
