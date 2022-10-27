import {readFile} from 'fs/promises';
import type {Plugin} from 'vite';

export type Options = {
  name?: string;
  enforce?: Plugin['enforce'],
  virtualPrefix?: false | string;
  map(file: string): string | void | undefined;
}

export default function resolveAsPlugin({ map, virtualPrefix = '\0', ...options }: Options): Plugin {
  const virtualToRealMap = new Map<string, string>();
  const realToVirtualMap = new Map<string, string>();

  return {
    name: 'resolve-as',
    enforce: 'pre',
    ...options,
    resolveId(id, importer, options) {
      if (virtualToRealMap.has(id)) return id;
      const resolve = (i) => this.resolve(i, importer, { ...options, skipSelf: true });
      return resolve(id)
        .then((resolved) => {
          if (!resolved || resolved.external) return resolved;
          const newFile = map(resolved.id);
          if (!newFile || newFile === resolved.id) return resolved;
          const id = virtualPrefix ? virtualPrefix + newFile : newFile;

            virtualToRealMap.set(id, resolved.id);
            realToVirtualMap.set(resolved.id, id);
            return { ...resolved, id };
        });
    },
    load(id, options) {
      const realFile = virtualToRealMap.get(id);
      if (realFile) {
        return readFile(realFile, 'utf8');
      }
    },
    configureServer(server) {
      server.watcher.on('change', (file) => {
        const virtualFile = realToVirtualMap.get(file);
        if (virtualFile) {
          server.watcher.emit('change', virtualFile);
        }
      });
    },
  };
}
