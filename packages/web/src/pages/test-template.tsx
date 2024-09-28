import React, { useState } from 'react';
import axios from 'axios';
import { debounce } from 'lodash';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/pdf';

export default function TestTemplate() {
  const [templateId, setTemplateId] = useState('template1');
  const [data, setData] = useState(JSON.stringify({
    invitationNumber: 31415926,
    invitationIssuer: "BlitzDnD",
    inviteCount: 2
  }, null, 2));
  const [pdfUrl, setPdfUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = debounce(async () => {
    setIsGenerating(true);
    try {
      const parsedData = JSON.parse(data);
      const encodedData = btoa(JSON.stringify(parsedData));
      const response = await axios.get(`${API_URL}/generate/${templateId}`, {
        params: {
          data: encodedData,
          upload: true
        }
      });

      setPdfUrl(response.data.data.url);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please check the console for details.');
    } finally {
      setIsGenerating(false);
    }
  }, 1000);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Test Prepared Template</h1>
      <div className="mb-4">
        <label className="block mb-2">Template ID:</label>
        <input
          type="text"
          value={templateId}
          onChange={(e) => setTemplateId(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>
      <div className="mb-4">
        <label className="block mb-2">Template Data (JSON):</label>
        <textarea
          value={data}
          onChange={(e) => setData(e.target.value)}
          className="w-full h-48 p-2 border rounded font-mono"
        />
      </div>
      <button
        onClick={generatePDF}
        disabled={isGenerating}
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
      >
        {isGenerating ? 'Generating...' : 'Generate PDF'}
      </button>
      {pdfUrl && (
        <div className="mt-4">
          <h2 className="text-xl font-bold mb-2">Generated PDF:</h2>
          <iframe src={pdfUrl} className="w-full h-screen border rounded" />
        </div>
      )}
    </div>
  );
}