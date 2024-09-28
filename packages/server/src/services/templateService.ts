import fs from 'fs/promises';
import path from 'path';
import { evalComponent } from './componentEvaluator';
import { buildTailwindCSS } from './cssBuilder';
import ReactDOMServer from 'react-dom/server';
import React from 'react';

interface TemplateData {
  componentKey: string;
  css: string;
  sampleData: Record<string, any>;
}

const TEMPLATES_DIR = path.join(__dirname, '..', 'templates');
const DUMP_EXT = '.json';

// In-memory storage for evaluated components
const componentStore: Map<string, React.ComponentType<any>> = new Map();

export async function getOrCreateTemplateData(templateId: string): Promise<TemplateData> {
  const dumpPath = path.join(TEMPLATES_DIR, `${templateId}${DUMP_EXT}`);

  try {
    const dumpContent = await fs.readFile(dumpPath, 'utf-8');
    let templateData: TemplateData = JSON.parse(dumpContent);

    if (!componentStore.has(templateData.componentKey)) {
      templateData = await reevaluateAndUpdateComponent(templateId, templateData);
    }

    return templateData;
  } catch (error) {
    return await createTemplateData(templateId);
  }
}

async function createTemplateData(templateId: string): Promise<TemplateData> {
  const templatePath = path.join(TEMPLATES_DIR, `${templateId}.jsx`);
  const sampleDataPath = path.join(TEMPLATES_DIR, `${templateId}.sample.json`);

  const templateContent = await fs.readFile(templatePath, 'utf-8');
  const sampleData = JSON.parse(await fs.readFile(sampleDataPath, 'utf-8'));

  const componentKey = `component_${templateId}_${Date.now()}`;
  const Component = evalComponent(templateContent);
  componentStore.set(componentKey, Component);

  const html = ReactDOMServer.renderToStaticMarkup(React.createElement(Component, sampleData));
  const css = await buildTailwindCSS(html);

  const templateData: TemplateData = { componentKey, css, sampleData };
  const dumpPath = path.join(TEMPLATES_DIR, `${templateId}${DUMP_EXT}`);
  await fs.writeFile(dumpPath, JSON.stringify(templateData));

  return templateData;
}

async function reevaluateAndUpdateComponent(templateId: string, oldTemplateData: TemplateData): Promise<TemplateData> {
  const templatePath = path.join(TEMPLATES_DIR, `${templateId}.tsx`);
  const templateContent = await fs.readFile(templatePath, 'utf-8');
  const Component = evalComponent(templateContent);

  const newComponentKey = `component_${templateId}_${Date.now()}`;
  componentStore.set(newComponentKey, Component);

  const sampleDataPath = path.join(TEMPLATES_DIR, `${templateId}.sample.json`);
  const sampleData = JSON.parse(await fs.readFile(sampleDataPath, 'utf-8'));

  const html = ReactDOMServer.renderToStaticMarkup(React.createElement(Component, sampleData));
  const css = await buildTailwindCSS(html);

  const newTemplateData: TemplateData = { componentKey: newComponentKey, css, sampleData };
  const dumpPath = path.join(TEMPLATES_DIR, `${templateId}${DUMP_EXT}`);
  await fs.writeFile(dumpPath, JSON.stringify(newTemplateData));

  return newTemplateData;
}

export function getComponent(templateData: TemplateData): React.ComponentType<any> {
  const component = componentStore.get(templateData.componentKey);
  if (!component) {
    throw new Error(`Component with key ${templateData.componentKey} not found in memory. This should not happen as it should have been re-evaluated.`);
  }
  return component;
}

export async function getAllTemplates(): Promise<string[]> {
  const files = await fs.readdir(TEMPLATES_DIR);
  return files
    .filter(file => file.endsWith('.tsx'))
    .map(file => path.basename(file, '.tsx'));
}

export async function getTemplateContent(templateId: string): Promise<string> {
  const templatePath = path.join(TEMPLATES_DIR, `${templateId}.tsx`);
  return await fs.readFile(templatePath, 'utf-8');
}

export async function updateTemplateContent(templateId: string, content: string): Promise<void> {
  const templatePath = path.join(TEMPLATES_DIR, `${templateId}.tsx`);
  await fs.writeFile(templatePath, content);
  await reevaluateAndUpdateComponent(templateId, await getOrCreateTemplateData(templateId));
}