import sys
import os

root = os.path.join(os.path.dirname(__file__), '..')
sys.path.insert(0, root)
sys.path.insert(0, os.path.join(root, 'backend'))

from app import create_app
app = create_app()
