import sys
import os

backend_path = os.path.join(os.path.dirname(__file__), '..', 'JobNexAI', 'backend')
sys.path.insert(0, os.path.abspath(backend_path))

os.chdir(backend_path)

from app import app

handler = app
