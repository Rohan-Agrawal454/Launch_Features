export default function handler(request, context) {
    const parsedUrl = new URL(request.url);
    const route = parsedUrl.pathname;
    
    if (route === '/edge') {
      const response = {
        time: new Date()
      }
      return new Response(JSON.stringify(response))
    }
    
    if (route === '/edge/geo') {
      // Extract geo headers from request
      const geoHeaders = {
        country: request.headers.get('visitor-ip-country') || '',
        region: request.headers.get('visitor-ip-region') || '',
        city: request.headers.get('visitor-ip-city') || ''
      };
      
      return new Response(JSON.stringify({
        country: geoHeaders.country,
        region: geoHeaders.region,
        city: geoHeaders.city,
        timestamp: new Date().toISOString(),
      }), {
        headers: {
          "content-type": "application/json",
          "Cache-Control": "no-store, max-age=0"
        }
      });
    }
    
    return fetch(request)
   }