---
name: swarm-format
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

❌ Bad: "Use FluentValidation in CreateUserHandler to call EmailValidator."

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
#### Scenario: Successful user creation
- GIVEN valid user data (name, email, password)
- WHEN POST /api/usuarios is called
- THEN return 201 Created
- AND the response body contains the user ID
- AND the user is persisted in the database

#### Scenario: Duplicate email
- GIVEN a user with email "test@mail.com" already exists
- WHEN POST /api/usuarios with the same email
- THEN return 409 Conflict
- AND the error message indicates "email already registered"
- AND no new user is created

#### Scenario: Invalid email format
- GIVEN a request with email "not-an-email"
- WHEN POST /api/usuarios is called
- THEN return 400 Bad Request
- AND the error response includes the field "email"
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
