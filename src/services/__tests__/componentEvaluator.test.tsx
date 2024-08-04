import { evalComponent } from '../componentEvaluator';
import React from 'react';

describe('componentEvaluator', () => {
    it('should evaluate a simple React component', () => {
        const componentString = `
      const SimpleComponent = () => <div>Hello, World!</div>;
      export default SimpleComponent;
    `;
        const Component = evalComponent(componentString);
        expect(Component).toBeDefined();
        expect(React.isValidElement(<Component />)).toBeTruthy();
    });

    it('should throw an error for invalid component', () => {
        const invalidComponentString = `
      const InvalidComponent = () => <div>Hello, World!<///div>;
    `;
        expect(() => evalComponent(invalidComponentString)).toThrow();
    });
});