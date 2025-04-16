
#!/usr/bin/env python3
from app import app

if __name__ == '__main__':
    print("Starting SwitchTransact Client Viewer in development mode...")
    print("Open http://127.0.0.1:5000 in your web browser")
    app.run(debug=True, host='0.0.0.0')
