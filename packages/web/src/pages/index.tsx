import React, { useState, useCallback, useEffect } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import axios from 'axios';
import debounce from 'lodash/debounce';
import { Copy } from 'lucide-react';

const API_URL = process.env.NODE_ENV === 'development' ? 'http://localhost:5000/api/pdf' : 'https://api-blitzpdf.blitzdnd.com/api/pdf';

const MonacoEditor = dynamic(import('@monaco-editor/react'), { ssr: false });

const CopyButton = ({ onClick }: { onClick: () => void }) => (
  <button
    onClick={onClick}
    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded flex items-center"
  >
    <Copy size={16} className="mr-2" />
    Copy API Request
  </button>
);

const Popover = ({ isOpen, onClose, onLanguageSelect }: { isOpen: boolean, onClose: () => void, onLanguageSelect: (lang: string) => void }) => {
  if (!isOpen) return null;

  const languages = ['JavaScript', 'Python', 'Java', 'Curl'];

  return (
    <div className="absolute text-black top-12 right-4 bg-white border border-gray-200 rounded shadow-lg p-4">
      <h3 className="text-lg font-bold mb-2">Select Language</h3>
      {languages.map((lang) => (
        <button
          key={lang}
          onClick={() => onLanguageSelect(lang)}
          className="block w-full text-left py-2 px-4 hover:bg-gray-100"
        >
          {lang}
        </button>
      ))}
      <button
        onClick={onClose}
        className="mt-2 text-sm text-gray-500 hover:text-gray-700"
      >
        Close
      </button>
    </div>
  );
};



const Modal = ({ isOpen, onClose, language, data, code }: { isOpen: boolean, onClose: () => void, language: string, data: string, code: string }) => {
  if (!isOpen) return null;

  const getRequestCode = (lang: string, data: string, code: string) => {
    const parsedData = JSON.parse(data);
    const url = API_URL;
    
    switch (lang.toLowerCase()) {
      case 'javascript':
        return `
fetch('${url}', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    componentString: \`${code.replace(/`/g, '\\`')}\`,
    data: ${JSON.stringify(parsedData, null, 2)}
  }),
})
  .then(response => response.json())
  .then(data => console.log(data.data.url))
  .catch((error) => console.error('Error:', error));`;

      case 'python':
        return `
import requests
import json

url = '${url}'
payload = {
    'componentString': '''${code.replace(/'''/g, "\\'\\'\\'")}''',
    'data': ${JSON.stringify(parsedData, null, 2)}
}

response = requests.post(url, json=payload)
print(response.json()['data']['url'])`;

      case 'java':
        return `
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.URI;

String url = "${url}";
String jsonInputString = "{"
    + "'componentString': '" + ${JSON.stringify(code).slice(1, -1)} + "',"
    + "'data': ${JSON.stringify(parsedData).replace(/'/g, "\\'")}
}";

HttpClient client = HttpClient.newHttpClient();
HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create(url))
    .header("Content-Type", "application/json")
    .POST(HttpRequest.BodyPublishers.ofString(jsonInputString))
    .build();

HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
System.out.println(response.body());`;

      case 'curl':
        return `
curl -X POST '${url}' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "componentString": ${JSON.stringify(code)},
    "data": ${JSON.stringify(parsedData, null, 2)}
  }'`;

      default:
        return 'Language not supported';
    }
  };

  const requestCode = getRequestCode(language, data, code);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(requestCode);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-3/4 max-w-3xl">
        <h2 className="text-2xl font-bold mb-4">{language} Code for API Request</h2>
        <pre className="bg-gray-100 p-4 rounded mb-4 overflow-auto max-h-96">
          <code>{requestCode}</code>
        </pre>
        <div className="flex justify-end">
          <button
            onClick={copyToClipboard}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded mr-2 flex items-center"
          >
            <Copy size={16} className="mr-2" />
            Copy Code
          </button>
          <button
            onClick={onClose}
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};



export default function Home() {
  const [code, setCode] = useState(`import React from 'react';

const Stub = ({ invitationNumber, inviteCount }) => (
  <div className="relative w-1/3 p-4 border-r border-gray-200">
    <div className="flex flex-col">
      <span className="text-sm text-gray-400">ADMIT</span>
      <span className="text-xs text-gray-400">INVITATION {invitationNumber}</span>
    </div>
    <div className="absolute left-4 bottom-0 text-[150px] text-gray-200 font-bold leading-none">{inviteCount}</div>
    <div className="absolute right-4 bottom-4 text-right">
      <p className="text-sm">Invite{inviteCount > 1 ? "s" : ""}</p>
      <p className="text-sm">for</p>
      <p className="text-sm">you</p>
    </div>
  </div>
);

const CheckInfo = ({ title, content }) => (
  <div className="mr-8">
    <div className="text-xs font-bold mb-1">{title}</div>
    <div className="text-sm">{content}</div>
  </div>
);

const Check = ({ invitationNumber, invitationIssuer, inviteCount }) => (
  <div className="w-2/3 p-4 relative">
    <div className="text-6xl font-black leading-tight mb-8">
      You're<br />Invited
    </div>
    <div className="absolute top-4 right-4 text-3xl text-red-500 font-bold">#{inviteCount}</div>
    <div className="flex justify-start text-xs mt-5">
      <CheckInfo title="DATE" content={new Date().toLocaleDateString()} />
      <CheckInfo title="ISSUED BY" content={invitationIssuer} />
      <CheckInfo title="INVITE NUMBER" content={invitationNumber} />
    </div>
  </div>
);

const InvitationTicket = ({ invitationNumber, invitationIssuer, inviteCount }) => {
  return (
    <div className="bg-white font-sans m-0 p-4 flex justify-center items-center">
      <div className="flex w-full max-w-3xl border border-gray-200 shadow-lg">
        <Stub invitationNumber={invitationNumber} inviteCount={inviteCount} />
        <Check invitationNumber={invitationNumber} invitationIssuer={invitationIssuer} inviteCount={inviteCount} />
      </div>
    </div>
  );
};

export default InvitationTicket;`);

  const [data, setData] = useState(JSON.stringify({
    "invitationNumber": 31415926,
    "invitationIssuer": "BlitzDnD",
    "inviteCount": 2
  }, null, 2));

  const [pdfUrl, setPdfUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('');

  const generatePDF = useCallback(debounce(async (componentString, jsonData) => {
    setIsGenerating(true);
    try {
      const parsedData = JSON.parse(jsonData);
      const response = await axios.post(API_URL, {
        componentString,
        data: parsedData,
        upload: false // Set to false to receive buffer instead of URL
      }, {
        responseType: 'arraybuffer' // Important: This tells axios to expect binary data
      });

      // Create a Blob from the PDF buffer
      const blob = new Blob([response.data], { type: 'application/pdf' });

      // Create a URL for the Blob
      const url = URL.createObjectURL(blob);

      setPdfUrl(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  }, 250), []);

  useEffect(() => {
    generatePDF(code, data);
  }, [code, data, generatePDF]);

  const handleCopyClick = () => {
    setIsPopoverOpen(true);
  };

  const handleLanguageSelect = (language: string) => {
    setSelectedLanguage(language);
    setIsPopoverOpen(false);
    setIsModalOpen(true);
  };

  const closePopover = () => {
    setIsPopoverOpen(false);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedLanguage('');
  };

  return (
    <div className="flex flex-col h-screen">
      <Head>
        <title>BlitzPDF</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className="flex justify-between items-center p-4 bg-gray-800 text-white">
        <h1 className="text-xl font-bold">BlitzPDF</h1>
        <div className="flex items-center">
          {isGenerating && (
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-4"></div>
          )}
          <div className="relative">
            <CopyButton onClick={handleCopyClick} />
            <Popover
              isOpen={isPopoverOpen}
              onClose={closePopover}
              onLanguageSelect={handleLanguageSelect}
            />
          </div>
        </div>
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

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        language={selectedLanguage}
        data={data}
        code={code}
      />

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-2">Other Tools:</h2>
        <ul className="list-disc pl-5">
          <li>
            <a href="/test-template" className="text-blue-500 hover:underline">
              Test Prepared Templates
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}