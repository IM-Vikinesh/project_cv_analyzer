import sys
sys.path.insert(0, '.')

from utils.firebase_config import init_firebase
db, _ = init_firebase()

print("Checking blogs in Firestore...\n")
blogs = list(db.collection('blogs').limit(5).stream())
for doc in blogs:
    data = doc.to_dict()
    print(f"ID: {doc.id}")
    print(f"Title: {data.get('title')}")
    print(f"Image URL: {data.get('image_url')}")
    print(f"Status: {data.get('status')}")
    print("---")
