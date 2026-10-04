# Technical Specification

## How This Works, In Plain Language
BOLT Workflow Planner is a local browser proof of concept. The user enters a task and identifies the action that should not happen automatically. The page produces a five-step plan and places a human-approval gate before that consequential action.

## Runtime
Runs locally in a modern desktop browser by opening index.html. No server, account, build step, network connection, or environment variables are required.

## Components
### Task input
Implements the PRD core flow by collecting the workflow goal.

### Risky-action input
Collects the action that requires human approval.

### Workflow generator
Uses browser JavaScript to create a deterministic five-step plan from the two inputs.

### Approval boundary
Renders the risky action as an explicit human-approval step. No external action is executed.

## Data Flow
1. User enters task and risky action.
2. Browser reads both values.
3. JavaScript constructs the five-step workflow.
4. The approval step embeds the risky action.
5. The result is rendered in the page for review.

## File Structure
- index.html - UI, styles, and browser logic
- README.md - run instructions and project summary
- scope.md - product boundary
- prd.md - product requirements
- spec.md - technical blueprint
- BUILD_PLAN.md - original planning notes
- LICENSE - MIT license

## Where It Runs and How Someone Tries It
Clone or download the public repository and open index.html in a modern browser. Enter a task and a risky action, then generate the workflow.

## Verification
Confirm that five steps render, that the risky action appears in the approval step, and that the page performs no external action.

## Decisions and Open Issues
The proof of concept intentionally avoids external model APIs and cloud deployment so the core planning and approval-boundary idea remains easy to inspect and demo.
