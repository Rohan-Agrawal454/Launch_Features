export default function handler(request) {
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

    // Handle locale-test route and api/locale-params API calls
    if (route === '/locale-test' || route === '/api/locale-params') {
      // Get visitor's country from Cloudflare headers
      const country = request.headers.get('visitor-ip-country') || 'US';
      
      // Map country to locale
      const getLocaleFromCountry = (countryCode) => {
        const countryToLocale = {
          'IN': 'hindi',
          'US': 'eng',
          'GB': 'eng',
          'CA': 'eng',
          'AU': 'eng',
          // Add more mappings as needed
        };
        return countryToLocale[countryCode] || 'eng'; // Default to English
      };

      const locale = getLocaleFromCountry(country);
      
      // Create a new URL with the locale parameter added
      const newUrl = new URL(request.url);
      
      // Only add locale parameter if it's not already present
      if (!newUrl.searchParams.has('locale')) {
        newUrl.searchParams.set('locale', locale);
      }
      
      // Add country info as well for debugging
      if (!newUrl.searchParams.has('country')) {
        newUrl.searchParams.set('country', country);
      }

      // Create a new request with the modified URL
      const modifiedRequest = new Request(newUrl.toString(), {
        method: request.method,
        headers: request.headers,
        body: request.body,
      });

      // For API calls, we want to continue to the actual API
      if (route === '/api/locale-params') {
        return fetch(modifiedRequest);
      }
      
      // For the page route, continue to Next.js with the modified request
      return fetch(modifiedRequest);
    }
    
    return fetch(request)
}


/* Alow IP Addresses */

  //  export default async function handler(request) {
  //   // Define your whitelisted IPs
  //   const allowedIPs = [
  //     "127.0.0.1",        
  //     "::1",            
  //     "192.168.1.100",    
  //     "10.0.0.50",        
  //     "172.16.0.10"     
  //   ]; 
  
  //   // Get the client's IP address (as sent by the platform)
  //   const clientIP = request.headers.get("x-forwarded-for") || "";
  //   const clientIPList = clientIP.split(",").map(ip => ip.trim()); 
  
  
  //   // Check if any forwarded IP is in the allowed list
  //   const allowed = clientIPList.some(ip => allowedIPs.includes(ip));
  //   console.log("Access allowed:", allowed);
  
  //   if (!allowed) {
  //     console.log("Access denied - IP not in whitelist");
  //     return new Response("Forbidden. Your IP is not in the whitelist.", { status: 403 });
  //   }
  
  //   // Continue with normal logic if IP is allowed
  //   // ... your normal edge function logic here ...
  //   return fetch(request);
  // }


  