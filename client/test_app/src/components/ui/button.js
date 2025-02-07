import React from "react";

const Button = ({ onClick, children }) => {
    return (
      <button className="px-4 py-2 bg-blue-500 text-white rounded" onClick={onClick}>
        {children}
      </button>
    );
  };
  
  export default Button;  // default export にする
  
