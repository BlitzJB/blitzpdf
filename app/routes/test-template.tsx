import React from 'react';
import TemplateEditor from '../components/TemplateEditor';

export default function TestTemplate() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Template Editor</h1>
      <TemplateEditor />
    </div>
  );
}