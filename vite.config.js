import {defineConfig} from 'vite';
import {resolve} from 'node:path';
const pages=["monograph","cartography","film-sequence","blueprint","public-index","object-gallery","material-journal"];
export default defineConfig({base:'./',build:{outDir:'dist',emptyOutDir:true,rollupOptions:{input:{main:resolve('index.html'),...Object.fromEntries(pages.map(p=>[p,resolve('desain/'+p+'.html')]))}}}});
