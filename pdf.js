import React from 'react';

const ListItem = ({ children }) => (
    <li className="mb-2 text-red-500">{children}</li>
);

const AnyComponentNameReallyJustDefaultExport = ({ title, content, items }) => (
  <html>
    <head>
      <style id="tailwind-css"></style>
    </head>
    <body>
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">{title}</h1>
        <p className="mb-4">{content}</p>
        <ul className="list-disc pl-5">
          {items.map((item, index) => (
            <ListItem key={index}>{item}</ListItem>
          ))}
        </ul>
      </div>
    </body>
  </html>
);

export default AnyComponentNameReallyJustDefaultExport;