# AI Email Classifier

This is a web application built with Next.js that leverages the power of AI to automatically classify your Gmail emails. It provides a modern, secure, and intuitive interface to view your latest emails and see them categorized into labels like "Important," "Promotional," and "Spam," complete with AI-generated reasoning.

![AI Email Classifier Screenshot](https://storage.googleapis.com/static.aifire.dev/gmail-ai-classifier-screenshot.png)

## ✨ Features

*   **Secure Google Sign-In:** Authenticates users securely using their Google account via NextAuth.js and OAuth 2.0.
*   **Fetch Latest Emails:** Connects to the Gmail API to fetch and display a user's most recent emails.
*   **AI-Powered Classification:** Uses the OpenAI API (with GPT-3.5-Turbo) to analyze email content and classify it into categories:
    *   Important
    *   Promotional
    *   Social
    *   Spam
    *   General
*   **Detailed Insights:** Displays the classification category, a confidence score, and the AI's reasoning for each email.
*   **Dynamic API Key Management:** Allows users to provide their OpenAI API key upon sign-in and update it anytime from their profile without logging out. The key is stored securely in the browser's local storage.
*   **Modern & Responsive UI:** A sleek, dark-themed interface built with Bootstrap and React, featuring animated gradients and a user-friendly layout that works on all screen sizes.

## 🛠️ Tech Stack

*   **Framework:** [Next.js](https://nextjs.org/)
*   **Authentication:** [NextAuth.js](https://next-auth.js.org/)
*   **APIs:** [Google API (Gmail)](https://developers.google.com/gmail/api), [OpenAI API](https://openai.com/docs)
*   **Styling:** [Bootstrap](https://getbootstrap.com/), [React Icons](https://react-icons.github.io/react-icons/)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **Validation:** [Zod](https://zod.dev/)

## 🚀 Getting Started

Follow these instructions to set up and run the project locally.

### Prerequisites

*   [Node.js](https://nodejs.org/en) (v18 or later)
*   [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
*   A Google Account with the Gmail API enabled.
*   An OpenAI API key.

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/ai-email-classifier.git
    cd ai-email-classifier
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up Environment Variables:**
    Create a file named `.env.local` in the root of the project and add the following variables.

    ```env
    # Google OAuth Credentials
    GOOGLE_CLIENT_ID=your_google_client_id
    GOOGLE_CLIENT_SECRET=your_google_client_secret

    # NextAuth.js Configuration
    NEXTAUTH_SECRET=a_secure_random_string_for_session_encryption
    NEXTAUTH_URL=http://localhost:3000
    ```

    *   **To get `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`:**
        1.  Go to the [Google Cloud Console](https://console.cloud.google.com/).
        2.  Create a new project.
        3.  Go to "APIs & Services" > "Credentials".
        4.  Create an "OAuth client ID" credential.
        5.  Select "Web application" as the type.
        6.  Add `http://localhost:3000` to the "Authorized JavaScript origins".
        7.  Add `http://localhost:3000/api/auth/callback/google` to the "Authorized redirect URIs".
        8.  Copy the generated Client ID and Client Secret.
    *   **To get `NEXTAUTH_SECRET`:**
        You can generate a suitable secret using the command `openssl rand -hex 32` in your terminal.

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

5.  **Open the application:**
    Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## Usage

1.  On the welcome screen, enter your OpenAI API key.
2.  Click "Sign in with Google" and follow the authentication flow.
3.  Once logged in, your latest emails will be fetched and displayed.
4.  Click the "Classify Emails" button to start the AI classification process.
5.  To update your API key, click the "Update Key" button in the header.
