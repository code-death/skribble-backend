/**
 * Entry Script
 */
require('dotenv').config();

// Babel polyfill to convert ES6 code in runtime
require('@babel/register');
require('./src');
