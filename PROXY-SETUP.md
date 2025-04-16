# SwitchTransact Client Portal - Proxy Setup

This guide explains how to set up and use the proxy server for accessing the SwitchTransact API.

## Why a Proxy Server?

The SwitchTransact API has CORS restrictions that prevent direct access from a web browser when hosted on a different domain (like GitHub Pages). The proxy server acts as an intermediary, forwarding requests from your browser to the API and returning the responses.

## Installation

1. Install the required dependencies:
   ```
   npm install
   ```

2. Start the proxy server:
   ```
   npm run proxy
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## How It Works

1. The proxy server runs on your local machine and serves the `proxy-client.html` file
2. When you make a request in the browser, it's sent to the proxy server
3. The proxy server forwards the request to the SwitchTransact API
4. The API response is returned to the proxy server
5. The proxy server sends the response back to your browser

## Troubleshooting

If you encounter issues:

1. Make sure the proxy server is running (you should see "Server running at http://localhost:3000" in the console)
2. Check that the API key is correct in the proxy-client.html file
3. Ensure you have internet connectivity
4. Check the browser console and server console for detailed error messages

## Security Note

The proxy server is intended for local development and testing only. It includes the API key in the client-side code, which is not secure for production use. For a production environment, you should implement proper authentication and keep the API key on the server side only.
