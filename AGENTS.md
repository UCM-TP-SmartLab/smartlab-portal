# Angular Agent Instructions

This document contains reusable conventions for Angular applications built with classic `NgModule` architecture. Adapt version-specific details to the Angular, TypeScript, RxJS, NgRx, testing, and UI-library versions used by the repository.

## Project Context

- Read the repository documentation, `package.json`, Angular configuration, lint configuration, and existing feature implementations before making changes.
- Use classic Angular modules (`NgModule`) and components with separate templates.
- Standalone components are not part of this architecture. Do not introduce them without an explicit, application-wide migration requirement.
- Prefer existing scripts for development, building, linting, and testing.
- When a reference project is available, use it as a guide for module structure, routing, state management, UI components, API configuration, and internationalization patterns. Do not copy domain-specific behavior blindly.

## Recommended Repository Structure

Use the existing structure when it differs. A conventional structure for a larger Angular application is:

```text
src/
  app/
    core/                 # Singleton services, interceptors, guards, and core modules
    modules/              # Functional or routed feature areas
      feature-name/
        view/             # Container and presentation components
        store/
          actions/
          effects/
          reducers/
          selectors/
        feature-routing.module.ts
        feature.module.ts
    shared/               # Reusable components, directives, pipes, and shared modules
    store/                # State shared by the whole application
    data/                 # Shared definitions, enums, and translation keys
    config/               # Menu, layout, validation, and application configuration
  assets/
    i18n/                 # Translation files
```

A typical feature module should follow this model:

```text
feature-name/
  view/
    list/
      feature-list.component.ts
      feature-list.component.html
    detail/
      feature-detail.component.ts
      feature-detail.component.html
  store/
    actions/
      feature.actions.ts
    effects/
      feature.effects.ts
    reducers/
      feature.reducer.ts
    selectors/
      feature.selectors.ts
  feature-routing.module.ts
  feature.module.ts
```

- Declare feature components in the owning feature module.
- Import shared UI, pipe, directive, and form modules through the application's shared-module boundary.
- Keep route definitions in the feature routing module and lazy-load the feature from its parent routing configuration.
- Do not declare feature components in the application shell or parent navigation module.

- Keep state owned by a single feature inside that feature.
- Keep only genuinely global or cross-feature state in the root store.
- Lazy-load routed feature areas where practical.
- A routing or layout shell should load feature modules and should not declare their components directly.
- When routes change, preserve legacy URLs with redirects if backward compatibility is required.

## Module and Feature Design

- Keep actions, effects, reducers, selectors, routing, and views close to the feature that owns them.
- Register feature state with `StoreModule.forFeature(...)` and feature effects with `EffectsModule.forFeature(...)` at the common module boundary that owns them.
- If multiple lazy-loaded modules use the same feature store, register it once in their shared parent module. Do not register the same feature state repeatedly.
- Create small route-specific container components when the same presentation component must load data from different endpoints or contexts.
- Choose an endpoint explicitly in the owning container. A reusable child component must not infer backend behavior by inspecting `ActivatedRoute`, the current URL, or route metadata.

## UI and Component Rules

- Use the UI component library already selected by the application consistently. Do not mix in another design system without an explicit requirement.
- Prefer library-provided layout, navigation, card, button, modal, table, form, spinner, and validation components over custom replacements.
- Follow one naming convention for modals across component names, folders, selectors, and files. External library API names are exempt from application naming rules.
- Each component must have its own `.html` template. Do not use inline templates.
- Add a component `.scss` file and `styleUrls` only when the component has specific styles.
- Avoid calling component methods or getters from template bindings, conditions, and interpolation because Angular reevaluates them during change detection.
- Precompute displayed values in observables, selectors, view models, or pure pipes. Event handlers such as `(click)="save()"` are acceptable.

## Validation Messages

- Render validation errors through the form or UI library's validation API rather than duplicating manual error blocks below each field.
- Register only application-specific validation messages locally. Use library defaults for standard validators such as `required`, `min`, `max`, `minlength`, `maxlength`, and `pattern` unless the product explicitly requires different wording.
- Keep the validation-message service a singleton and import library modules and services through their public entry points to avoid inconsistent dependency-injection instances.
- When adding a custom validator, add its localized message for every supported language.
- Display the first relevant active error once; do not render the same validation message through two mechanisms.

## Reactive Forms

- Centralize `FormGroup` creation in a form factory or another designated service when this is the repository convention. Components should receive or request configured forms rather than duplicating controls and validation rules.
- Do not repeatedly extract the same nested form object. Expose it through a non-private getter with an explicit return type and type assertion.
- A getter named `formGroup` needs no suffix. Otherwise use `FC` for `FormControl`, `FG` for `FormGroup`, and `FA` for `FormArray`.

```typescript
get validFromFC(): FormControl {
  return this.formGroup.get('validFrom') as FormControl;
}

get detailFG(): FormGroup {
  return this.formGroup.get('detail') as FormGroup;
}

get assignmentsFA(): FormArray {
  return this.formGroup.get('assignments') as FormArray;
}
```

- These getters are intended for component logic, not repeated template evaluation.

## Observable and Subscription Rules

- Do not call `.subscribe()` in components, store `Subscription` instances, or add `onDestroy$` and `takeUntil` solely to manage component subscriptions.
- Expose streams as observable properties and activate them with the `async` pipe. The template then owns subscription disposal.
- A deliberately empty template binding is acceptable when a template-owned stream exists only to trigger a necessary UI update.

```typescript
language$: Observable<void>;

this.language$ = this.languageService.currentLanguage$.pipe(
  map(() => this.setColumnDefinitions())
);
```

```html
<ng-container *ngIf="language$ | async"></ng-container>
```

- When several independent observables do not require ordered activation, group them into one template-local object.

```html
<ng-container *ngIf="{first: first$ | async, second: second$ | async} as values">
  <!-- Verify required nullable properties with an inner condition. -->
</ng-container>
```

- The object in this pattern is truthy even when its properties are `null`. Keep nested async conditions only when sequential creation or truthiness is part of the required behavior.
- Do not use `map(() => void 0)` merely to discard an emitted value or force `Observable<void>`. Preserve the original type when a stream orchestrates work through `tap`.
- Use `Observable<void>` only when the mapped operation itself returns `void`, such as rebuilding column definitions.
- Treat `valueChanges` and `statusChanges` the same way: expose the stream whenever the input form changes and activate it with `async` rather than manually replacing subscriptions.

```typescript
formChanges$: Observable<void>;

@Input()
set formGroup(formGroup: FormGroup) {
  this._formGroup = formGroup;
  this.formChanges$ = formGroup.valueChanges.pipe(
    map(() => this.syncDataSource())
  );
}
```

- Apply the same pattern to modal close streams: transform the close result, expose it as an observable, and bind it with `async`.
- Services may subscribe when they own an imperative external operation with no template owner.

## NgRx and Data Loading

- Use effects for backend calls and side effects.
- Components must not call generated API services directly. Dispatch feature actions, handle requests in effects, store results in reducers, and expose data through selectors.
- Reducers must be pure and must never mutate state.
- Keep selectors single-purpose: one state input and one selected value.
- Keep independent selector outputs as separate observable properties and bind each where it is used. Avoid composed selectors that return large view-model objects only for template convenience.
- When one observable must react to a primary value and read the latest values from other selectors, select them separately and use `withLatestFrom` in that orchestration stream.
- Do not inject the NgRx `Actions` stream into a component to observe a success action and dispatch a follow-up load.
- For a successful delete, include the deleted entity ID in the success action and update the collection and total count in the reducer. Existing selectors will update the component.
- A component owns orchestration of dependent data required by its view. If one selected entity determines another load, expose a template-activated observable using `tap` to dispatch the dependent action.
- Keep effects linear: a load action performs its API call and emits only its matching success or failure action. Do not create effect chains in which a load success automatically starts unrelated or view-specific loading.

## Reusable List Components

- Separate only behavior that truly differs between contexts.
- If all usages share the same feature store, filters, paging, sorting, and navigation, keep selectors and action dispatches in the reusable child component.
- Do not mechanically expose matching `@Input`/`@Output` pairs that every parent handles identically.
- If different routes load the same list from different endpoints, use simple route-specific containers. Each container dispatches its explicit load action and passes the resulting data into the reusable child through a data input.
- Use `@Output` only when a parent responds differently or owns a dependency the child should not know, such as opening a feature-specific modal.

## API Types, Enums, and Errors

- Prefer types generated by the application's API client. Do not create local interfaces that merely duplicate API response types.
- Introduce an application-specific model only for genuinely different domain data or an unavoidable transformation.
- Compare generated API enum values through the exported enum object, never through raw string literals.

```typescript
if (entity.status === EntityStatus.Active) {
  // ...
}
```

- Resolve backend errors centrally. Map stable backend error codes to localized messages and provide explicit fallback messages for other HTTP statuses.
- If error codes contain parameters, define and document a stable wire format and replace translation placeholders in their original order.
- Preserve entered data after request failures and show a localized, actionable error.

## Create and Update Flows

- Keep the user on the current form, modal, or wizard step until the backend confirms a successful create operation and returns the created entity.
- Navigate away only after the success response.
- On an HTTP error or missing response body, dispatch a failure action, display the error, and preserve the entered data.
- Derive edit, save, delete, and read-only permissions through a feature policy service when access depends on entity state. Avoid duplicating raw status comparisons across components, routes, lists, and resolvers.
- Load existing entities through feature actions, effects, and selectors. Components and resolvers should not bypass the state-management boundary by calling generated API services directly.

## Dates and Time Zones

- Know which date adapter the selected date-picker uses.
- For date-only API values such as `YYYY-MM-DD`, convert and serialize with explicit date semantics.
- If the application uses UTC date adapters, construct dates with UTC parts and serialize using UTC parts.
- Do not blindly convert local midnight with `toISOString()`, because the time-zone offset can shift a date by one day.

## Backend, Proxy, and Authentication

- Use the repository's development command when it starts Angular with a proxy configuration.
- Route local browser API requests through the frontend origin and development proxy unless the backend explicitly supports the required CORS configuration.
- Configure path rewriting when the public frontend API prefix differs from the backend's local paths.
- Keep service base URLs in environment or runtime configuration. Do not hard-code local backend URLs in components or generated-client consumers.
- Import the module that registers authentication interceptors; exporting it from another module alone does not instantiate its providers.
- Verify protected requests contain the expected authorization header.
- Distinguish Angular development-server and live-reload traffic from backend API calls during debugging.

## Coding Rules

- Follow KISS: optimize for clarity to a reader who did not write the code, not for the fewest lines.
- Follow YAGNI: do not add functionality that is not currently required.
- Follow DRY without premature abstraction. Keep code simple enough that meaningful duplication is visible before extracting shared behavior.
- Do not duplicate string literals. Keep repeated component-specific values in a local readonly constant or object. Put values shared across the application, or values representing business terminology, in a central data file.
- Do not use nested ternary expressions. Split complex conditions into `if`/`else`, a helper function, or clearly named variables.
- Follow the repository's existing formatting, linting, naming, and indentation rules.
- Write new source comments and project documentation in the language selected by the repository.
- Keep comments focused on intent, constraints, and non-obvious tradeoffs. Do not narrate straightforward code.

## Testing

- Follow the testing scope defined by the repository or the relevant feature specification.
- Prioritize automated tests for services and pure application logic such as pipes, validators, policy services, reducers, selectors, and isolated utilities.
- Add component, template, integration, and end-to-end tests when the specification or risk of the behavior requires them.
- When required coverage is unclear, document the expected behavior in the relevant specification before adding a new test category.
- Run the smallest relevant test suite while developing, then run the repository's required verification commands before declaring the work complete.
