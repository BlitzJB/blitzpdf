### Testing Script
```bash
curl -X 'POST' \
  'http://localhost:3000/api/pdf' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "componentString": "import React from '\''react'\''; const ListItem = ({ children }) => ( <li className='\''mb-2 text-red-500'\''>{children}</li> ); const PDFDocument = ({ title, content, items }) => ( <html> <head> <style id='\''tailwind-css'\''></style> </head> <body> <div className='\''p-8'\''> <h1 className='\''text-2xl font-bold mb-4'\''>{title}</h1> <p className='\''mb-4'\''>{content}</p> <ul className='\''list-disc pl-5'\''> {items.map((item, index) => ( <ListItem key={index}>{item}</ListItem> ))} </ul> </div> </body> </html> ); export default PDFDocument;",
  "data": { "title": "Welcome to Our Dynamic PDF", "content": "This PDF is generated with a dynamically loaded React component and Tailwind CSS.", "items": ["Dynamic Item 1", "Dynamic Item 2", "Dynamic Item 3"] },
  "tailwindConfig": {}
}'
```

# Project Source Description
```
blitzpdf/
├── src/
│   ├── services/
│   │   ├── cssBuilder.ts
│   │   ├── componentEvaluator.ts
│   │   └── pdfGenerator.ts
│   ├── utils/
│   │   └── sandbox.ts
│   ├── types/
│   │   └── index.ts
│   └── index.ts
├── assets/
│   └── PDFDocument.tsx
├── package.json
├── tsconfig.json
└── .gitignore
```

`src/index.ts`
Entry point of the application that reads the component file and initiates the PDF generation process.

`src/services/pdfGenerator.ts`
Orchestrates the PDF generation process, including component evaluation, HTML rendering, and PDF creation.
* Uses Puppeteer for high-fidelity rendering of web content to PDF
* Integrates various services (CSS building, component evaluation) into a cohesive process

`src/services/cssBuilder.ts`
Builds Tailwind CSS dynamically based on the content of the React component.
* Allows for on-the-fly Tailwind CSS generation without a static configuration
* Adaptable to any incoming component, regardless of its structure or classes used

`src/services/componentEvaluator.ts`
Evaluates the string representation of a React component into a usable component.
* Uses Babel for transpilation of JSX and modern JavaScript features
* Employs a sandboxed environment for secure evaluation of potentially untrusted code

`src/utils/sandbox.ts`
Creates a sandbox environment for safe code execution.
* Provides a controlled environment with limited access to global objects
* Enhances security when evaluating external code by restricting available APIs

`assets/PDFDocument.tsx`
A sample React component used to generate the PDF content.
* Stored as an asset to simulate an external, dynamically loaded component
