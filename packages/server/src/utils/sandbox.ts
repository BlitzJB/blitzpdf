import React from 'react';

export function createSandbox() {
    return {
        React,
        exports: {},
        require: require
    };
}