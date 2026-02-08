# Recurso - The Task Manager

Simply an app for managing tasks.

A task can have any number of subtasks, in an endless recursive pattern:

The relationship between tasks and their subtasks is visualized using font size. Tasks on the lowest level in the tree have a base font size of 16px. Each level above then increases its font size by 4px. This shows clearly which parent task (if any) a task belongs to.
It also means adding a new task at a lower level will increase the font size of items at a higher level.

Clicking a task marks it as completed by adding a strikethrough effect (or reverting it if already completed).

The app's core functionality is the action buttons:

![Action buttons screenshot](docs/images/action-buttons.png)

These appear on the right when hovering over a task and support the following functionality:

* **Drag and Drop**: tasks belonging to the same parent task (or top-level tasks). Any sub-tasks are included in this move.

* **Edit**: the text of a task.
* **Add Sibling Task**: A new task belonging to the same parent is added below the current task.
* **Add Sub Task**: A new sub-task is added to the current task.
* **Delete** the current task, including any sub-tasks.