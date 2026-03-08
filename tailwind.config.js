/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: { extend: {
    colors: { brand: { 50:'#f0f4ff',100:'#dde6ff',200:'#c3d0ff',300:'#9eb0ff',400:'#7485ff',500:'#5562f5',600:'#4040eb',700:'#3530d0',800:'#2c29a8',900:'#292885',950:'#1a1851' } }
  }},
  plugins: [],
};