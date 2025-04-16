
# SwitchTransact Client Viewer (Read-Only)

A secure, read-only web application for viewing SwitchTransact client details.

## System Requirements

- Python 3.x
- pip (Python package manager)

## Setup Instructions

1. **Clone this repository**

2. **Set up the environment variable**:

   Create a `.env` file in the project root directory with the following content:
   ```
   SWITCHTRANSACT_API_KEY=e68066d75428a2a405798eef139cc89749c75cda5445d7ac92dbb9e9383bd76b
   ```

   Alternatively, set the environment variable in your shell:
   ```bash
   export SWITCHTRANSACT_API_KEY=e68066d75428a2a405798eef139cc89749c75cda5445d7ac92dbb9e9383bd76b
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

## Running the Application

### Development Mode

```bash
python app.py
```

The application will be available at http://127.0.0.1:5000

### Production Mode (with Gunicorn)

```bash
gunicorn -w 4 -b 0.0.0.0:8000 app:app
```

The application will be available at http://your-server-ip:8000

## Troubleshooting

If you encounter any issues:

1. Check the application logs for error messages:
   - API connection problems will show detailed information about what failed
   - Input validation errors will be logged

2. Verify that the `SWITCHTRANSACT_API_KEY` environment variable is correctly set.

3. Check network connectivity to the SwitchTransact API server.

## Security Notes

- This application is read-only - it only fetches data and cannot modify any records
- No user authentication is implemented - the application itself does not manage user sessions
- No database is used - all operations are stateless between requests
- The application only calls a single endpoint: `/workflow/people/details`

## API Status Indicator

The application includes a visual API status indicator:
- Green: API is responding normally
- Red: API error occurred
- Gray: API status unknown (not yet checked)

Hover over the indicator to see the detailed status message.
