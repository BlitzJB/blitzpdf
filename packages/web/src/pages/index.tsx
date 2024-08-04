import React, { useState } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import axios from 'axios';

const MonacoEditor = dynamic(import('@monaco-editor/react'), { ssr: false });

export default function Home() {
  const [code, setCode] = useState(`
import React from 'react';

export default function PDFComponent({ title, content }) {
  return (
  <html>
<head>
  <style id="tailwind-css"></style>
</head>
<body>
    <div className="p-4">
      <h1 className="text-2xl font-bold">{title}</h1>
      <p>{content}</p>
    </div>
</body>
</html>
  );
}
  `);
  const [pdfUrl, setPdfUrl] = useState('');

  const handleRefresh = async () => {
    try {
      const response = await axios.post('http://localhost:5010/api/pdf', {
        componentString: code,
        data: { title: 'Test Title', content: 'Test Content' },
        tailwindConfig: {},
      });
      setPdfUrl(response.data.data.url);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <Head>
        <title>BlitzPDF</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className="flex justify-between items-center p-4 bg-gray-800 text-white">
        <h1 className="text-xl font-bold">BlitzPDF</h1>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-600"
        >
          Refresh
        </button>
      </header>

      <main className="flex-grow flex">
        <div className="w-1/2 p-4">
          <MonacoEditor
            height="100%"
            defaultLanguage="javascript"
            defaultValue={code}
            onChange={(value) => setCode(value || '')}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
            }}
          />
        </div>
        <div className="w-1/2 p-4">
          {pdfUrl ? (
            <iframe
              src={pdfUrl}
              className="w-full h-full"
              title="PDF Preview"
            />
          ) : (
            <p>Click "Refresh" to generate and preview the PDF</p>
          )}
        </div>
      </main>
    </div>
  );
}