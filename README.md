# Aura: Bio-Adaptive Gym Optimizer

> "Train in sync with your biology."

Aura is a biological prime time performance dashboard and AI health coach that aligns your gym training with your circadian rhythm and daily recovery state. It uses predictive modeling to determine your peak strength window and provides real-time "Go/No-Go" readiness scores to prevent overtraining and maximize gains.

## 🌟 Key Features

### 🕰️ Biological Prime Time
Aura models your **24-hour energy clock** based on your chronotype and wake time. It identifies your **Peak Window**—the specific 4-5 hour block where your body temperature, grip strength, and reaction time are naturally highest (typically 6-11 hours post-wake).

### 🚦 Go/No-Go Readiness System
A daily readiness score (0-100) computed from:
-   **Sleep Duration**: Compared against your age-adjusted target.
-   **Stress Levels**: Self-reported daily stress (1-10).
-   **Soreness**: Muscle-specific recovery status.
-   **RPE**: Rate of Perceived Exertion from yesterday's session.

The system outputs a clear directive:
-   🟢 **Green**: High intent, PR attempts allowed.
-   🟡 **Yellow**: Maintenance volume, technique focus.
-   🔴 **Red**: Active recovery or rest day required.

### 🤖 Dual-Mode AI Coach
An intelligent chat interface with two distinct personalities:
-   **Coach Aura**: Empathetic, science-based, and encouraging. Focuses on longevity and smart programming.
-   **Satima**: A hardcore, "no-excuses" mode for when you need a push (inspired by a certain hero for fun).

### 🗺️ Interactive Body Map
Visual soreness tracking for 13 major muscle groups. Log soreness with a tap to feed the recovery algorithm, which adjusts future readiness scores and suggests muscle groups to rest.

### 🔄 Full-Stack Data Sync
-   **Real-time State**: MongoDB handles user sessions and immediate app state.
-   **Long-term Warehousing**: Snowflake stores historical logs for deep-learning analysis and trend prediction.

## 🛠️ Tech Stack

-   **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS 4, Framer Motion
-   **Visuals**: Three.js (via React Three Fiber) for 3D elements, Chart.js for data visualization
-   **Database**: MongoDB (via Mongoose), Snowflake SDK
-   **AI**: Google Gemini 2.0 Flash (Generative Content), ElevenLabs (Text-to-Speech integration planned/in-progress)
-   **Auth**: NextAuth.js

## 🚀 Getting Started

### Prerequisites
-   Node.js 20+
-   npm or pnpm
-   MongoDB Atlas account
-   Google Gemini API Key
-   Snowflake Account (Optional for warehousing features)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/aura.git
    cd aura
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables**
    Create a `.env.local` file in the root directory:
    ```bash
    # Auth
    NEXTAUTH_URL=http://localhost:3000
    NEXTAUTH_SECRET=your_nextauth_secret

    # Database
    MONGODB_URI=mongodb+srv://...

    # AI
    GEMINI_API_KEY=your_gemini_api_key

    # Snowflake (Optional)
    SNOWFLAKE_ACCOUNT=your_account
    SNOWFLAKE_USERNAME=your_username
    SNOWFLAKE_PASSWORD=your_password
    SNOWFLAKE_WAREHOUSE=COMPUTE_WH
    SNOWFLAKE_DATABASE=AURA
    ```

4.  **Run the development server**
    ```bash
    npm run dev
    ```

5.  **Open the app**
    Navigate to [http://localhost:3000](http://localhost:3000)

## 📂 Project Structure

-   `app/` - Next.js App Router pages and API routes.
    -   `api/` - Backend logic for logs, AI chat, and auth.
    -   `dashboard/` - Main user interface.
    -   `coach/` - AI coaching interface.
-   `components/` - React components.
    -   `aura/` - Core application components (BodyMap, EnergyClock, etc.).
    -   `ui/` - Reusable UI elements (buttons, cards).
-   `lib/` - Utility functions and database clients.
    -   `gemini.ts` - Google AI client configuration.
    -   `snowflake.ts` - Data warehousing logic.
    -   `recovery.ts` - Algorithms for calculating readiness and soreness.
-   `types/` - TypeScript interface definitions for robust data handling.

## 📄 License

This project is licensed under the MIT License.
