import React from "react";

const Card = ({ children, className }) => {
  return (
    <div className={`rounded-2xl shadow-md p-4 bg-white ${className}`}>
      {children}
    </div>
  );
};

const CardHeader = ({ children }) => {
  return <div className="border-b mr-[50px] pb-2 mb-2 ml-[50px] font-bold ">{children}</div>;
};

const CardTitle = ({ children }) => {
  return <h2 className="text-lg text-[1.5rem] font-bold">{children}</h2>;
};

const CardContent = ({ children }) => {
  return <div className="mt-2">{children}</div>;
};

export { Card, CardHeader, CardTitle, CardContent };
