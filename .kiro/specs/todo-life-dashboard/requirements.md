# Requirements Document

## Introduction

The To-Do List Life Dashboard is a client-side web application that serves as a personal productivity hub. It combines a live greeting with the current time and date, a Pomodoro-style focus timer, a persistent to-do list, and a quick-access links panel — all in a single, minimal HTML/CSS/Vanilla JavaScript page. All data is stored in the browser's Local Storage; no backend server is required. The application must run in modern browsers (Chrome, Firefox, Edge, Safari) and may be used as a standalone web page or as a browser extension.

---

## Glossary

- **Dashboard**: The single-page web application described in this document.
- **Greeting_Panel**: The UI section that displays the current time, date, and a time-of-day greeting message.
- **Focus_Timer**: The UI section that implements a 25-minute countdown timer with start, stop, and reset controls.
- **Task_Manager**: The UI section that manages the to-do list, including adding, editing, completing, and deleting tasks.
- **Quick_Links_Panel**: The UI section that displays user-defined shortcut buttons that open external URLs.
- **Task**: A single to-do item consisting of a text description and a completion state.
- **Quick_Link**: A user-defined record consisting of a label and a URL.
- **Local_Storage**: The browser's `localStorage` API used for all client-side data persistence.
- **Modern_Browser**: Chrome, Firefox, Edge, or Safari at their current stable release at time of deployment.

---

## Requirements

### Requirement 1: Live Greeting and Clock

**User Story:** As a user, I want to see the current time, date, and a contextual greeting when I open the Dashboard, so that I am immediately oriented and welcomed.

#### Acceptance Criteria

1. THE Greeting_Panel SHALL display the current time in HH:MM format, updated every minute.
2. THE Greeting_Panel SHALL display the current date in a human-readable format (e.g., "Monday, 14 July 2025").
3. WHEN the local hour is between 05:00 and 11:59, THE Greeting_Panel SHALL display the greeting "Good morning".
4. WHEN the local hour is between 12:00 and 17:59, THE Greeting_Panel SHALL display the greeting "Good afternoon".
5. WHEN the local hour is between 18:00 and 20:59, THE Greeting_Panel SHALL display the greeting "Good evening".
6. WHEN the local hour is between 21:00 and 04:59, THE Greeting_Panel SHALL display the greeting "Good night".

---

### Requirement 2: Focus Timer

**User Story:** As a user, I want a 25-minute countdown timer with start, stop, and reset controls, so that I can manage focused work sessions.

#### Acceptance Criteria

1. THE Focus_Timer SHALL initialise with a countdown value of 25 minutes and 00 seconds (25:00).
2. WHEN the user activates the start control, THE Focus_Timer SHALL begin counting down one second per real-world second.
3. WHILE the Focus_Timer is counting down, THE Focus_Timer SHALL update the displayed time every second.
4. WHEN the user activates the stop control, THE Focus_Timer SHALL pause the countdown and retain the current remaining time.
5. WHEN the user activates the reset control, THE Focus_Timer SHALL stop any active countdown and restore the displayed time to 25:00.
6. WHEN the countdown reaches 00:00, THE Focus_Timer SHALL stop automatically and display 00:00.
7. THE Focus_Timer SHALL display the remaining time in MM:SS format at all times.

---

### Requirement 3: To-Do List — Add and Display Tasks

**User Story:** As a user, I want to add tasks to a list and see them displayed, so that I can track what I need to do.

#### Acceptance Criteria

1. THE Task_Manager SHALL provide a text input field and an add control for creating new tasks.
2. WHEN the user submits a non-empty task description via the add control, THE Task_Manager SHALL append the new Task to the task list with a completion state of incomplete.
3. IF the user submits an empty or whitespace-only task description, THEN THE Task_Manager SHALL reject the submission and leave the task list unchanged.
4. THE Task_Manager SHALL display all Tasks in the order they were added.

---

### Requirement 4: To-Do List — Edit Tasks

**User Story:** As a user, I want to edit the text of an existing task, so that I can correct or update it without deleting and re-adding it.

#### Acceptance Criteria

1. THE Task_Manager SHALL provide an edit control for each Task in the list.
2. WHEN the user activates the edit control for a Task, THE Task_Manager SHALL replace the task's display text with an editable text field pre-populated with the current task description.
3. WHEN the user confirms the edit with a non-empty value, THE Task_Manager SHALL update the Task's description to the new value and return to display mode.
4. IF the user confirms the edit with an empty or whitespace-only value, THEN THE Task_Manager SHALL reject the update and retain the original task description.
5. WHEN the user cancels the edit, THE Task_Manager SHALL discard the changes and return to display mode without modifying the Task.

---

### Requirement 5: To-Do List — Complete and Delete Tasks

**User Story:** As a user, I want to mark tasks as done and delete tasks I no longer need, so that I can keep my list current.

#### Acceptance Criteria

1. THE Task_Manager SHALL provide a completion toggle control for each Task.
2. WHEN the user activates the completion toggle for an incomplete Task, THE Task_Manager SHALL mark the Task as complete and apply a visual distinction (e.g., strikethrough) to its description.
3. WHEN the user activates the completion toggle for a complete Task, THE Task_Manager SHALL mark the Task as incomplete and remove the visual distinction.
4. THE Task_Manager SHALL provide a delete control for each Task.
5. WHEN the user activates the delete control for a Task, THE Task_Manager SHALL permanently remove that Task from the list.

---

### Requirement 6: To-Do List — Persistence

**User Story:** As a user, I want my tasks to be saved automatically, so that they are still present when I reload or reopen the Dashboard.

#### Acceptance Criteria

1. WHEN any Task is added, edited, completed, or deleted, THE Task_Manager SHALL write the current task list to Local_Storage.
2. WHEN the Dashboard loads, THE Task_Manager SHALL read the task list from Local_Storage and render all previously saved Tasks.
3. IF no task data exists in Local_Storage, THEN THE Task_Manager SHALL render an empty task list.

---

### Requirement 7: Quick Links — Add and Display

**User Story:** As a user, I want to add shortcut buttons for my favourite websites, so that I can open them with a single click from the Dashboard.

#### Acceptance Criteria

1. THE Quick_Links_Panel SHALL provide input fields for a label and a URL, and an add control for creating new Quick_Links.
2. WHEN the user submits a Quick_Link with a non-empty label and a non-empty URL, THE Quick_Links_Panel SHALL add a new button to the panel displaying the label.
3. IF the user submits a Quick_Link with an empty label or an empty URL, THEN THE Quick_Links_Panel SHALL reject the submission and leave the panel unchanged.
4. WHEN the user activates a Quick_Link button, THE Quick_Links_Panel SHALL open the associated URL in a new browser tab.

---

### Requirement 8: Quick Links — Persistence

**User Story:** As a user, I want my quick links to be saved automatically, so that they are still present when I reload or reopen the Dashboard.

#### Acceptance Criteria

1. WHEN a Quick_Link is added or deleted, THE Quick_Links_Panel SHALL write the current Quick_Link list to Local_Storage.
2. WHEN the Dashboard loads, THE Quick_Links_Panel SHALL read the Quick_Link list from Local_Storage and render all previously saved Quick_Links.
3. IF no Quick_Link data exists in Local_Storage, THEN THE Quick_Links_Panel SHALL render an empty Quick_Links panel.

---

### Requirement 9: Quick Links — Delete

**User Story:** As a user, I want to remove quick links I no longer need, so that the panel stays relevant.

#### Acceptance Criteria

1. THE Quick_Links_Panel SHALL provide a delete control for each Quick_Link button.
2. WHEN the user activates the delete control for a Quick_Link, THE Quick_Links_Panel SHALL permanently remove that Quick_Link from the panel.

---

### Requirement 10: Layout and Visual Design

**User Story:** As a user, I want a clean, readable, and visually organised interface, so that I can use the Dashboard comfortably without distraction.

#### Acceptance Criteria

1. THE Dashboard SHALL present all four panels (Greeting_Panel, Focus_Timer, Task_Manager, Quick_Links_Panel) within a single HTML page without requiring navigation between pages.
2. THE Dashboard SHALL apply a clear visual hierarchy so that each panel is visually distinct from the others.
3. THE Dashboard SHALL use readable typography with sufficient contrast between text and background.
4. THE Dashboard SHALL load and render completely within 2 seconds on a standard broadband connection.
5. WHEN the user interacts with any control (button, input, toggle), THE Dashboard SHALL reflect the change in the UI within 100 milliseconds.

---

### Requirement 11: Code Structure

**User Story:** As a developer, I want the codebase to follow a strict single-file-per-type structure, so that the project remains simple and maintainable.

#### Acceptance Criteria

1. THE Dashboard SHALL be implemented using exactly one HTML file, exactly one CSS file located in a `css/` directory, and exactly one JavaScript file located in a `js/` directory.
2. THE Dashboard SHALL use only HTML, CSS, and Vanilla JavaScript — no third-party frameworks, libraries, or build tools.
3. THE Dashboard SHALL require no backend server; all functionality SHALL operate entirely within the browser.
4. THE Dashboard SHALL function correctly in Modern_Browser environments without requiring installation of additional software.
