# rollup-plugin-resolve-as

Some processing logic depends on special file names, so...

## Install

```sh
npm i -D rollup-plugin-resolve-as
```

## Usage

### Vite

```ts
import vite from 'vite';
import resolveAs from 'rollup-plugin-resolve-as';

export default defineConfig({
  plugins: resolveAs({
    map: file => file.endsWith('.css') && file.endsWith('.module.css') && file.replace(/\.css$/, '.module.css')
  }),
});
```
