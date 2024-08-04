const React = require('react');
const ReactDOMServer = require('react-dom/server');
const puppeteer = require('puppeteer');
const postcss = require('postcss');
const tailwindcss = require('tailwindcss');
const autoprefixer = require('autoprefixer');
const fs = require('fs');
const path = require('path');
const { transformSync } = require('@babel/core');

async function buildTailwindCSS(content) {
    const css = `@tailwind base; @tailwind components; @tailwind utilities;`

    const result = await postcss([
        tailwindcss({
            content: [{ raw: content }],
            // vera ethachum config na kuda inga pottukalam
        }),
        autoprefixer,
    ]).process(css, {
        from: undefined,
    });

    return result.css;
}

function evalComponent(componentString) {
    const transpiledCode = transformSync(componentString, {
        presets: ['@babel/preset-env', '@babel/preset-react'],
        plugins: ['@babel/plugin-transform-modules-commonjs']
    }).code;

    const sandbox = {
        React,
        exports: {},
        require: require
    };

    const vm = require('vm');
    const script = new vm.Script(transpiledCode);
    const context = vm.createContext(sandbox);
    script.runInContext(context);

    return sandbox.exports.default;
}

async function generatePDF(componentString, data) {
    const PDFDocument = evalComponent(componentString);

    const html = ReactDOMServer.renderToString(
        React.createElement(PDFDocument, data)
    );

    const css = await buildTailwindCSS(html);

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.setContent(html);

    await page.evaluate((css) => {
        document.getElementById('tailwind-css').textContent = css;
    }, css);

    await page.pdf({ path: 'react-tailwind-output5.pdf', format: 'A4' });

    await browser.close();

    console.log('PDF generated successfully!');
}

const componentString = fs.readFileSync(path.join(__dirname, 'pdf.js'), 'utf-8');
const data = {
    title: "Welcome to Our Dynamic PDF",
    content: "This PDF is generated with a dynamically loaded React component and Tailwind CSS.",
    items: ["Dynamic Item 1", "Dynamic Item 2", "Dynamic Item 3"]
};

generatePDF(componentString, data);