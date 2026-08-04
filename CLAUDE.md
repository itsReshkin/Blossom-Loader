# CLAUDE.md

# Blossom

## Project Overview

Blossom is a professional desktop application that allows users to create fully configured Minecraft servers through an intuitive Wizard.

The user only answers questions. The application is responsible for generating a complete, ready-to-host server package.

Always prioritize:

* Professional quality
* Clean architecture
* Scalability
* Maintainability
* Performance
* Excellent UX

---

# Core Principles

Always follow:

* SOLID
* DRY
* KISS
* YAGNI
* Clean Architecture
* Separation of Concerns
* Modular Design

Avoid:

* Spaghetti code
* Duplicate logic
* Giant files
* Giant classes
* Hardcoded values
* Circular dependencies
* Unnecessary complexity

---

# Project Structure

The project must remain modular.

Suggested structure:

* /core
* /ui
* /wizard
* /generators
* /plugins
* /templates
* /downloads
* /services
* /storage
* /utils
* /assets

Each module should have one clear responsibility.

---

# UI / UX

The application must look like commercial desktop software.

Design goals:

* Modern
* Clean
* Premium
* Minimal
* Professional
* Intuitive

Requirements:

* Dark Mode
* Smooth animations
* Rounded corners
* Consistent spacing
* Consistent typography
* Modern icons
* Accessible colors
* Responsive layouts
* Keyboard navigation
* Clear visual hierarchy

Never copy another application's design.

Focus on creating an original interface with an excellent user experience.

---

# Wizard

The Wizard is the core of the application.

Every page should:

* Have one clear purpose
* Validate inputs
* Save progress automatically
* Allow Back and Next navigation
* Display progress
* Prevent invalid configurations
* Be beginner friendly
* Include helpful descriptions when useful

Questions should be grouped into logical categories.

---

# Code Style

Always prefer:

* Small functions
* Small classes
* Descriptive names
* Readable code
* Self-documenting code

Avoid unnecessary comments.

Comment only complex logic.

---

# Error Handling

Every operation that may fail should:

* Handle errors gracefully
* Return meaningful messages
* Never crash unexpectedly
* Help users understand the problem

---

# Performance

Prioritize in this order:

1. Readability
2. Maintainability
3. Reliability
4. Performance

Avoid premature optimization.

---

# Extensibility

Everything should be easy to expand.

New Wizard pages, generators, templates, integrations and features should require minimal changes to existing code.

Never tightly couple modules.

---

# Plugin System

Plugin support should be data-driven whenever possible.

Avoid hardcoding plugin-specific logic.

Keep plugin metadata separate from UI logic.

Future plugin support should require minimal code changes.

---

# Validation

Validate all user input.

Prevent invalid or incompatible configurations.

Display clear validation messages.

---

# File Generation

Generated files must be:

* Clean
* Organized
* Predictable
* Consistent
* Easy to understand

Folder structures should remain well organized.

---

# Dependencies

Before adding a dependency:

* Verify that it is necessary.
* Prefer built-in functionality when practical.
* Keep the project lightweight.
* Avoid unnecessary packages.

---

# Security

Never trust user input.

Validate and sanitize everything.

Prevent unsafe file operations.

Prevent invalid paths and directory traversal.

---

# Future Expansion

The architecture should support future additions, including:

* Additional server software
* More Minecraft versions
* Plugin repositories
* Themes
* Localization
* Automatic updates
* Cloud synchronization
* Import existing projects
* Export templates
* Compatibility checking

These features should be possible without major architectural changes.

---

# AI Guidelines

Before writing code:

* Think first.
* Prefer long-term maintainability.
* Recommend better solutions when appropriate.
* Never rewrite unrelated code.
* Modify only what is necessary.
* Ask questions instead of making assumptions.
* Keep responses concise.
* Use every relevant capability, skill, and tool available to produce the highest-quality result.

The goal is to build a polished, production-quality desktop application that is modern, scalable, maintainable, and enjoyable to use.
