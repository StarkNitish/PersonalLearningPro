# Autonomous Frontend Coding Agent: Workspace Design

This document outlines the design for an autonomous frontend coding agent, structured around a `TASK → PLAN → SKILL SELECTION → EXECUTION → OUTPUT → LOGGING` workflow. The system is designed for scalability, determinism, and continuous development, featuring a modular architecture and robust logging.

## 1. Workspace Directory Structure

The agent operates within a dedicated `.agent` directory, which houses its configuration, operational files, and historical data.

```
.agent/
├── agent.config.json
├── skills/
│   ├── accessibility.json
│   ├── bug_fixing.json
│   ├── performance_optimization.json
│   ├── react_component_generation.json
│   ├── refactoring.json
│   ├── state_management.json
│   └── testing.json
│   └── styling.json
├── tasks/
│   └── 20240219_create_login_page.json
├── plan/
│   └── T-001_plan.json
├── workplace/
│   └── client/
│       └── src/
│           ├── pages/
│           │   └── LoginPage.tsx
│           └── tests/
│               └── LoginPage.test.tsx
└── logs/
    └── agent_activity_2024-02-19.log
```

---

## 2. Folder Definitions and Lifecycle

### `agent.config.json` (Root Agent Configuration File)

*   **Purpose:** The central configuration file for the agent, defining its identity, operational parameters, safety rules, and how it interacts with the workspace.
*   **File Format:** JSON.
*   **Lifecycle:** Loaded once at agent startup. Changes require agent restart or dynamic reload.
*   **Naming Convention:** `agent.config.json`.
*   **Agent Interaction:** Read-only for the agent during operation, but defines its core behavior.
*   **Example Content:**

    ```json
    {
      "agent_id": "FrontendGeniusAgent",
      "role": "Autonomous Frontend Coding Agent",
      "identity": "An expert AI architect specializing in modern web development.",
      "description": "This agent designs, implements, and optimizes frontend applications autonomously, adhering to best practices in UI/UX, performance, and accessibility.",
      "allowed_operations": [
        "read_file",
        "write_file",
        "replace",
        "run_shell_command",
        "grep_search",
        "glob",
        "list_directory",
        "web_fetch"
      ],
      "execution_loop": {
        "phases": [
          "TASK_INTAKE",
          "PLANNING",
          "SKILL_SELECTION",
          "EXECUTION",
          "OUTPUT_GENERATION",
          "LOGGING",
          "VALIDATION",
          "FEEDBACK_INTEGRATION"
        ],
        "max_iterations_per_task": 20,
        "idle_timeout_seconds": 300
      },
      "safety_rules": [
        "Never expose API keys or sensitive credentials in code or logs.",
        "Do not modify files outside the designated 'workplace/' directory without explicit instruction.",
        "Prioritize existing architectural patterns and coding conventions.",
        "Always include tests for new features and bug fixes.",
        "Seek user confirmation for significant architectural changes or before deploying.",
        "Avoid infinite loops in code generation; implement escape conditions and iteration limits."
      ],
      "logging_behavior": {
        "level": "INFO",
        "log_format": "JSON",
        "log_output": "file",
        "log_file_path": ".agent/logs/agent_activity.log"
      },
      "skill_registry": ".agent/skills/",
      "task_intake_mechanism": {
        "type": "filesystem_watch",
        "path": ".agent/tasks/",
        "file_extension": ".json",
        "polling_interval_seconds": 10
      }
    }
    ```

### `skills/`

*   **Purpose:** Stores modular definitions of capabilities the agent can perform. Each skill is a self-contained unit describing a specific coding task, its inputs, expected outputs, and the underlying implementation details (e.g., shell commands, code templates, logical steps).
*   **File Formats:** JSON files.
*   **Lifecycle of Files:** Skills are defined once and rarely change. New skills can be added, or existing ones updated, but they are not dynamically generated or consumed during task execution. They are registered at agent startup (or dynamically loaded by the skill registry).
*   **Naming Conventions:** `[skill_name].json` (e.g., `react_component_generation.json`).
*   **Agent Interaction:** The agent reads these files to understand available capabilities and their parameters during the `SKILL_SELECTION` phase. It does not write to them during operation.

*   **Example Skill (React Component Generation):** `skills/react_component_generation.json`

    ```json
    {
      "skill_name": "react_component_generation",
      "description": "Generates a new React functional component with specified props and basic structure.",
      "inputs": [
        {"name": "component_name", "type": "string", "description": "Name of the React component (e.g., 'LoginPage')."},
        {"name": "props", "type": "object", "description": "An object describing the component's props, e.g., { 'onSubmit': 'function', 'isLoading': 'boolean' }."},
        {"name": "elements", "type": "array", "description": "Array of UI elements to include, e.g., ['form', 'input', 'button']"},
        {"name": "styling_framework", "type": "string", "description": "Styling framework to use ('css' or 'tailwind').", "optional": true}
      ],
      "outputs": [
        {"name": "component_file_path", "type": "string", "description": "Path to the generated component file (.tsx)."}
      ],
      "implementation_details": {
        "type": "template_and_logic",
        "template_path": "skills/templates/react_component.tsx.hbs",
        "logic_script": "skills/scripts/generate_react_component.js",
        "dependencies": ["react", "typescript"]
      }
    }
    ```

*   **Example Skill (State Management):** `skills/state_management.json`

    ```json
    {
      "skill_name": "state_management",
      "description": "Implements basic state management using React's useState or useContext hooks, or integrates with a state management library.",
      "inputs": [
        {"name": "state_name", "type": "string", "description": "Name of the state variable (e.g., 'username', 'isAuthenticated')."},
        {"name": "initial_value", "type": "any", "description": "Initial value for the state."},
        {"name": "scope", "type": "string", "description": "Scope of the state: 'local' (useState) or 'global' (useContext/library)."},
        {"name": "context_name", "type": "string", "description": "Name of the context if scope is 'global' and using useContext.", "optional": true},
        {"name": "reducer_logic", "type": "string", "description": "Code for reducer function if using useReducer.", "optional": true}
      ],
      "outputs": [
        {"name": "state_declaration_code", "type": "string", "description": "Generated code for state declaration and update function."}
      ],
      "implementation_details": {
        "type": "code_snippet_generation",
        "logic_script": "skills/scripts/generate_state_management.js",
        "dependencies": ["react"]
      }
    }
    ```

*   **Example Skill (Styling):** `skills/styling.json`

    ```json
    {
      "skill_name": "styling",
      "description": "Applies styling to React components using CSS modules or Tailwind CSS classes.",
      "inputs": [
        {"name": "target_file", "type": "string", "description": "Path to the component file to apply styles to."},
        {"name": "method", "type": "string", "description": "Styling method: 'css_module', 'tailwind_classes', 'inline_styles'."},
        {"name": "styles", "type": "object", "description": "Object defining styles (CSS rules or Tailwind class strings)."},
        {"name": "css_file_path", "type": "string", "description": "Path to the CSS module file if 'css_module' method is used.", "optional": true}
      ],
      "outputs": [
        {"name": "modified_files", "type": "array", "description": "List of files that were modified for styling."}
      ],
      "implementation_details": {
        "type": "code_modification",
        "logic_script": "skills/scripts/apply_styling.js",
        "dependencies": ["tailwindcss", "postcss"]
      }
      }
    ```

*   **Example Skill (Accessibility):** `skills/accessibility.json`

    ```json
    {
      "skill_name": "accessibility",
      "description": "Ensures components adhere to WCAG guidelines by adding ARIA attributes, semantic HTML, and focus management.",
      "inputs": [
        {"name": "target_file", "type": "string", "description": "Path to the component file to enhance accessibility for."},
        {"name": "a11y_concerns", "type": "array", "description": "List of accessibility concerns to address (e.g., 'keyboard_navigation', 'aria_labels', 'color_contrast')."},
        {"name": "element_selectors", "type": "object", "description": "CSS selectors to identify elements needing a11y improvements, e.g., {'button': ['submit_button']}"}
      ],
      "outputs": [
        {"name": "modified_files", "type": "array", "description": "List of files that were modified for accessibility improvements."}
      ],
      "implementation_details": {
        "type": "code_modification",
        "logic_script": "skills/scripts/improve_a11y.js",
        "dependencies": []
      }
    }
    ```

*   **Example Skill (Performance Optimization):** `skills/performance_optimization.json`

    ```json
    {
      "skill_name": "performance_optimization",
      "description": "Applies common performance optimizations like lazy loading, memoization, or code splitting.",
      "inputs": [
        {"name": "target_file", "type": "string", "description": "Path to the file or component to optimize."},
        {"name": "optimization_type", "type": "string", "description": "Type of optimization: 'lazy_load', 'memoize', 'code_split'."},
        {"name": "component_name", "type": "string", "description": "Name of the component to lazy load or memoize.", "optional": true},
        {"name": "route_path", "type": "string", "description": "Route path for code splitting.", "optional": true}
      ],
      "outputs": [
        {"name": "modified_files", "type": "array", "description": "List of files that were modified for performance optimization."}
      ],
      "implementation_details": {
        "type": "code_modification",
        "logic_script": "skills/scripts/optimize_performance.js",
        "dependencies": ["react"]
      }
    }
    ```

*   **Example Skill (Testing):** `skills/testing.json`

    ```json
    {
      "skill_name": "testing",
      "description": "Generates unit or integration tests for React components or functions using testing libraries like React Testing Library and Jest.",
      "inputs": [
        {"name": "target_file", "type": "string", "description": "Path to the component or function file to test."},
        {"name": "test_type", "type": "string", "description": "Type of test: 'unit', 'integration'."},
        {"name": "test_framework", "type": "string", "description": "Testing framework to use: 'react_testing_library', 'jest'."},
        {"name": "test_cases", "type": "array", "description": "List of scenarios or behaviors to test."}
      ],
      "outputs": [
        {"name": "test_file_path", "type": "string", "description": "Path to the generated test file."}
      ],
      "implementation_details": {
        "type": "template_and_logic",
        "template_path": "skills/templates/react_test.tsx.hbs",
        "logic_script": "skills/scripts/generate_test.js",
        "dependencies": ["@testing-library/react", "jest", "ts-jest"]
      }
    }
    ```

*   **Example Skill (Refactoring):** `skills/refactoring.json`

    ```json
    {
      "skill_name": "refactoring",
      "description": "Refactors existing code to improve readability, maintainability, or performance without changing external behavior.",
      "inputs": [
        {"name": "target_file", "type": "string", "description": "Path to the file to refactor."},
        {"name": "refactoring_type", "type": "string", "description": "Type of refactoring: 'extract_component', 'rename_variable', 'simplify_logic', 'extract_hook'."},
        {"name": "selection_start", "type": "number", "description": "Start line of code selection for refactoring.", "optional": true},
        {"name": "selection_end", "type": "number", "description": "End line of code selection for refactoring.", "optional": true},
        {"name": "new_name", "type": "string", "description": "New name for variable/component/hook if applicable.", "optional": true}
      ],
      "outputs": [
        {"name": "modified_files", "type": "array", "description": "List of files that were modified during refactoring."}
      ],
      "implementation_details": {
        "type": "code_transformation",
        "logic_script": "skills/scripts/apply_refactoring.js",
        "dependencies": ["prettier", "eslint"]
      }
    }
    ```

*   **Example Skill (Bug Fixing):** `skills/bug_fixing.json`

    ```json
    {
      "skill_name": "bug_fixing",
      "description": "Analyzes reported issues, identifies root causes, and applies code changes to fix bugs.",
      "inputs": [
        {"name": "bug_report", "type": "string", "description": "Detailed description of the bug, including steps to reproduce and expected vs. actual behavior."},
        {"name": "affected_files", "type": "array", "description": "List of potentially affected files based on initial analysis.", "optional": true},
        {"name": "test_reproduction_script", "type": "string", "description": "Script or steps to reproduce the bug empirically.", "optional": true}
      ],
      "outputs": [
        {"name": "fixed_files", "type": "array", "description": "List of files that were modified to fix the bug."},
        {"name": "new_test_file", "type": "string", "description": "Path to a new test file that reproduces and validates the fix."}
      ],
      "implementation_details": {
        "type": "diagnostic_and_code_modification",
        "logic_script": "skills/scripts/diagnose_and_fix_bug.js",
        "dependencies": ["eslint", "prettier"]
      }
    }
    ```

### `tasks/`

*   **Purpose:** Contains incoming tasks for the agent to process. These files define what the user wants the agent to achieve.
*   **File Formats:** JSON files, each representing a single task.
*   **Lifecycle of Files:** A task file is created by the user (or another system) to initiate work. Once the agent processes the task and completes its work, the task file is typically moved to an `archive/` subdirectory or deleted to indicate completion.
*   **Naming Conventions:** `[timestamp]_[task_description_slug].json` (e.g., `20240219_create_login_page.json`).
*   **Agent Interaction:** The agent monitors this directory for new files. When a new task file appears, it reads its content, parses the task, and initiates the `PLANNING` phase. It does not write to these files directly during execution but might move them.

*   **Example Task:** `tasks/20240219_create_login_page.json`

    ```json
    {
      "task_id": "T-001",
      "timestamp": "2024-02-19T10:00:00Z",
      "user_story": "As a user, I want to log in to the application so that I can access my personalized dashboard.",
      "objective": "Create a responsive login page with form validation, modern UI/UX, and integrate with existing authentication mechanisms.",
      "deliverables": [
        "React component for Login Page (LoginPage.tsx)",
        "Associated CSS/Tailwind styles",
        "Form validation logic",
        "Integration with Firebase authentication (if available)"
      ],
      "constraints": [
        "Must be responsive for mobile and desktop.",
        "Must use existing UI component library (if available).",
        "Error messages should be user-friendly."
      ]
    }
    ```

### `plan/`

*   **Purpose:** Stores the detailed execution plan generated by the agent for a given task. This plan breaks down the high-level task into a sequence of actionable steps, often involving specific skill invocations.
*   **File Formats:** JSON files.
*   **Lifecycle of Files:** A plan file is generated after the `PLANNING` phase for each new task. It is read during the `EXECUTION` phase to guide the agent's actions. The plan might be updated if initial steps fail or new information comes to light. Once the task is complete, the plan file is typically archived alongside the task file.
*   **Naming Conventions:** `[task_id]_plan.json` (e.g., `T-001_plan.json`).
*   **Agent Interaction:** The agent writes to this file during the `PLANNING` phase and reads from it repeatedly during the `EXECUTION` phase. It might also update the plan if dynamic adjustments are needed.

*   **Example Plan:** `plan/T-001_plan.json`

    ```json
    {
      "plan_id": "P-001",
      "task_id": "T-001",
      "created_at": "2024-02-19T10:05:00Z",
      "status": "pending",
      "steps": [
        {
          "step_id": 1,
          "description": "Generate base React component for LoginPage.",
          "skill": "react_component_generation",
          "inputs": {
            "component_name": "LoginPage",
            "props": {},
            "elements": ["div", "form", "input", "input", "button"],
            "styling_framework": "tailwind"
          },
          "expected_output": {
            "component_file_path": "client/src/pages/LoginPage.tsx"
          },
          "status": "pending"
        },
        {
          "step_id": 2,
          "description": "Implement state management for form inputs (email, password) and loading state.",
          "skill": "state_management",
          "inputs": [
            {"state_name": "email", "initial_value": "''", "scope": "local"},
            {"state_name": "password", "initial_value": "''", "scope": "local"},
            {"state_name": "isLoading", "initial_value": "false", "scope": "local"}
          ],
          "status": "pending"
        },
        {
          "step_id": 3,
          "description": "Add form validation logic (e.g., email format, password length).",
          "skill": "refactoring",
          "inputs": {
            "target_file": "client/src/pages/LoginPage.tsx",
            "refactoring_type": "add_validation_logic",
            "validation_rules": {
              "email": ["required", "email_format"],
              "password": ["required", "min_length:6"]
            }
          },
          "status": "pending"
        },
        {
          "step_id": 4,
          "description": "Apply responsive and modern Tailwind CSS styling to the login page.",
          "skill": "styling",
          "inputs": {
            "target_file": "client/src/pages/LoginPage.tsx",
            "method": "tailwind_classes",
            "styles": {
              "form": "flex flex-col gap-4 p-8 bg-white shadow-lg rounded-lg max-w-sm mx-auto mt-10",
              "input": "border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
              "button": "bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            }
          },
          "status": "pending"
        },
        {
          "step_id": 5,
          "description": "Ensure accessibility for form elements (labels, ARIA attributes).",
          "skill": "accessibility",
          "inputs": {
            "target_file": "client/src/pages/LoginPage.tsx",
            "a11y_concerns": ["form_labels", "aria_attributes", "focus_management"]
          },
          "status": "pending"
        },
        {
          "step_id": 6,
          "description": "Create unit tests for the LoginPage component.",
          "skill": "testing",
          "inputs": {
            "target_file": "client/src/pages/LoginPage.tsx",
            "test_type": "unit",
            "test_framework": "react_testing_library",
            "test_cases": [
              "renders without crashing",
              "updates email on input change",
              "updates password on input change",
              "shows error for invalid email",
              "shows error for short password",
              "calls onSubmit with correct credentials"
            ]
          },
          "expected_output": {
            "test_file_path": "client/src/tests/LoginPage.test.tsx"
          },
          "status": "pending"
        }
      ]
    }
    ```

### `workplace/`

*   **Purpose:** This is the agent's scratchpad or working directory where it performs actual code modifications, generates new files, and stores intermediate results. It mirrors a simplified project structure relevant to the current task.
*   **File Formats:** Varies widely depending on the task (e.g., `.tsx`, `.ts`, `.css`, `.json`, `.js`). These are actual code files.
*   **Lifecycle of Files:** Files are created, modified, and potentially deleted throughout the `EXECUTION` phase. Once the task is complete and validated, the final versions of these files are integrated into the main project codebase.
*   **Naming Conventions:** Standard programming language conventions (e.g., `LoginPage.tsx`, `login.css`).
*   **Agent Interaction:** The agent extensively reads and writes to files within this directory using `read_file`, `write_file`, `replace`, and `run_shell_command` (for tools like `prettier`, `eslint`, `tsc`, `git`). This is where all the active development happens.

*   **Example Output (LoginPage Component):** `workplace/client/src/pages/LoginPage.tsx`

    ```typescript
    // client/src/pages/LoginPage.tsx
    import React, { useState } from 'react';

    const LoginPage: React.FC = () => {
      const [email, setEmail] = useState('');
      const [password, setPassword] = useState('');
      const [isLoading, setIsLoading] = useState(false);
      const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

      const validate = () => {
        const newErrors: { email?: string; password?: string } = {};
        if (!email) {
          newErrors.email = 'Email is required.';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
          newErrors.email = 'Email address is invalid.';
        }
        if (!password) {
          newErrors.password = 'Password is required.';
        } else if (password.length < 6) {
          newErrors.password = 'Password must be at least 6 characters.';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
      };

      const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        if (validate()) {
          setIsLoading(true);
          // Simulate API call
          setTimeout(() => {
            console.log('Login attempt with:', { email, password });
            setIsLoading(false);
            // Further logic for actual authentication
          }, 1500);
        }
      };

      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-8 bg-white shadow-lg rounded-lg max-w-sm mx-auto mt-10">
            <h2 className="text-2xl font-bold text-center mb-4">Login</h2>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                id="email"
                className="border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={errors.email ? "true" : "false"}
                aria-describedby="email-error"
              />
              {errors.email && <p id="email-error" className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                id="password"
                className="border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={errors.password ? "true" : "false"}
                aria-describedby="password-error"
              />
              {errors.password && <p id="password-error" className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full flex items-center justify-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                'Login'
              )}
            </button>
          </form>
        </div>
      );
    };

    export default LoginPage;
    ```

*   **Example Output (LoginPage Test):** `workplace/client/src/tests/LoginPage.test.tsx`

    ```typescript
    // client/src/tests/LoginPage.test.tsx
    import React from 'react';
    import { render, screen, fireEvent, waitFor } from '@testing-library/react';
    import '@testing-library/jest-dom';
    import LoginPage from '../pages/LoginPage';

    describe('LoginPage', () => {
      it('renders without crashing', () => {
        render(<LoginPage />);
        expect(screen.getByText('Login')).toBeInTheDocument();
      });

      it('updates email on input change', () => {
        render(<LoginPage />);
        const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        expect(emailInput.value).toBe('test@example.com');
      });

      it('updates password on input change', () => {
        render(<LoginPage />);
        const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        expect(passwordInput.value).toBe('password123');
      });

      it('shows error for invalid email', async () => {
        render(<LoginPage />);
        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const submitButton = screen.getByRole('button', { name: /login/i });

        fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
          expect(screen.getByText(/email address is invalid/i)).toBeInTheDocument();
        });
      });

      it('shows error for short password', async () => {
        render(<LoginPage />);
        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const submitButton = screen.getByRole('button', { name: /login/i });

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'short' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
          expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument();
        });
      });

      it('calls onSubmit with correct credentials (simulated)', async () => {
        const consoleSpy = jest.spyOn(console, 'log');
        render(<LoginPage />);
        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const submitButton = screen.getByRole('button', { name: /login/i });

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
          expect(consoleSpy).toHaveBeenCalledWith('Login attempt with:', { email: 'test@example.com', password: 'password123' });
        });
        consoleSpy.mockRestore();
      });
    });
    ```

### `logs/`

*   **Purpose:** Stores detailed records of the agent's operations, decisions, outputs, and any errors encountered during its execution. This is crucial for debugging, auditing, and understanding the agent's behavior.
*   **File Formats:** JSON lines (one JSON object per line) is preferred for structured logging and easier parsing.
*   **Lifecycle of Files:** Log files are continuously appended to during the agent's operation. They can be rotated (e.g., daily, weekly) and archived to manage disk space. Old logs might be purged after a certain retention period.
*   **Naming Conventions:** `agent_activity_[YYYY-MM-DD].log` (e.g., `agent_activity_2024-02-19.log`).
*   **Agent Interaction:** The agent writes to these files during every phase of its execution, recording inputs, outputs, skill invocations, and state changes. It typically does not read its own log files unless specifically tasked with self-diagnosis or review.

*   **Example Log Entry:** `logs/agent_activity_2024-02-19.log`

    ```json
    {"timestamp": "2024-02-19T10:00:01Z", "level": "INFO", "phase": "TASK_INTAKE", "message": "New task detected", "task_id": "T-001", "file": "tasks/20240219_create_login_page.json"}
    {"timestamp": "2024-02-19T10:00:05Z", "level": "INFO", "phase": "PLANNING", "message": "Generated execution plan for task", "task_id": "T-001", "plan_id": "P-001", "steps_count": 6}
    {"timestamp": "2024-02-19T10:00:10Z", "level": "INFO", "phase": "EXECUTION", "step_id": 1, "skill": "react_component_generation", "message": "Invoking skill: react_component_generation for LoginPage", "inputs": {"component_name": "LoginPage"}}
    {"timestamp": "2024-02-19T10:00:15Z", "level": "OUTPUT", "step_id": 1, "skill": "react_component_generation", "message": "Component file created", "output_path": "workplace/client/src/pages/LoginPage.tsx"}
    {"timestamp": "2024-02-19T10:00:20Z", "level": "INFO", "phase": "EXECUTION", "step_id": 2, "skill": "state_management", "message": "Invoking skill: state_management for LoginPage inputs"}
    {"timestamp": "2024-02-19T10:00:25Z", "level": "INFO", "phase": "EXECUTION", "step_id": 3, "skill": "refactoring", "message": "Invoking skill: refactoring for validation logic"}
    {"timestamp": "2024-02-19T10:00:30Z", "level": "INFO", "phase": "EXECUTION", "step_id": 4, "skill": "styling", "message": "Invoking skill: styling for Tailwind CSS"}
    {"timestamp": "2024-02-19T10:00:35Z", "level": "INFO", "phase": "EXECUTION", "step_id": 5, "skill": "accessibility", "message": "Invoking skill: accessibility for form elements"}
    {"timestamp": "2024-02-19T10:00:40Z", "level": "INFO", "phase": "EXECUTION", "step_id": 6, "skill": "testing", "message": "Invoking skill: testing for LoginPage"}
    {"timestamp": "2024-02-19T10:00:45Z", "level": "OUTPUT", "step_id": 6, "skill": "testing", "message": "Test file created", "output_path": "workplace/client/src/tests/LoginPage.test.tsx"}
    {"timestamp": "2024-02-19T10:00:50Z", "level": "INFO", "phase": "VALIDATION", "message": "All plan steps completed. Initiating validation of generated code."}
    {"timestamp": "2024-02-19T10:00:55Z", "level": "SUCCESS", "phase": "TASK_COMPLETION", "message": "Task T-001 completed successfully. Login page implemented and tested.", "task_id": "T-001"}
    ```

---

## 3. Pseudocode for the Agent Loop

The agent's operation follows a continuous, state-driven loop, as defined in `agent.config.json`.

```pseudocode
function AgentLoop():
  Load Configuration from ".agent/agent.config.json"
  Initialize Skill Registry from "skills/" directory
  Initialize Logger based on config

  WHILE Agent is running:
    LogInfo("Entering TASK_INTAKE phase...")
    task = CheckForNewTasks() // Monitors ".agent/tasks/"
    IF task is found:
      LogInfo("New task received", task.id)
      current_task = task
      current_plan = NULL
      current_phase = PLANNING
      LogInfo("Transitioning to PLANNING phase...")
    ELSE IF current_task is NULL AND idle_timeout_reached:
      LogInfo("No new tasks, entering idle state.")
      SLEEP(config.idle_timeout_seconds)
      CONTINUE
    ELSE IF current_task is NULL:
      // Agent is waiting for a task
      SLEEP(config.task_intake_mechanism.polling_interval_seconds)
      CONTINUE

    SWITCH current_phase:
      CASE PLANNING:
        LogInfo("Generating plan for task", current_task.id)
        current_plan = GeneratePlan(current_task, SkillRegistry) // Creates/writes to ".agent/plan/[task_id]_plan.json"
        IF current_plan is generated successfully:
          LogInfo("Plan generated", current_plan.id)
          current_phase = EXECUTION
          LogInfo("Transitioning to EXECUTION phase...")
        ELSE:
          LogError("Failed to generate plan for task", current_task.id)
          HandleError(current_task, "PLANNING_FAILED")
          current_task = NULL // Reset to look for new tasks
          current_phase = TASK_INTAKE

      CASE EXECUTION:
        LogInfo("Executing plan", current_plan.id)
        FOR EACH step IN current_plan.steps:
          IF step.status IS NOT "completed":
            LogInfo("Executing step", step.id, step.description)
            skill_definition = SkillRegistry.get(step.skill)
            IF skill_definition IS NOT NULL:
              result = ExecuteSkill(skill_definition, step.inputs, ".agent/workplace/")
              LogInfo("Skill execution result", result)
              IF result.status IS "success":
                step.status = "completed"
                UpdatePlanStatus(current_plan) // Writes updated plan to ".agent/plan/"
                LogInfo("Step completed", step.id)
                // Log OUTPUT phase details
                LogOutput(step.id, step.skill, result.output_details)
              ELSE:
                step.status = "failed"
                UpdatePlanStatus(current_plan)
                LogError("Step failed", step.id, result.error)
                HandleError(current_task, "EXECUTION_FAILED", step, result.error)
                current_phase = FEEDBACK_INTEGRATION // Or attempt remediation
                BREAK // Exit step loop, handle failure
            ELSE:
              LogError("Skill not found for step", step.skill, step.id)
              step.status = "failed"
              UpdatePlanStatus(current_plan)
              HandleError(current_task, "UNKNOWN_SKILL", step.skill, step.id)
              current_phase = FEEDBACK_INTEGRATION
              BREAK
        
        IF ALL steps IN current_plan.steps ARE "completed":
          current_phase = VALIDATION
          LogInfo("Transitioning to VALIDATION phase...")
        ELSE IF current_phase IS NOT FEEDBACK_INTEGRATION:
          // Some steps failed, but not handled by immediate error
          LogError("Plan execution incomplete due to unhandled step failures.")
          current_phase = FEEDBACK_INTEGRATION


      CASE VALIDATION:
        LogInfo("Performing validation for task", current_task.id)
        validation_result = PerformValidation(".agent/workplace/") // Run tests, linting, etc.
        IF validation_result.status IS "success":
          LogSuccess("Task completed successfully", current_task.id)
          ArchiveTaskAndPlan(current_task, current_plan, ".agent/tasks/archive/", ".agent/plan/archive/")
          LogInfo("Moving generated files from workplace to project codebase.")
          IntegrateWorkplaceChangesIntoProject(".agent/workplace/", "client/src/")
          current_task = NULL
          current_plan = NULL
          current_phase = TASK_INTAKE
        ELSE:
          LogError("Validation failed for task", current_task.id, validation_result.errors)
          HandleError(current_task, "VALIDATION_FAILED", validation_result.errors)
          current_phase = FEEDBACK_INTEGRATION
          LogInfo("Transitioning to FEEDBACK_INTEGRATION phase...")

      CASE FEEDBACK_INTEGRATION:
        LogInfo("Integrating feedback/handling errors for task", current_task.id)
        // This phase would involve human review, AI self-correction, or generating a refined plan.
        // For simplicity, here we just reset the task, but in a real system, it would be more sophisticated.
        // Example: If an error, agent might analyze logs, modify plan, and re-enter EXECUTION.
        LogError("Automated feedback integration not fully implemented, requiring human intervention for task", current_task.id)
        current_task = NULL
        current_plan = NULL
        current_phase = TASK_INTAKE // Re-queue task or wait for new instruction

      DEFAULT:
        LogError("Unknown agent phase", current_phase)
        current_task = NULL
        current_plan = NULL
        current_phase = TASK_INTAKE

    LogInfo("Execution loop iteration complete.")
    // Optional: Add a small delay to prevent busy-waiting
    SLEEP(1) 

// Helper functions (conceptual)
function CheckForNewTasks():
  // Monitors .agent/tasks/ for new JSON files, returns the oldest one
  // and marks it as "in_progress" or moves it to a temp dir.

function GeneratePlan(task, skill_registry):
  // Uses LLM to create a detailed plan (list of skill invocations)
  // based on the task objective and available skills.
  // Writes this plan to ".agent/plan/[task_id]_plan.json"

function ExecuteSkill(skill_definition, inputs, workplace_path):
  // Dynamically loads and executes the logic script associated with the skill.
  // Performs operations (read/write files, run shell commands) within workplace_path.
  // Returns status and any relevant output.

function UpdatePlanStatus(plan):
  // Updates the status of steps and the overall plan in ".agent/plan/[task_id]_plan.json"

function PerformValidation(workplace_path):
  // Runs tests (e.g., `npm test`), linting (`eslint`), type checks (`tsc`),
  // and other quality gates on the code in the workplace.
  // Returns overall success/failure and detailed errors.

function IntegrateWorkplaceChangesIntoProject(workplace_path, project_path):
  // Moves or copies the final, validated files from the .agent/workplace
  // to the actual project codebase. This might involve git operations.

function ArchiveTaskAndPlan(task, plan, task_archive_path, plan_archive_path):
  // Moves the completed task and plan files to their respective archive directories.

function HandleError(task, error_type, details...):
  // Logs the error, potentially sends a notification,
  // and determines if remediation or human intervention is needed.
  // Might update task status to "failed" or "needs_review".
```

---

## 4. Recommendations for Production Usage

To ensure the system is scalable, deterministic, and suitable for continuous development, consider the following:

1.  **Containerization:**
    *   **Docker/Kubernetes:** Package the agent and its dependencies into Docker containers. This ensures a consistent runtime environment, isolates the agent from the host system, and simplifies deployment/scaling.
    *   **Ephemeral Environments:** For each task, consider spinning up an ephemeral container with a fresh copy of the project and the `.agent/workplace` mounted. This guarantees determinism by eliminating side effects from previous runs.

2.  **Stateless Agent Core (where possible):**
    *   Design the core agent loop to be as stateless as possible across iterations. Persist critical state (current task, plan, execution progress) in external, durable storage (e.g., a database or message queue) rather than in-memory. This improves fault tolerance and allows for horizontal scaling.

3.  **Robust Error Handling & Retry Mechanisms:**
    *   Implement comprehensive `try-catch` blocks and define clear error states for each phase and skill execution.
    *   **Idempotency:** Ensure that skill executions are idempotent where possible, meaning applying them multiple times has the same effect as applying them once. This is crucial for safe retries.
    *   **Backoff Strategies:** For transient failures (e.g., API rate limits), implement exponential backoff for retries.

4.  **Version Control Integration:**
    *   **Git for Workplace:** Treat the `.agent/workplace` as a Git repository during the `EXECUTION` phase. Each significant change (e.g., after a skill invocation) can be a commit. This provides a detailed history, allows easy reverts, and simplifies merging into the main codebase.
    *   **PR Generation:** After successful `VALIDATION`, the agent should automatically create a Pull Request (PR) against the main project repository from its `workplace` branch, including the generated code, tests, and a summary of changes (derived from the plan and logs).

5.  **Observability:**
    *   **Centralized Logging:** Aggregate logs from all agent instances into a centralized logging system (e.g., ELK Stack, Splunk, Datadog). Use structured JSON logging for easy querying and analysis.
    *   **Monitoring & Alerting:** Set up dashboards and alerts for key metrics (e.g., task completion rates, failure rates, skill execution times, resource utilization) and error conditions.
    *   **Tracing:** Implement distributed tracing to visualize the flow of execution across different agent phases and skill invocations.

6.  **Security:**
    *   **Principle of Least Privilege:** Ensure the agent only has access to the resources and file paths it strictly needs.
    *   **Credential Management:** Use secure credential management systems (e.g., Kubernetes Secrets, HashiCorp Vault) for any sensitive information the agent requires. Never hardcode credentials.
    *   **Code Scanning:** Integrate static application security testing (SAST) tools into the `VALIDATION` phase to scan generated code for vulnerabilities.

7.  **Human-in-the-Loop:**
    *   **Review Gates:** For critical tasks or before deployment, implement mandatory human review gates (e.g., requiring PR approval).
    *   **Feedback Mechanism:** Provide an easy way for human reviewers to provide feedback that the agent can ingest and incorporate (e.g., by creating new `tasks/` or `feedback.json` files that trigger `FEEDBACK_INTEGRATION`).

8.  **Skill Development & Management:**
    *   **Skill Versioning:** Implement versioning for skills to allow for updates without breaking older tasks/plans.
    *   **Skill Validation:** Each skill should have its own set of tests to ensure it functions correctly and produces expected outputs.
    *   **Dynamic Skill Loading:** Allow skills to be added or updated without restarting the entire agent.

By implementing these recommendations, the autonomous frontend coding agent can transition from a conceptual design to a robust, reliable, and continuously evolving production system.