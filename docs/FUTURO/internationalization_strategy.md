# Internationalization (i18n) Strategy for IT CARGO Platform

## 1. Goals

*   Support multiple languages, prioritizing Spanish (Argentina) as the default and initial primary language.
*   Allow users to experience the platform in their preferred language.
*   Ensure a scalable and maintainable approach to adding and managing translations.
*   Provide a good user experience for language selection and display.

## 2. Core Strategy

*   **Primary Language**: Spanish (Argentina variant, `es-AR` or `es`). This will be the fallback language.
*   **Initial Additional Language**: English (`en`).
*   **Language Detection Order**:
    1.  User's explicit preference (stored in `localStorage` and potentially user profile settings in DB for logged-in users).
    2.  Browser's preferred language settings (`navigator.language` or `navigator.languages[0]`).
    3.  Fallback to Spanish if no preference or supported browser language is found.
*   **Technology Stack**:
    *   `i18next`: Core internationalization library.
    *   `react-i18next`: React bindings for `i18next` (hooks, components).
    *   `i18next-browser-languagedetector`: Plugin for detecting user language from browser settings, `localStorage`, `navigator`.
    *   `i18next-http-backend`: Plugin for loading translation files from a server or public folder.

## 3. Translation File Structure & Management

*   **Format**: JSON.
*   **Location**: `public/locales/{lng}/{ns}.json`
    *   `{lng}`: Language code (e.g., `es`, `en`).
    *   `{ns}`: Namespace (e.g., `common`, `auth`, `dashboard`, `registration`). Namespacing helps organize translations and allows for loading only necessary translations for a given view.
*   **Example Structure**:
    ```
    public/
    └── locales/
        ├── es/
        │   ├── common.json         // Common terms: Yes, No, Save, Cancel, errors
        │   ├── auth.json           // Login, logout, password reset
        │   ├── registration.json   // Registration form labels, messages
        │   ├── dashboard.json      // Dashboard specific terms
        │   └── shipments.json      // Terms related to shipments
        ├── en/
        │   ├── common.json
        │   ├── auth.json
        │   ├── registration.json
        │   ├── dashboard.json
        │   └── shipments.json
    ```
*   **Content**: Key-value pairs. Keys should be descriptive.
    *   Example `es/registration.json`:
        ```json
        {
          "formTitle": "Solicitud de Registro",
          "emailLabel": "Correo Electrónico",
          "emailPlaceholder": "tuemail@ejemplo.com",
          "submitButton": "Enviar Solicitud",
          "errorRequired": "Este campo es obligatorio.",
          "errorEmailInvalid": "Por favor, introduce un correo electrónico válido."
        }
        ```
*   **Translation Process (Future)**:
    *   For new languages, consider using professional translation services or community contributions.
    *   Tools like Lokalise, Phrase, or SimpleLocalize can help manage translation workflows if the number of languages/strings grows significantly.

## 4. Implementation Steps (React)

1.  **Install Dependencies**:
    ```bash
    npm install i18next react-i18next i18next-browser-languagedetector i18next-http-backend
    ```
2.  **Create `i18n.ts` configuration file** (e.g., in `src/lib/` or `src/config/`):
    ```typescript
    import i18n from 'i18next';
    import { initReactI18next } from 'react-i18next';
    import LanguageDetector from 'i18next-browser-languagedetector';
    import HttpApi from 'i18next-http-backend';

    i18n
      .use(HttpApi) // Load translations using http (from public/locales)
      .use(LanguageDetector) // Detect user language
      .use(initReactI18next) // Pass the i18n instance to react-i18next
      .init({
        supportedLngs: ['es', 'en'], // Supported languages
        fallbackLng: 'es',          // Fallback language
        defaultNS: 'common',        // Default namespace
        ns: ['common', 'auth', 'registration', 'dashboard', 'shipments'], // Available namespaces
        backend: {
          loadPath: '/locales/{{lng}}/{{ns}}.json', // Path to translation files
        },
        detection: {
          order: ['localStorage', 'navigator', 'htmlTag'], // Order of detection
          caches: ['localStorage'],                     // Cache detected language in localStorage
          lookupLocalStorage: 'i18nextLng',             // localStorage key
        },
        react: {
          useSuspense: true, // Recommended for loading translations
        },
        interpolation: {
          escapeValue: false, // React already protects from XSS
        },
        debug: import.meta.env.DEV, // Enable debug output in development
      });

    export default i18n;
    ```
3.  **Import `i18n.ts` in `main.tsx`**:
    ```typescript jsx
    // src/main.tsx
    import React from 'react';
    import ReactDOM from 'react-dom/client';
    import App from './App';
    import './i18n'; // Initialize i18next
    // ... other imports

    ReactDOM.createRoot(document.getElementById('root')!).render(
      <React.StrictMode>
        <React.Suspense fallback="Loading..."> {/* Or a dedicated loading spinner component */}
          <App />
        </React.Suspense>
      </React.StrictMode>,
    );
    ```
    *Note: `React.Suspense` is used here to handle the async loading of translation files.*

4.  **Using Translations in Components**:
    ```typescript jsx
    // src/components/auth/LoginForm.tsx
    import { useTranslation } from 'react-i18next';

    function LoginForm() {
      const { t } = useTranslation(['auth', 'common']); // Load 'auth' and 'common' namespaces

      return (
        <form>
          <label htmlFor="email">{t('auth:emailLabel')}</label> {/* Using namespace prefix */}
          <input type="email" id="email" placeholder={t('auth:emailPlaceholder')} />
          <button type="submit">{t('common:submitButton')}</button>
        </form>
      );
    }
    export default LoginForm;
    ```
5.  **Language Switcher Component (Optional but Recommended)**:
    *   Create a component that allows users to explicitly change the language.
    *   Use `i18n.changeLanguage('en')` to switch languages.
    ```typescript jsx
    // src/components/ui/LanguageSwitcher.tsx
    import { useTranslation } from 'react-i18next';

    function LanguageSwitcher() {
      const { i18n } = useTranslation();

      const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
      };

      return (
        <div>
          <button onClick={() => changeLanguage('es')} disabled={i18n.resolvedLanguage === 'es'}>
            Español
          </button>
          <button onClick={() => changeLanguage('en')} disabled={i18n.resolvedLanguage === 'en'}>
            English
          </button>
        </div>
      );
    }
    export default LanguageSwitcher;
    ```

## 5. Considerations for IT CARGO

*   **Right-to-Left (RTL) Languages**: Not an immediate concern, but if languages like Arabic or Hebrew are added, CSS adjustments for layout will be needed.
*   **Pluralization**: `i18next` supports complex pluralization rules for different languages.
*   **Date/Number Formatting**: These are locale-sensitive. Libraries like `date-fns` or `Intl` (native browser API) should be used, and `i18next` can integrate with them or provide formatting helpers. For example, `t('date', { val: new Date(), format: 'short' })`.
*   **Accessibility (ARIA)**: Ensure `lang` attribute on `<html>` tag is updated dynamically.
*   **SEO**: If public-facing pages need to be indexed in multiple languages, ensure appropriate `hreflang` tags are set.
*   **Content from Database**: For dynamic content coming from the database (e.g., product descriptions, company names), if this content needs to be multilingual:
    *   **Option A (JSON in one column)**: Store translations in a JSONB column (e.g., `name_translations: {"es": "Nombre ES", "en": "Name EN"}`). The backend/frontend then selects the appropriate string.
    *   **Option B (Separate Translation Tables)**: Less common for simple fields, more for extensive content. (e.g., `products_translations` table).
    *   For IT CARGO, user-generated content like company names, product details, etc., will initially be in the language they are entered in. True multilingual support for DB content is a larger effort. Focus initially on UI translations.
*   **Keeping Translations Up-to-Date**: Establish a process for adding new keys and translating them when new UI features are developed.

## 6. Initial Implementation Plan

1.  Set up the basic `i18next` configuration and folder structure.
2.  Create initial `es/common.json` and `en/common.json`.
3.  Integrate i18n into the new **Registration Form** as the first component to use it.
4.  Gradually refactor existing UI components to use `i18next` as they are touched or as a dedicated effort.
5.  Develop the `LanguageSwitcher` component and add it to a suitable place (e.g., settings, footer).

This strategy provides a robust foundation for a multilingual IT CARGO platform.

## 7. Record of Initial Setup Attempt (For Future Reference)

This section documents an initial attempt to set up i18next, the steps taken, and issues encountered. This is for future reference when the i18n feature is actively developed. **No i18n code is currently active in the project from this attempt.**

### 7.1. Steps Taken (Attempted)

1.  **Dependency Installation:**
    The following command was run to install necessary packages:
    ```bash
    npm install i18next react-i18next i18next-browser-languagedetector i18next-http-backend
    ```

2.  **Configuration File Creation (`src/lib/i18n.ts`):**
    A configuration file was created:
    ```typescript
    // src/lib/i18n.ts
    import i18n from 'i18next';
    import { initReactI18next } from 'react-i18next';
    import LanguageDetector from 'i18next-browser-languagedetector';
    import HttpApi from 'i18next-http-backend';

    i18n
      .use(HttpApi)
      .use(LanguageDetector)
      .use(initReactI18next)
      .init({
        supportedLngs: ['es', 'en'],
        fallbackLng: 'es',
        defaultNS: 'common',
        ns: ['common', 'registration'], // Added 'registration'
        backend: {
          loadPath: '/locales/{{lng}}/{{ns}}.json',
        },
        detection: {
          order: ['localStorage', 'navigator', 'htmlTag'],
          caches: ['localStorage'],
          lookupLocalStorage: 'i18nextLng',
        },
        react: {
          useSuspense: true,
        },
        interpolation: {
          escapeValue: false,
        },
        debug: import.meta.env.DEV,
      });

    export default i18n;
    ```

3.  **Update `src/main.tsx`:**
    The `main.tsx` file was modified to import the i18n configuration and wrap the `App` component with `React.Suspense`. The attempted modification looked like this:
    ```diff
    // src/main.tsx
    import React from 'react';
    import ReactDOM from 'react-dom/client';
    import App from './App.tsx';
    - import "./index.css";
    import { BrowserRouter } from "react-router-dom";
    import { Toaster } from 'sonner';
    + import './globals.css'; // This line was added
    + import './lib/i18n';    // This line was added
    import { ThemeProvider } from './components/utils/theme-provider';
    import { AuthProvider } from './hooks/useAuth';

    // ... other code ...

    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
    +    <React.Suspense fallback="Loading...">
          <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
            <AuthProvider>
              <BrowserRouter basename={basename}>
                <Toaster position="top-right" richColors />
                <App />
              </BrowserRouter>
            </AuthProvider>
          </ThemeProvider>
    +    </React.Suspense>
      </React.StrictMode>,
    );
    ```
    *Note: The actual diff might have varied slightly, but the key additions were the `./globals.css` import, `./lib/i18n` import, and `React.Suspense` wrapper.*

4.  **Creation of Translation Files:**
    JSON translation files were created in `public/locales/`:
    *   `public/locales/es/common.json`
    *   `public/locales/en/common.json`
    *   `public/locales/es/registration.json`
    *   `public/locales/en/registration.json`
    (Contents of these files included common UI terms and registration-specific labels.)

### 7.2. Error Encountered

During the Vite build/dev server startup, the following error occurred:
```
[vite] Pre-transform error: Failed to resolve import "./globals.css" from "src/main.tsx". Does the file exist?
  Plugin: vite:import-analysis
  File: D:/Grupo Pen/IT CARGO/SFTW/SFTW-tempo/src/main.tsx:X:Y (line/col varied)
  ...
  import './globals.css'; // Assuming global styles are here
         ^
```

### 7.3. Analysis of the Error

*   The error `Failed to resolve import "./globals.css"` indicates that Vite could not find a file named `globals.css` directly within the `src` directory (`src/globals.css`).
*   The project's `src/main.tsx` file already contains `import "./index.css";`. This `index.css` file is typically the main entry point for global styles in Vite projects, often including Tailwind CSS directives (`@tailwind base; @tailwind components; @tailwind utilities;`).
*   The addition of `import './globals.css';` was likely an error if `src/index.css` already fulfills the role of global styling. If a separate `globals.css` was intended, it was not created or was misplaced.

### 7.4. Recommended Fix for Future Implementation

When proceeding with i18n implementation in the future:

1.  **Verify Global CSS Setup**:
    *   Determine if `src/index.css` contains all necessary global styles and Tailwind directives.
    *   If `src/index.css` is sufficient, **do not** add an extra `import './globals.css';` line in `src/main.tsx`.
    *   If a separate `src/globals.css` is genuinely needed for additional global styles not covered by `index.css` or component-level styles, ensure this file is created in the `src` directory and properly populated.

2.  **Correct `src/main.tsx` Imports**:
    *   Ensure `./lib/i18n` is imported.
    *   Wrap the application with `<React.Suspense fallback="Loading...">` (or a more sophisticated loading component) to handle the asynchronous loading of translation files. A typical structure would be:

    ```typescript jsx
    // src/main.tsx (Corrected approach for future)
    import React from 'react';
    import ReactDOM from 'react-dom/client';
    import App from './App.tsx';
    import "./index.css"; // Main global styles
    import { BrowserRouter } from "react-router-dom";
    import { Toaster } from 'sonner';
    import './lib/i18n'; // Initialize i18next
    import { ThemeProvider } from './components/utils/theme-provider';
    import { AuthProvider } from './hooks/useAuth';

    const rootElement = document.getElementById("root");
    if (rootElement) {
      ReactDOM.createRoot(rootElement).render(
        <React.StrictMode>
          <React.Suspense fallback={<div>Loading translations...</div>}> {/* Suspense for i18n */}
            <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
              <AuthProvider>
                <BrowserRouter basename={import.meta.env.BASE_URL}>
                  <Toaster position="top-right" richColors />
                  <App />
                </BrowserRouter>
              </AuthProvider>
            </ThemeProvider>
          </React.Suspense>
        </React.StrictMode>,
      );
    }
    ```

3.  **Ensure `public/locales` Folder Structure**:
    Confirm that the `public/locales/{lng}/{ns}.json` structure is correctly set up and accessible by the `i18next-http-backend`. The `loadPath` in `i18n.ts` must point to the correct location.

By following these revised steps, the i18n implementation should proceed more smoothly in the future, avoiding the `globals.css` resolution error. 