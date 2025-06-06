# Pomodoro Timer App

## Purpose

Help users stay focused using the Pomodoro Technique: 25-minute work sessions with short and long breaks.

## Core Features

### 1. Timer
- 25-minute work timer  
- 5-minute short break  
- 15-minute long break  

Automatically switch between sessions and rollover to the next timer in the sequence (after a 3s delay) (optional)

### 2. Cycle Logic
- After 4 work sessions → long break  
- Then cycle restarts

### 3. Controls
- Start, Pause, Reset

### 4. Notifications
- Alert when timer ends

### 5. Settings
- Edit the durations of each mode
- Enable/disable auto-start

## Implementation plan

### High level

- Use tailwind and shadcn/ui
- Create a underlying timer abstraction thats super simple and reusable
- Keep the auto rollover lightweight so that it's flexible

## To-Do Items

### Phase 1: Core Foundation
- [x] Create basic UI layout with timer display

### Phase 2: Timer Functionality
- [x] Implement countdown timer logic
- [x] Add start/pause/reset controls
- [x] Create timer state management (work/short break/long break)
- [x] Implement cycle logic (4 work sessions → long break)
- [x] Add timer completion notifications

### Phase 3: Auto-Rollover & Settings
- [x] Implement 3-second delay between sessions
- [x] Add auto-start toggle functionality
- [x] Create settings panel for duration customization
- [x] Persist settings in localStorage
- [x] Add visual feedback for session transitions

### Phase 4: Polish & UX
- [ ] Add progress indicators for current cycle
- [ ] Implement visual/audio notifications
- [ ] Add keyboard shortcuts (spacebar for start/pause)
- [ ] Create responsive design for mobile
- [ ] Add session history/statistics (optional)

### Phase 5: Testing & Deployment
- [ ] Write unit tests for timer logic
- [ ] Test notification permissions and functionality
- [ ] Deploy to Vercel or similar platform
- [ ] Add PWA capabilities for mobile use
