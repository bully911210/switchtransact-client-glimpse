# CORS Solutions for SwitchTransact Client Portal

This document outlines several approaches to handle CORS (Cross-Origin Resource Sharing) restrictions when accessing the SwitchTransact API from a web browser.

## The CORS Problem

CORS is a security feature implemented by web browsers that restricts web pages from making requests to a different domain than the one that served the web page. The SwitchTransact API doesn't include the necessary CORS headers to allow direct access from a browser on a different domain (like GitHub Pages).

## Solution 1: Local Proxy Server

The most reliable solution is to use a local proxy server that forwards requests to the SwitchTransact API.

### Setup:

1. Install Node.js dependencies:
   ```
   npm install express cors axios
   ```

2. Start the proxy server:
   ```
   node proxy-server.js
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

### Files:
- `proxy-server.js` - The Node.js proxy server
- `local-proxy-client.html` - The client application that works with the local proxy

## Solution 2: Netlify Proxy

Netlify provides a way to proxy API requests through its serverless functions and redirects.

### Setup:

1. Deploy your site to Netlify
2. The `netlify.toml` file will automatically configure the proxy

### Files:
- `netlify.toml` - Configuration for Netlify redirects
- `netlify-client.html` - The client application that works with Netlify's proxy

## Solution 3: Public CORS Proxy Services

Several public CORS proxy services can be used to bypass CORS restrictions.

### Option A: CORS Anywhere

```
https://cors-anywhere.herokuapp.com/
```

### Option B: ThingProxy

```
https://thingproxy.freeboard.io/fetch/
```

### Files:
- `cors-proxy-client.html` - Uses CORS Anywhere
- `thingproxy-client.html` - Uses ThingProxy

## Recommended Approach

For production use, we recommend:

1. **Netlify Proxy** - For hosted applications
2. **Local Proxy Server** - For development and testing

Public CORS proxies should only be used for testing as they may have rate limits or be unreliable.

## Usage Notes

- All solutions maintain the same client interface and functionality
- The API key is still required and sent with each request
- The proxy simply forwards the request and response without modifying them
- These solutions comply with CORS policies while still allowing access to the API

## Example ID for Testing

Use ID number `7608210157080` for testing the client portal.
