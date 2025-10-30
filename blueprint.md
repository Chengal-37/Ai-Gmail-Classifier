
# AI Email Classifier - Blueprint

## Overview

This application is an AI-powered email classifier that connects to a user's Gmail account, fetches their emails, and uses a large language model to classify them into predefined categories. The goal is to help users quickly identify and prioritize important emails.

## Design & Style

The application uses a modern, clean design with a dynamic gradient background. The UI is built with Bootstrap 5 to ensure responsiveness and a consistent look and feel.

*   **Typography:** The primary font is "Inter", a clean and readable sans-serif font.
*   **Color Palette:**
    *   **Primary:** A vibrant blue, used for key interactive elements.
    *   **Background:** A subtle, animated gradient that shifts between shades of dark blue and purple.
    *   **Text:** White and light gray for high contrast and readability.
*   **Layout:** The layout is centered and responsive, with a "glassmorphism" card effect for the main sign-in panel.

## Implemented Features (v1.1)

*   **OAuth Authentication:** Secure sign-in using NextAuth.js with the Google provider. Users can grant the application read-only access to their Gmail account.
*   **Bootstrap Integration:** The project is fully integrated with Bootstrap 5 for styling, replacing Tailwind CSS.
*   **Dynamic UI:** The UI shows a loading state while the session is being initialized and a sign-in page for unauthenticated users. Once authenticated, it displays the main application view.
*   **Sign-Out:** A prominent sign-out button allows users to securely log out.
*   **Email Fetching & Display:** Fetches and displays a list of emails from the user's Gmail account.
*   **AI-Powered Classification:** Classifies emails into categories (Important, Promotional, Social, Spam) using a large language model.
*   **Detailed Classification View:** Displays the classification category, confidence score, and the reasoning behind the classification.
*   **Slide-in Email Detail:** Shows the full email content in a slide-in panel when an email is clicked.
*   **Scroll Lock:** Prevents the background from scrolling when the email detail panel is open.

## Future Enhancements

*   **Customizable Categories:** Allow users to define their own classification categories.
*   **Batch Actions:** Enable users to perform actions on multiple emails at once (e.g., delete, archive).
*   **Real-time Classification:** Automatically classify new emails as they arrive.
