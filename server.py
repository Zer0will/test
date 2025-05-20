#!/usr/bin/env python3
"""
Simple HTTP Server for Plate of Africa Website

This script starts a simple HTTP server to serve the Plate of Africa website.
Run this script from the root directory of the project.
"""

import http.server
import socketserver
import os

# Define the port to run the server on
PORT = 8080

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    """Custom request handler to manage directory listing and default files"""
    
    def do_GET(self):
        # If path is '/', serve index.html
        if self.path == '/':
            self.path = '/index.html'
        return http.server.SimpleHTTPRequestHandler.do_GET(self)

def run_server(port=PORT):
    """Run the HTTP server on the specified port"""
    # Change to the current script's directory
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    handler = CustomHTTPRequestHandler
    
    # Create the server
    with socketserver.TCPServer(("", port), handler) as httpd:
        print(f"Serving at port {port}")
        print(f"Open your browser and go to: http://localhost:{port}")
        print("Press Ctrl+C to stop the server")
        
        # Start the server
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped by user")
            httpd.server_close()

if __name__ == "__main__":
    run_server()