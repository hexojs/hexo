import Promise from 'bluebird';

export function readStream(stream): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = '';

    stream.on('data', chunk => {
      data += chunk.toString();
    }).on('end', () => {
      resolve(data);
    }).on('error', reject);
  });
}
