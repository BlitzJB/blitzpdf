import React, { useState, useEffect } from 'react';
import { Select, Button } from '@/components/ui';
import Editor from '@monaco-editor/react';
import { evalComponent } from '@/utils/componentEvaluator';

function TemplateEditor() {
  const [templates, setTemplates] = useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [templateContent, setTemplateContent] = useState<string>('');
  const [sampleData, setSampleData] = useState<Record<string, any>>({});
  const [previewComponent, setPreviewComponent] = useState<React.ComponentType<any> | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  useEffect(() => {
    if (selectedTemplate) {
      fetchTemplateContent(selectedTemplate);
    }
  }, [selectedTemplate]);

  async function fetchTemplates() {
    const response = await fetch('/api/pdf/templates');
    const data = await response.json();
    setTemplates(data);
  }

  async function fetchTemplateContent(templateId: string) {
    const response = await fetch(`/api/pdf/templates/${templateId}`);
    const data = await response.json();
    setTemplateContent(data.content);
    setSampleData(data.sampleData);
    updatePreview(data.content);
  }

  async function handleSave() {
    await fetch(`/api/pdf/templates/${selectedTemplate}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: templateContent }),
    });
    updatePreview(templateContent);
  }

  function updatePreview(content: string) {
    try {
      const Component = evalComponent(content);
      setPreviewComponent(() => Component);
    } catch (error) {
      console.error('Error evaluating component:', error);
      setPreviewComponent(null);
    }
  }

  return (
    <div className="space-y-4">
      <Select
        value={selectedTemplate}
        onValueChange={setSelectedTemplate}
        options={templates.map(t => ({ value: t, label: t }))}
      />
      <Editor
        height="400px"
        language="typescript"
        value={templateContent}
        onChange={value => setTemplateContent(value || '')}
      />
      <Button onClick={handleSave}>Save Template</Button>
      <div className="mt-4">
        <h3 className="text-lg font-semibold">Sample Data:</h3>
        <pre className="bg-gray-100 p-2 rounded">{JSON.stringify(sampleData, null, 2)}</pre>
      </div>
      <div className="mt-4">
        <h3 className="text-lg font-semibold">Preview:</h3>
        <div className="border p-4 rounded">
          {previewComponent ? React.createElement(previewComponent, sampleData) : 'No preview available'}
        </div>
      </div>
    </div>
  );
}

export default TemplateEditor;