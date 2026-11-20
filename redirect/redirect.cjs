// Runs on the App Service copilotstudio-academy so its address can be shared and printed on
// certificates. Every request is sent to the same path on the course site (REDIRECT_TARGET).
// 302 rather than 301 so browsers don't cache it and the target can move to a custom domain.
const http = require('node:http')

const target = (process.env.REDIRECT_TARGET || '').replace(/\/+$/, '')
if (!/^https:\/\/[a-z0-9.-]+$/i.test(target)) {
  console.error('REDIRECT_TARGET must be an https origin, e.g. https://example.azurestaticapps.net')
  process.exit(1)
}

http
  .createServer((req, res) => {
    const path = (req.url || '/').startsWith('/') ? req.url : '/'
    res.writeHead(302, { Location: target + path, 'Cache-Control': 'no-store' })
    res.end()
  })
  .listen(Number(process.env.PORT) || 8080, () => console.log(`Redirecting to ${target}`))
