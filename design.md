# FocusFlow Productivity App - Design Document

## Overview

FocusFlow is a personal productivity mobile app that combines task management, time planning, and goal tracking into a cohesive, easy-to-use interface. The app is designed for iOS and Android with a focus on one-handed usage and portrait orientation (9:16 aspect ratio).

---

## Screen List

| Screen | Purpose | Primary Content |
|--------|---------|-----------------|
| **Home (Dashboard)** | Daily overview and quick actions | Today's tasks, upcoming events, goal progress |
| **Tasks** | Comprehensive task management | Task list with filters, priority, due dates |
| **Add/Edit Task** | Create or modify tasks | Task title, description, priority, due date, category |
| **Calendar** | Time planning and scheduling | Month/week view, scheduled events, time blocks |
| **Goals** | Long-term goal tracking | Active goals, progress tracking, milestones |
| **Goal Detail** | View and track individual goal | Goal description, progress bar, associated tasks |
| **Settings** | App configuration | Theme, notifications, data management |

---

## Primary Content and Functionality

### Home (Dashboard)
- **Today's Tasks Section**: Displays tasks due today with quick-complete buttons
- **Next 3 Days Preview**: Shows upcoming tasks and deadlines
- **Goal Progress Widget**: Visual representation of active goal progress (circular progress indicators)
- **Quick Action Buttons**: Add new task, schedule event, create goal
- **Motivational Streak Counter**: Shows consecutive days of task completion
- **Time Spent Today**: Summary of time allocated to tasks

### Tasks Screen
- **Task List**: Scrollable list of all tasks with visual indicators
- **Filter Options**: By priority, due date, category, completion status
- **Task Card Elements**: Title, due date, priority badge, category tag, completion checkbox
- **Swipe Actions**: Quick complete, delete, or edit
- **Search Bar**: Find tasks by keyword
- **Add Task Button**: Floating action button for quick task creation

### Add/Edit Task Screen
- **Task Title Input**: Required field with character count
- **Description Field**: Optional multiline text for task details
- **Priority Selector**: High, Medium, Low with color coding
- **Due Date Picker**: Calendar-based date selection
- **Time Picker**: Optional time for task deadline
- **Category Selector**: Predefined categories (Work, Personal, Health, Finance, etc.)
- **Repeat Options**: None, Daily, Weekly, Monthly
- **Save/Cancel Buttons**: Bottom action buttons

### Calendar Screen
- **Month View Toggle**: Switch between month and week view
- **Event Blocks**: Visual time blocks for scheduled tasks
- **Day Detail Tap**: Tap a day to see all tasks for that day
- **Time Grid**: Hour-by-hour view for time planning
- **Add Event Button**: Create new time-blocked task
- **Navigation**: Previous/next month or week

### Goals Screen
- **Active Goals List**: Cards showing current goals
- **Goal Card Elements**: Title, progress bar, deadline, category
- **Goal Stats**: Total goals, completed this month, on track
- **Add Goal Button**: Create new long-term goal
- **Filter by Status**: Active, Completed, On Hold

### Goal Detail Screen
- **Goal Title and Description**: Full goal information
- **Progress Indicator**: Large circular progress bar with percentage
- **Milestone Checklist**: Subtasks or milestones toward the goal
- **Associated Tasks**: Tasks linked to this goal
- **Timeline**: Visual representation of goal deadline
- **Edit/Delete Options**: Modify or remove goal

### Settings Screen
- **Theme Toggle**: Light/Dark mode switch
- **Notification Settings**: Enable/disable notifications, set quiet hours
- **Data Management**: Export data, clear completed tasks
- **About**: App version and information

---

## Key User Flows

### Flow 1: Create and Complete a Task
1. User taps "Add Task" button on Home or Tasks screen
2. Add/Edit Task screen opens
3. User enters task title, selects priority, sets due date
4. User taps "Save"
5. Task appears in task list and on calendar if time-blocked
6. User returns to Home and sees task in "Today's Tasks"
7. User taps checkbox to mark task complete
8. Task moves to completed section, streak counter updates

### Flow 2: Plan Weekly Schedule
1. User navigates to Calendar screen
2. User switches to week view
3. User taps on a time slot to create a time-blocked task
4. Add/Edit Task screen opens with time pre-filled
5. User enters task details and saves
6. Time block appears on calendar
7. User can drag time blocks to reschedule (future enhancement)

### Flow 3: Set and Track a Goal
1. User taps "Add Goal" on Goals screen
2. Goal creation modal opens
3. User enters goal title, description, deadline, and category
4. User saves goal
5. Goal appears on Goals screen with 0% progress
6. User creates tasks and links them to the goal
7. As tasks are completed, goal progress updates automatically
8. User can view Goal Detail to see progress and milestones

### Flow 4: Daily Review
1. User opens app in morning
2. Home screen shows today's tasks and upcoming deadlines
3. User reviews goal progress for the day
4. User completes tasks throughout the day
5. Streak counter increments with each completed task
6. Evening: User can review completed tasks and plan next day

---

## Color Choices

| Element | Color | Usage |
|---------|-------|-------|
| **Primary Brand** | #0A7EA4 (Teal) | Buttons, highlights, active states |
| **Background** | #FFFFFF (Light) / #151718 (Dark) | Screen background |
| **Surface** | #F5F5F5 (Light) / #1E2022 (Dark) | Cards, containers |
| **Text Primary** | #11181C (Light) / #ECEDEE (Dark) | Main text |
| **Text Secondary** | #687076 (Light) / #9BA1A6 (Dark) | Secondary text, labels |
| **Priority High** | #EF4444 (Red) | High priority tasks |
| **Priority Medium** | #F59E0B (Amber) | Medium priority tasks |
| **Priority Low** | #22C55E (Green) | Low priority tasks |
| **Success** | #22C55E (Green) | Completion, success states |
| **Border** | #E5E7EB (Light) / #334155 (Dark) | Dividers, borders |

---

## Navigation Structure

The app uses a tab-based navigation with the following tabs:

1. **Home** (Dashboard icon) - Daily overview
2. **Tasks** (Checklist icon) - Task management
3. **Calendar** (Calendar icon) - Time planning
4. **Goals** (Target icon) - Goal tracking
5. **Settings** (Gear icon) - Configuration

Modal screens (Add/Edit Task, Goal Detail, etc.) overlay the tab navigation and can be dismissed to return to the previous screen.

---

## Data Models

### Task
```
{
  id: string (UUID)
  title: string
  description?: string
  priority: "high" | "medium" | "low"
  dueDate: Date
  dueTime?: Time
  category: string
  completed: boolean
  completedAt?: Date
  repeat: "none" | "daily" | "weekly" | "monthly"
  goalId?: string (reference to Goal)
  createdAt: Date
  updatedAt: Date
}
```

### Goal
```
{
  id: string (UUID)
  title: string
  description: string
  category: string
  deadline: Date
  status: "active" | "completed" | "on_hold"
  progress: number (0-100, calculated from associated tasks)
  milestones: Milestone[]
  createdAt: Date
  updatedAt: Date
}
```

### Milestone
```
{
  id: string (UUID)
  goalId: string
  title: string
  completed: boolean
  completedAt?: Date
}
```

---

## Design Principles

1. **Simplicity**: Minimize cognitive load with clear, intuitive interfaces
2. **Consistency**: Follow iOS Human Interface Guidelines for familiar interactions
3. **Feedback**: Provide immediate visual feedback for all user actions
4. **Accessibility**: Ensure sufficient contrast, readable fonts, and accessible touch targets
5. **Performance**: Keep animations subtle and responsive
6. **One-Handed Usage**: Place primary actions in the lower half of the screen
7. **Dark Mode Support**: All colors adapt seamlessly to light and dark themes

---

## Implementation Notes

- Use React Native with Expo for cross-platform development
- Store data locally using AsyncStorage for offline-first experience
- Implement date/time pickers using native components
- Use Tailwind CSS (NativeWind) for consistent styling
- Implement smooth transitions between screens using Expo Router
- Add haptic feedback for key interactions (task completion, goal achievement)
- Support both portrait and landscape orientations (future enhancement)
