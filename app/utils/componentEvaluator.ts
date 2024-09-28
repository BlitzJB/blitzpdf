import React from 'react';

export function evalComponent(code: string): React.ComponentType<any> {
  // This is a basic implementation and might need additional security measures
  const func = new Function('React', `return (${code})`);
  return func(React);
}