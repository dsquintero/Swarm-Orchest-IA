# Hello Mundo Specification

## Purpose

Ejemplo de spec que sirve como referencia para el formato OpenSpec usado en Swarm-Orchest-IA. Este archivo se crea con `swarm init` como demostración del formato y puede ser eliminado cuando el proyecto tenga specs reales.

## Requirements

### Requirement: Saludo básico
El sistema SHALL responder con un saludo cuando se invoca el endpoint de salud.

#### Scenario: Saludo exitoso
- GIVEN la aplicación está corriendo
- WHEN GET /api/health es llamado
- THEN return 200 OK
- AND el response body contiene el campo "status" con valor "healthy"

#### Scenario: Aplicación no disponible
- GIVEN la aplicación no puede conectarse a la base de datos
- WHEN GET /api/health es llamado
- THEN return 503 Service Unavailable
- AND el response body contiene el campo "status" con valor "unhealthy"