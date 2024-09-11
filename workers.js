// Define the updated list of files
const files = [
  {
    name: "tiny11 23H2 x64.iso",
    url: "https://archive.org/download/tiny-11-NTDEV/tiny11%2023H2%20x64.iso"
  },
  {
    name: "tiny11 b1.iso",
    url: "https://archive.org/download/tiny-11-NTDEV/tiny11%20b1.iso"
  },
  {
    name: "tiny11 b2 (no sysreq).iso",
    url: "https://archive.org/download/tiny-11-NTDEV/tiny11%20b2%28no%20sysreq%29.iso"
  },
  {
    name: "tiny11 b2.iso",
    url: "https://archive.org/download/tiny-11-NTDEV/tiny11%20b2.iso"
  },
  {
    name: "tiny11 a64 r1.iso",
    url: "https://archive.org/download/tiny-11-NTDEV/tiny11a64%20r1.iso"
  }
];

// Function to generate HTML for file listing
function generateHTML(fileList) {
  let fileLinks = fileList.map((file, index) => `<li><a href="/proxy/${index}" target="_blank">${file.name}</a></li>`).join('');
  
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Index of /</title>
    <style>
      body {
        font-family: monospace;
        background-color: white;
        color: black;
        margin: 40px;
      }
      h1 {
        font-size: 24px;
      }
      ul {
        padding: 0;
        margin: 0;
        list-style-type: none;
      }
      li {
        margin: 5px 0;
      }
      a {
        color: blue;
        text-decoration: none;
      }
      a:hover {
        text-decoration: underline;
      }
      hr {
        border: none;
        border-top: 1px solid #ccc;
        margin: 20px 0;
      }
    </style>
  </head>
  <body>
    <h1>Index of /</h1>
    <hr>
    <ul>
      ${fileLinks}
    </ul>
    <hr>
  </body>
  </html>
  `;
}

// Event listener for the fetch request
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

// Handle the incoming requests
async function handleRequest(request) {
  const { pathname } = new URL(request.url);

  if (pathname === '/') {
    // Return the file listing page
    const html = generateHTML(files);
    return new Response(html, {
      headers: { 'Content-Type': 'text/html;charset=UTF-8' }
    });
  }

  // Proxy requests to the actual file URLs
  if (pathname.startsWith('/proxy/')) {
    const fileIndex = parseInt(pathname.split('/')[2], 10);

    if (fileIndex >= 0 && fileIndex < files.length) {
      // Get the URL of the requested file
      const fileUrl = files[fileIndex].url;

      // Fetch the file from the original server
      const fileResponse = await fetch(fileUrl);
      const { headers } = fileResponse;
      const contentLength = headers.get('Content-Length');
      const rangeHeader = request.headers.get('Range');

      // Handle Range requests
      if (rangeHeader) {
        const rangeMatch = rangeHeader.match(/bytes=(\d+)-(\d+)?/);
        if (rangeMatch) {
          const start = parseInt(rangeMatch[1], 10);
          const end = rangeMatch[2] ? parseInt(rangeMatch[2], 10) : contentLength - 1;
          const chunkSize = end - start + 1;

          const partialResponse = await fetch(fileUrl, {
            headers: {
              Range: `bytes=${start}-${end}`
            }
          });

          return new Response(partialResponse.body, {
            status: 206,
            headers: {
              'Content-Type': headers.get('Content-Type') || 'application/octet-stream',
              'Content-Length': chunkSize,
              'Content-Range': `bytes ${start}-${end}/${contentLength}`,
              'Content-Disposition': `attachment; filename="${files[fileIndex].name}"`
            }
          });
        }
      }

      // If no Range header, return the full file
      return new Response(fileResponse.body, {
        headers: {
          'Content-Type': headers.get('Content-Type') || 'application/octet-stream',
          'Content-Length': contentLength,
          'Content-Disposition': `attachment; filename="${files[fileIndex].name}"`
        }
      });
    }
  }

  // If the path is not found, return a 404
  return new Response('404 Not Found', { status: 404 });
        }
