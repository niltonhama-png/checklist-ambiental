/* Armazenamento local (IndexedDB): inspeções, fotos e PDFs gerados. Funciona offline. */
const DB = (() => {
  let dbp;
  function open() {
    if (dbp) return dbp;
    dbp = new Promise((resolve, reject) => {
      const req = indexedDB.open('checklist-ambiental', 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        db.createObjectStore('inspecoes', { keyPath: 'id' });
        const f = db.createObjectStore('fotos', { keyPath: 'id' });
        f.createIndex('insp', 'inspId');
        db.createObjectStore('pdfs', { keyPath: 'inspId' });
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    return dbp;
  }
  async function tx(store, mode, fn) {
    const db = await open();
    return new Promise((resolve, reject) => {
      const t = db.transaction(store, mode);
      const s = t.objectStore(store);
      let out;
      Promise.resolve(fn(s)).then((r) => { out = r; });
      t.oncomplete = () => resolve(out);
      t.onerror = () => reject(t.error);
      t.onabort = () => reject(t.error || new Error('Transação abortada (armazenamento cheio?)'));
    });
  }
  const req2p = (r) => new Promise((res, rej) => { r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });

  return {
    put: (store, obj) => tx(store, 'readwrite', (s) => { s.put(obj); }),
    get: (store, key) => tx(store, 'readonly', (s) => req2p(s.get(key))),
    del: (store, key) => tx(store, 'readwrite', (s) => { s.delete(key); }),
    all: (store) => tx(store, 'readonly', (s) => req2p(s.getAll())),
    fotosDa: (inspId) => tx('fotos', 'readonly', (s) => req2p(s.index('insp').getAll(inspId))),
    async apagarInspecao(inspId) {
      const fotos = await this.fotosDa(inspId);
      await tx('fotos', 'readwrite', (s) => fotos.forEach((f) => s.delete(f.id)));
      await this.del('pdfs', inspId);
      await this.del('inspecoes', inspId);
    },
  };
})();
