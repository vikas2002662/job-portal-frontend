# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)















# Job Portal — Tailwind CSS Version

## File Structure

```
src/
├── App.jsx
├── index.css                        ← Tailwind directives + Google Fonts
├── components/
│   ├── Navbar.jsx
│   ├── ResumeModal.jsx              ← Pops up when "Apply Now" is clicked
│   └── ProtectedRoute.jsx
└── pages/
    ├── Login.jsx
    ├── Register.jsx
    ├── Jobs.jsx
    ├── Dashboard.jsx
    ├── AddJob.jsx
    ├── EditJob.jsx
    └── UploadResume.jsx

tailwind.config.js                   ← Custom tokens (colors, fonts, animations)
```

## Setup

### 1. Install Tailwind CSS (if not already)
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 2. Replace tailwind.config.js
Use the provided `tailwind.config.js` — it adds custom color tokens and font families so you can use shorthand like `text-gold`, `bg-card`, `bg-navy`, etc.

### 3. Replace your index.css
Use the provided `index.css` — it includes the Google Fonts import and Tailwind directives.

### 4. Import index.css in main.jsx
```js
import "./index.css";
```

### 5. Drop all component and page files into src/
No other dependencies needed beyond what you already have.

---

## Key Design Details

### Colors (defined in tailwind.config.js)
| Token         | Value     | Usage                     |
|---------------|-----------|---------------------------|
| `navy`        | #0B1829   | Page background           |
| `card`        | #112033   | Card / panel backgrounds  |
| `navy3`       | #0E1C2D   | Input backgrounds         |
| `border`      | #1E2E42   | All borders               |
| `gold`        | #C9963A   | Primary accent / CTA      |
| `gold-light`  | #E8B55A   | Hover state for gold      |
| `cream`       | #F7F4EE   | Body text                 |
| `muted`       | #7A8899   | Secondary text / labels   |
| `green`       | #1A8C5A   | Success states            |
| `green-light` | #4CC98A   | Success text              |

### Fonts
- **Playfair Display** — headings (apply via `font-serif` or inline `style`)
- **DM Sans** — all body text (`font-sans`)

### Login ↔ Register
Both pages share the same two-panel layout. The tab group uses `<Link>` to cross-navigate. "Create one" / "Sign in" links also cross-link.

### Resume Upload on Apply
Clicking **Apply Now** opens `ResumeModal`. The user must attach a PDF/DOC/DOCX (≤5 MB) before submitting. On confirm: uploads resume then posts application. Button becomes **✓ Applied**.

### No Logic Changes
All service imports (`authService`, `jobService`, `api`, `utils/auth`) are identical to the original code.