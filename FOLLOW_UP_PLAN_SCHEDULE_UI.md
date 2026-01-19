# Follow-Up Plan: Schedule Management UI & Testing

## Overview

This plan implements the UI components and testing strategy for the inventory availability scheduling system. The core backend functionality is complete, but creators need interfaces to:

1. Configure newsletter publication schedules
2. Set per-tier availability schedules
3. Preview upcoming available dates
4. Test the system end-to-end

## Phase 1: Newsletter Publication Schedule UI

### Component: `PublicationScheduleSection.tsx`

**Location**: `app/(creator)/dashboard/settings/PublicationScheduleSection.tsx`

**Purpose**: Add a new section to `NewsletterSettings.tsx` for managing publication schedules.

**Features**:

1. **Schedule Type Toggle**
   - Radio buttons or Toggle: `recurring` vs `one_off`
   - Default: `recurring`

2. **Recurring Pattern Configuration**
   - Pattern Type Dropdown:
     - `weekly` - Weekly on specific days
     - `biweekly` - Every other week
     - `monthly_date` - Specific day of month (e.g., 15th)
     - `monthly_day` - Nth occurrence of day-of-week (e.g., 2nd Tuesday)
     - `custom` - Custom day-of-week combination
   
   - Day-of-Week Selector (Multi-Select Checkboxes):
     - Sunday (0), Monday (1), Tuesday (2), Wednesday (3), Thursday (4), Friday (5), Saturday (6)
     - Only shown for: `weekly`, `biweekly`, `monthly_day`, `custom`
   
   - Day of Month Input (Number 1-31):
     - Only shown for: `monthly_date`
   
   - Monthly Week Number (Dropdown 1-5):
     - Only shown for: `monthly_day`
     - Labels: "1st", "2nd", "3rd", "4th", "5th"
   
   - Date Range Picker:
     - Start Date (required)
     - End Date (optional, null = indefinite)
     - Use PrimeReact Calendar component

3. **One-Off Dates Configuration**
   - Multi-Select Date Picker
   - Show list of selected dates with remove buttons
   - Allow adding multiple specific dates
   - Only shown when `schedule_type === 'one_off'`

4. **Visual Preview**
   - Show next 10-15 upcoming publication dates based on current configuration
   - Update in real-time as user changes settings
   - Display in a clean list or calendar view
   - Use `getNewsletterSchedule()` and date pattern matching to generate preview

5. **Save/Cancel Actions**
   - Save button calls `updateNewsletterSchedule()`
   - Show loading state
   - Toast notifications for success/error

**UI Structure**:

```typescript
interface PublicationScheduleSectionProps {
  newsletterId: string;
  initialSchedule?: PublicationSchedule | null;
}

// Component structure:
// - Section header: "Publication Schedule"
// - Toggle: Recurring / One-Off
// - Conditional fields based on schedule type
// - Preview section (always visible)
// - Save button
```

**Integration**:

- Add to `NewsletterSettings.tsx` as a new section below the General Configuration
- Fetch initial schedule using `getNewsletterSchedule(newsletterId)` on mount
- Use existing `settings.module.css` for styling consistency

**Dependencies**:

- `app/actions/inventory.ts` - `updateNewsletterSchedule()`, `getNewsletterSchedule()`
- `app/utils/date-patterns.ts` - Pattern matching for preview
- PrimeReact components: `Calendar`, `Dropdown`, `Checkbox`, `Button`, `Toast`

---

## Phase 2: Tier Availability Schedule UI

### Component: `TierAvailabilitySection.tsx`

**Location**: `app/(creator)/dashboard/settings/TierAvailabilitySection.tsx`

**Purpose**: Add availability schedule configuration to `TierFormDialog.tsx` as a new AccordionTab.

**Features**:

1. **Schedule Type Selection**
   - Radio buttons: `all_dates`, `recurring`, `one_off`
   - Default: `all_dates` (inherit from newsletter schedule)
   - Option: "Inherit from Newsletter Schedule" (checkbox) - if checked, use newsletter schedule

2. **Inherit from Newsletter**
   - Checkbox: "Use newsletter publication schedule"
   - When checked, hide all other fields
   - Show preview of newsletter schedule dates
   - Fetch newsletter schedule using `getNewsletterSchedule()`

3. **Custom Availability Configuration**
   - Same pattern type options as newsletter schedule
   - Additional field: `is_available` (boolean, default true)
   - Additional field: `capacity` (integer, default 1) - for future multi-booking support
   - Date range picker (start/end dates)
   - One-off dates picker

4. **Preview Section**
   - Show next 10-15 available dates for this tier
   - Use `getAvailableDates(tierId, startDate, endDate)` to generate preview
   - Display dates with status indicators (available/unavailable)
   - Update in real-time as configuration changes

5. **Save Integration**
   - Save availability schedule when tier is saved
   - Call `upsertTierAvailability(tierId, schedule)` after tier is created/updated
   - Handle errors gracefully

**UI Structure**:

```typescript
interface TierAvailabilitySectionProps {
  tierId?: string; // undefined for new tiers
  newsletterId: string;
  initialSchedule?: AvailabilitySchedule | null;
  onScheduleChange: (schedule: AvailabilitySchedule) => void;
}

// Component structure:
// - AccordionTab header: "Availability Schedule"
// - Inherit checkbox (if newsletter schedule exists)
// - Conditional fields based on schedule type
// - Preview section
```

**Integration**:

- Add as new `AccordionTab` in `TierFormDialog.tsx` (after "Ad Constraints")
- Fetch initial schedule using `getTierAvailability(tierId)` when editing existing tier
- Fetch newsletter schedule for "inherit" option
- Save schedule in `InventoryManager.handleSave()` after tier is saved

**Dependencies**:

- `app/actions/inventory.ts` - `upsertTierAvailability()`, `getTierAvailability()`, `getNewsletterSchedule()`
- `app/actions/bookings.ts` - `getAvailableDates()` for preview
- `app/utils/date-patterns.ts` - Pattern matching

---

## Phase 3: Shared Components & Utilities

### Component: `SchedulePatternSelector.tsx`

**Location**: `app/(creator)/dashboard/settings/SchedulePatternSelector.tsx`

**Purpose**: Reusable component for pattern type selection and related fields.

**Features**:

- Pattern type dropdown
- Conditional rendering of:
  - Day-of-week checkboxes
  - Day of month input
  - Monthly week number dropdown
- Validation helpers
- Type-safe props

### Component: `SchedulePreview.tsx`

**Location**: `app/(creator)/dashboard/settings/SchedulePreview.tsx`

**Purpose**: Reusable component for displaying upcoming dates preview.

**Features**:

- Accepts schedule configuration and date range
- Generates preview dates using pattern matching utilities
- Displays dates in clean list format
- Shows date status (available/unavailable/booked)
- Responsive design

### Utility: `schedule-helpers.ts`

**Location**: `app/utils/schedule-helpers.ts`

**Purpose**: Helper functions for schedule UI logic.

**Functions**:

- `generatePreviewDates(schedule, startDate, count)` - Generate N upcoming dates
- `validateSchedule(schedule)` - Validate schedule configuration
- `formatScheduleDescription(schedule)` - Human-readable description
- `getDayOfWeekLabel(dayNumber)` - "Monday", "Tuesday", etc.

---

## Phase 4: Testing Strategy

### Unit Tests

**File**: `app/utils/date-patterns.test.ts`

Test cases:

1. **UTC Date Functions**
   - `getCanonicalDate()` - Verify UTC interpretation
   - Test with various timezone offsets
   - Verify no off-by-one errors

2. **Pattern Matching**
   - `matchesWeekly()` - Test all days of week
   - `matchesBiweekly()` - Test 14-day intervals
   - `matchesMonthlyDate()` - Test day-of-month matching
   - `matchesMonthlyDay()` - Test nth occurrence logic
   - `matchesCustom()` - Test custom patterns

3. **Date Iteration**
   - `iterateDates()` - Verify correct date range iteration
   - Test edge cases (month boundaries, leap years)

**File**: `app/actions/bookings.test.ts` (if using test framework)

Test cases:

1. **getAvailableDates()**
   - Test strict intersection logic
   - Test union of one-off dates
   - Test booking subtraction
   - Test with no schedules (should return empty)
   - Test with all_dates tier schedule
   - Test with unavailable tier schedule

2. **getBookingsInRange()**
   - Test bounded query (verify only dates in range)
   - Test with empty range
   - Test with large range

### Integration Tests

**File**: `tests/integration/availability-scheduling.test.ts`

Test scenarios:

1. **End-to-End Booking Flow**
   - Create newsletter with publication schedule
   - Create tier with availability schedule
   - Verify dates show correct status in datepicker
   - Book an available date
   - Verify date becomes booked
   - Attempt to book same date (should fail)
   - Verify unavailable dates are disabled

2. **Schedule Configuration**
   - Create recurring weekly schedule
   - Verify preview shows correct dates
   - Switch to one-off dates
   - Verify preview updates
   - Save schedule
   - Reload page
   - Verify schedule persists

3. **Tier Inheritance**
   - Create newsletter schedule (weekly Mondays)
   - Create tier with "inherit" option
   - Verify tier shows Monday dates as available
   - Override with custom schedule
   - Verify custom schedule takes precedence

4. **Edge Cases**
   - Test with no newsletter schedule (all dates unavailable)
   - Test with no tier schedule (all dates unavailable)
   - Test with overlapping one-off dates
   - Test with date ranges (start/end dates)
   - Test with past dates (should not appear)

### Manual Testing Checklist

**Newsletter Schedule Configuration**:

- [ ] Create recurring weekly schedule (Mon/Wed/Fri)
- [ ] Verify preview shows correct dates
- [ ] Switch to bi-weekly, verify dates update
- [ ] Switch to monthly_date (15th), verify dates update
- [ ] Switch to monthly_day (2nd Tuesday), verify dates update
- [ ] Add one-off dates, verify they appear in preview
- [ ] Set end date, verify dates stop after end date
- [ ] Save schedule, reload page, verify persistence
- [ ] Edit schedule, verify changes save correctly

**Tier Availability Configuration**:

- [ ] Create tier with "inherit from newsletter" checked
- [ ] Verify preview matches newsletter schedule
- [ ] Uncheck inherit, set custom schedule
- [ ] Verify preview updates to custom schedule
- [ ] Set "all_dates" schedule type
- [ ] Verify all newsletter dates become available
- [ ] Set recurring pattern, verify intersection logic
- [ ] Add tier-specific one-off dates
- [ ] Save tier, verify schedule persists

**Datepicker Integration**:

- [ ] Select tier with availability schedule
- [ ] Verify available dates are highlighted
- [ ] Verify booked dates show strikethrough
- [ ] Verify unavailable dates are greyed out
- [ ] Hover over dates, verify tooltips show correct reason
- [ ] Select available date, verify booking succeeds
- [ ] Select booked date, verify booking fails
- [ ] Select unavailable date, verify date is disabled
- [ ] Test with multiple tiers (different schedules)

**Performance Testing**:

- [ ] Test with 3-month date range (should be fast)
- [ ] Test with large number of bookings (100+)
- [ ] Test with complex patterns (bi-weekly + one-offs)
- [ ] Verify no N+1 queries in availability calculation

---

## Phase 5: UI/UX Enhancements

### Visual Improvements

1. **Schedule Preview**
   - Use calendar widget for preview (mini calendar)
   - Color-code dates (green=available, red=booked, grey=unavailable)
   - Show date count summary ("15 dates in next 3 months")

2. **Form Validation**
   - Real-time validation feedback
   - Highlight invalid fields
   - Show helpful error messages
   - Prevent saving invalid schedules

3. **Loading States**
   - Show loading spinner when fetching schedules
   - Show loading state when generating preview
   - Disable form during save operation

4. **Empty States**
   - Show helpful message when no schedule exists
   - Provide "Create Schedule" CTA
   - Show example schedules

### Accessibility

- [ ] Keyboard navigation for all form fields
- [ ] Screen reader labels for all inputs
- [ ] ARIA labels for date pickers
- [ ] Focus management in dialogs
- [ ] Color contrast for status indicators

---

## Phase 6: Documentation

### User Documentation

1. **Schedule Configuration Guide**
   - Explain each pattern type
   - Examples for common use cases
   - Best practices

2. **FAQ Section**
   - "Why are some dates unavailable?"
   - "How do I add a special edition date?"
   - "Can I have different schedules for different tiers?"

### Developer Documentation

1. **Code Comments**
   - Document complex pattern matching logic
   - Explain intersection/union logic
   - Document date handling (UTC)

2. **API Documentation**
   - Document all server actions
   - Document type definitions
   - Document utility functions

---

## Implementation Order

### Sprint 1: Newsletter Schedule UI
1. Create `PublicationScheduleSection.tsx`
2. Integrate into `NewsletterSettings.tsx`
3. Add preview functionality
4. Test with various patterns

### Sprint 2: Tier Availability UI
1. Create `TierAvailabilitySection.tsx`
2. Integrate into `TierFormDialog.tsx`
3. Add inherit from newsletter option
4. Add preview functionality
5. Test integration with tier creation/editing

### Sprint 3: Shared Components & Polish
1. Extract `SchedulePatternSelector.tsx`
2. Extract `SchedulePreview.tsx`
3. Create `schedule-helpers.ts`
4. Refactor to use shared components
5. Add UI/UX enhancements

### Sprint 4: Testing
1. Write unit tests for date-patterns
2. Write integration tests
3. Manual testing checklist
4. Performance testing
5. Bug fixes

### Sprint 5: Documentation
1. User documentation
2. Developer documentation
3. Code comments
4. Final review

---

## Files to Create/Modify

### New Files

- `app/(creator)/dashboard/settings/PublicationScheduleSection.tsx`
- `app/(creator)/dashboard/settings/TierAvailabilitySection.tsx`
- `app/(creator)/dashboard/settings/SchedulePatternSelector.tsx`
- `app/(creator)/dashboard/settings/SchedulePreview.tsx`
- `app/utils/schedule-helpers.ts`
- `app/utils/date-patterns.test.ts` (if using test framework)
- `tests/integration/availability-scheduling.test.ts` (if using test framework)

### Modified Files

- `app/(creator)/dashboard/settings/NewsletterSettings.tsx` - Add publication schedule section
- `app/(creator)/dashboard/settings/TierFormDialog.tsx` - Add availability schedule accordion tab
- `app/(creator)/dashboard/settings/InventoryManager.tsx` - Save tier availability schedule
- `app/(creator)/dashboard/settings/settings.module.css` - Add styles for schedule components

---

## Success Criteria

1. ✅ Creators can configure newsletter publication schedules
2. ✅ Creators can configure tier availability schedules
3. ✅ Creators can preview upcoming dates before saving
4. ✅ Datepicker shows correct availability status
5. ✅ All schedule patterns work correctly (weekly, bi-weekly, monthly, custom)
6. ✅ One-off dates are properly unioned with recurring patterns
7. ✅ Tier schedules correctly intersect with newsletter schedules
8. ✅ Bookings correctly subtract from available dates
9. ✅ System handles edge cases (no schedules, date ranges, etc.)
10. ✅ Performance is acceptable (< 500ms for availability calculation)
11. ✅ UI is intuitive and accessible
12. ✅ All tests pass

---

## Notes

- **Date Handling**: Always use UTC-based functions to prevent timezone issues
- **Performance**: Only generate preview dates for 1-3 month viewport
- **Validation**: Validate schedule configuration before saving
- **Error Handling**: Show user-friendly error messages
- **Backward Compatibility**: System should work even if no schedules are configured (all dates unavailable)
