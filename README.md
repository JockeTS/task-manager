# Recursive Task Manager

A minimalist task management application inspired by text-based editors such as TextEdit and Notepad++, where tasks are represented as plain text and organized in a hierarchical tree structure.

## Concept

The goal of this project is to explore a text-first approach to task management.

Each task is represented as a simple text item that can contain child tasks, allowing users to build arbitrary task hierarchies.

Tasks can be freely moved between parent items, enabling flexible reorganization without rigid categories or predefined workflows.

## Technical Approach

Tasks are modeled as a tree structure, where each task may have zero or more child tasks.

All core operations — such as creating, deleting, moving, and updating tasks — are implemented using recursive algorithms to traverse and modify the task tree.

This approach keeps the logic consistent and avoids special-casing for deeply nested structures.

## Architecture

- Backend: Node.js with Express, exposing a REST API for managing task data
- Frontend: React application for interacting with and visualizing the task hierarchy
- Data model designed around hierarchical relationships rather than flat lists

## Current Status

This project is currently under active development.

At this stage, the focus is on:
- Core data modeling
- Correct handling of recursive operations
- API design and consistency

UI polish, persistence strategies, and deployment will be addressed in later iterations.

## Setup / How to Run

### Server
```
cd /backend
npm install
node app.js
```

### Client
```
cd /frontend
npm install
npm start
```
