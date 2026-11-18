**Angular Development Rules**

- The Angular application is already running via `ng serve` in a separate terminal.
- Do not start another `ng serve` process.
- Do not automatically run `ng build` after every code change.
- For small UI, CSS, HTML, or TypeScript changes, rely on the existing development server for live compilation.
- Run `ng build --configuration production` only when:
  - I explicitly request it.
  - Changes significantly affect application architecture, dependencies, or build configuration.
  - A production-specific issue needs verification.
- If a build is necessary, explain why before running it.
- Prioritize implementation speed and avoid unnecessary commands.