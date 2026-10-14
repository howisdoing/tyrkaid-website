import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';

function inlineCss(){
  return {
    name:'inline-css-for-first-paint',
    apply:'build',
    enforce:'post',
    generateBundle(_options,bundle){
      const htmlEntry=Object.values(bundle).find(x=>x.type==='asset'&&x.fileName==='index.html');
      if(!htmlEntry||typeof htmlEntry.source!=='string')return;
      const cssAssets=Object.values(bundle).filter(x=>x.type==='asset'&&x.fileName.endsWith('.css'));
      if(!cssAssets.length)return;
      let css='';
      for(const asset of cssAssets){
        css+=String(asset.source||'')+'\n';
        delete bundle[asset.fileName];
      }
      htmlEntry.source=htmlEntry.source
        .replace(/<link[^>]+rel=["']stylesheet["'][^>]*>/g,'')
        .replace('</head>',`<style>${css}</style></head>`);
    }
  };
}

export default defineConfig({
  plugins:[react(),inlineCss()],
  build:{
    target:'es2020',
    cssCodeSplit:false
  }
});
