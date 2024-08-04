import React from 'react';

import { transformSync } from '@babel/core';
import { createSandbox } from '../utils/sandbox';

export function evalComponent(componentString: string): React.ComponentType<any> {
    const transpiledCode = transformSync(componentString, {
        presets: ['@babel/preset-env', '@babel/preset-react'],
        plugins: ['@babel/plugin-transform-modules-commonjs']
    })?.code;

    if (!transpiledCode) {
        throw new Error('Failed to transpile component');
    }

    const sandbox = createSandbox();
    const vm = require('vm');
    const script = new vm.Script(transpiledCode);
    const context = vm.createContext(sandbox);
    script.runInContext(context);

    // @ts-expect-error - default export is not defined in the types
    return sandbox.exports.default;
}