import net from 'node:net';

export async function getFreePort(): Promise<number> {
  return await new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.listen(0, () => {
      const address = srv.address();
      if (address && typeof address === 'object' && 'port' in address) {
        const port = address.port;
        srv.close(() => resolve(port));
        return;
      }
      reject(new Error('Cannot determine any free port number'));
    });
  });
}
