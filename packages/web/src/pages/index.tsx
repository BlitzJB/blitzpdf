import React, { useState, useCallback, useEffect } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import axios from 'axios';
import debounce from 'lodash/debounce';

const MonacoEditor = dynamic(import('@monaco-editor/react'), { ssr: false });

export default function Home() {
  const [code, setCode] = useState(`import React from 'react';

export default function PDFComponent({ title, content, items }) {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-red-500">{title}</h1>
      <p>{content}</p>
      <ol>
        {
          items.map(item => (
            <ListItem text={item} />
          ))
        }
      </ol>
    </div>
  );
}

function ListItem({ text }) {
  return <li className="list-disc text-blue-500 ml-5">{text}</li>
}`);

  const [data, setData] = useState(JSON.stringify({
    title: 'Test Title',
    content: 'Test Content',
    items: ['Item 1', 'Item 2', 'Item 3'],
  }, null, 2));

  const [pdfUrl, setPdfUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = useCallback(debounce(async (componentString, jsonData) => {
    setIsGenerating(true);
    try {
      const parsedData = JSON.parse(jsonData);
      const response = await axios.post('http://localhost:5010/api/pdf', {
        componentString,
        data: parsedData,
      });
      setPdfUrl(`/api/pdf-preview?url=${encodeURIComponent(response.data.data.url)}`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  }, 1000), []);

  useEffect(() => {
    generatePDF(code, data);
  }, [code, data, generatePDF]);

  return (
    <div className="flex flex-col h-screen">
      <Head>
        <title>BlitzPDF</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className="flex justify-between items-center p-4 bg-gray-800 text-white">
        <h1 className="text-xl font-bold">BlitzPDF</h1>
        {isGenerating && (
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
        )}
      </header>

      <main className="flex-grow flex">
        <div className="w-1/2 flex flex-col">
          <h2 className="text-lg font-bold p-4 bg-gray-200">Component Code</h2>
          <div className="h-3/4">
            <MonacoEditor
              height="100%"
              defaultLanguage="javascript"
              value={code}
              onChange={(value) => setCode(value || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                scrollBeyondLastColumn: 0,
                scrollBeyondLastLine: false,
              }}
            />
          </div>
          <h2 className="text-lg font-bold p-4 bg-gray-200">Data</h2>
          <div className="h-1/4">
            <MonacoEditor
              height="100%"
              defaultLanguage="json"
              value={data}
              onChange={(value) => setData(value || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                scrollbar: { vertical: 'hidden' },
                scrollBeyondLastColumn: 0,
                scrollBeyondLastLine: false,
              }}
            />
          </div>
        </div>
        <div className="w-1/2">
          {pdfUrl ? (
            <iframe 
              src={pdfUrl} 
              className="w-full h-full"
              title="PDF Preview"
            />
          ) : (
            <p>Generating PDF preview...</p>
          )}
        </div>
      </main>
    </div>
  );
}