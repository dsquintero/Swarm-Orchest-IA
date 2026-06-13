---
name: soia-format
description: OpenSpec format guide — GIVEN/WHEN/THEN scenarios and SHALL/MUST/SHOULD keywords
license: MIT
---

# OpenSpec Format

## Keywords (RFC 2119)

| Keyword | Meaning | Example |
|---------|---------|---------|
| SHALL / MUST | Obligatory requirement | "The system SHALL return 201 on creation" |
| SHOULD | Recommended, exceptions allowed | "The system SHOULD log all errors" |
| MAY | Optional | "The system MAY cache responses" |

## Requirements

Each requirement describes **observable behavior**, not implementation details.

✅ Good: "The system SHALL validate email format before creating a user."

❌ Bad: "The create handler calls the framework's validation library to check the email."

## Scenarios

Every requirement MUST have at least one scenario. Use GIVEN/WHEN/THEN/AND:

```
#### Scenario: {Descriptive Name}
- GIVEN [precondition / initial state]
- WHEN [action that triggers the behavior]
- THEN [expected outcome]
- AND [additional outcome]
```

### Examples

```markdown
#### Scenario: Successful creation
- GIVEN valid input data
- WHEN a create operation is requested
- THEN the system creates the record
- AND the result includes the new identifier

#### Scenario: Duplicate unique value
- GIVEN a record with a given unique value already exists
- WHEN a create operation uses the same unique value
- THEN the system rejects it as a conflict
- AND no new record is created

#### Scenario: Invalid input
- GIVEN input that violates a validation rule
- WHEN a create operation is requested
- THEN the system rejects it as invalid
- AND the response identifies the offending field
```

## Spec Structure

```markdown
# {Domain} Specification

## Purpose
[1 sentence: what this domain manages]

## Requirements

### Requirement: {Title}
[1 sentence: what the system must do, using SHALL/MUST/SHOULD/MAY]

#### Scenario: {Name}
- GIVEN [state]
- WHEN [action]
- THEN [result]
- AND [result]
```
