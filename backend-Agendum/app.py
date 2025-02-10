from flask import Flask, request, jsonify
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from pymongo import MongoClient
from bson.objectid import ObjectId
import bcrypt
import secrets
import os

app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', secrets.token_hex(32))  # Secure key generation
jwt = JWTManager(app)

# Connect to MongoDB
client = MongoClient("mongodb://localhost:27017/")  # Change if using cloud MongoDB
db = client['agendum_db']  # Database name
users_collection = db['users']
tasks_collection = db['tasks']
workspaces_collection = db['workspaces']

@app.route('/register', methods=['POST'])
def register():
    data = request.json
    if users_collection.find_one({'email': data['email']}):
        return jsonify({'message': 'User already exists'}), 400
    
    hashed_password = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt())
    user = {'email': data['email'], 'password': hashed_password, 'name': data.get('name', '')}
    users_collection.insert_one(user)
    return jsonify({'message': 'User registered successfully'}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    user = users_collection.find_one({'email': data['email']})
    if user and bcrypt.checkpw(data['password'].encode('utf-8'), user['password']):
        token = create_access_token(identity=str(user['_id']))
        return jsonify({'token': token})
    return jsonify({'message': 'Invalid credentials'}), 401

@app.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    return jsonify({'message': 'Logged out successfully'}), 200

@app.route('/tasks', methods=['POST'])
@jwt_required()
def create_task():
    data = request.json
    task = {'title': data['title'], 'description': data.get('description'), 'tags': data.get('tags'), 'date': data.get('date')}
    result = tasks_collection.insert_one(task)
    return jsonify({'task_id': str(result.inserted_id)}), 201

@app.route('/tasks', methods=['GET'])
@jwt_required()
def get_tasks():
    tasks = list(tasks_collection.find())
    for task in tasks:
        task['_id'] = str(task['_id'])
    return jsonify({'tasks': tasks}), 200

@app.route('/tasks/<task_id>', methods=['PUT'])
@jwt_required()
def update_task(task_id):
    data = request.json
    result = tasks_collection.update_one({'_id': ObjectId(task_id)}, {'$set': data})
    if result.modified_count:
        return jsonify({'message': 'Task updated'}), 200
    return jsonify({'message': 'Task not found'}), 404

@app.route('/tasks/<task_id>', methods=['DELETE'])
@jwt_required()
def delete_task(task_id):
    result = tasks_collection.delete_one({'_id': ObjectId(task_id)})
    if result.deleted_count:
        return jsonify({'message': 'Task deleted'}), 200
    return jsonify({'message': 'Task not found'}), 404

@app.route('/workspaces', methods=['POST'])
@jwt_required()
def create_workspace():
    data = request.json
    workspace = {'name': data['name']}
    result = workspaces_collection.insert_one(workspace)
    return jsonify({'workspace_id': str(result.inserted_id)}), 201

@app.route('/workspaces', methods=['GET'])
@jwt_required()
def get_workspaces():
    workspaces = list(workspaces_collection.find())
    for workspace in workspaces:
        workspace['_id'] = str(workspace['_id'])
    return jsonify({'workspaces': workspaces}), 200

@app.route('/workspaces/<workspace_id>', methods=['PUT'])
@jwt_required()
def update_workspace(workspace_id):
    data = request.json
    result = workspaces_collection.update_one({'_id': ObjectId(workspace_id)}, {'$set': data})
    if result.modified_count:
        return jsonify({'message': 'Workspace updated'}), 200
    return jsonify({'message': 'Workspace not found'}), 404

@app.route('/workspaces/<workspace_id>', methods=['DELETE'])
@jwt_required()
def delete_workspace(workspace_id):
    result = workspaces_collection.delete_one({'_id': ObjectId(workspace_id)})
    if result.deleted_count:
        return jsonify({'message': 'Workspace deleted'}), 200
    return jsonify({'message': 'Workspace not found'}), 404

if __name__ == '__main__':
    print("Starting Flask server...")
    app.run(debug=True)
