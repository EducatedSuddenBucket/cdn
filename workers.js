// Define the list of files (you can add more URLs later)
const files = [
  {
    name: "tiny11 b1.iso",
    url: "https://ia804705.us.archive.org/13/items/tiny-11-NTDEV/tiny11%20b1.iso"
  },
  {
    name: "tiny11 23H2 x64.iso",
    url: "https://dn790004.ca.archive.org/0/items/tiny-11-NTDEV/tiny11%2023H2%20x64.iso"
  },
  {
    name: "tiny11 b2 (no systeq).iso",
    url: "https://dn790004.ca.archive.org/0/items/tiny-11-NTDEV/tiny11%20b2%28no%20sysreq%29.iso"
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

      // Fetch the file from the original server and stream it through Cloudflare
      const response = await fetch(fileUrl);

      // Return the proxied response
      return new Response(response.body, {
        headers: {
          'Content-Type': response.headers.get('Content-Type') || 'application/octet-stream',
          'Content-Disposition': `attachment; filename="${files[fileIndex].name}"`
        }
      });
    }
  }

  // If the path is not found, return a 404
  return new Response('404 Not Found', { status: 404 });
                               }
