# Product Requirements Document

## Product
BOLT Workflow Planner

## Audience
Founders, developers, and operators who want to plan a small AI workflow before writing automation code.

## User job
I want to describe a task and identify the action I do not want an agent to execute without approval, so I can see a safe workflow before implementation.

## Core flow
1. User enters a task.
2. User enters the risky or consequential action.
3. User generates the plan.
4. The app displays a five-step workflow.
5. The consequential step is marked as requiring human approval.

## Functional requirements
- Accept two text inputs.
- Generate a deterministic five-step plan in the browser.
- Include an explicit approval gate.
- Keep the result readable with no additional configuration.
- Work from a local HTML file.

## Non-functional requirements
- No external dependencies.
- No account required.
- No network access required.
- Immediate response.
- Source code simple enough to review.

## Success criteria
A user can complete the interaction end to end and leave with a workflow that separates planning from autonomous execution.
