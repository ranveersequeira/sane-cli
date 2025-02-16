#!/usr/bin/env node
import inquirer from "inquirer";
import { execa } from "execa";
import fs from "fs";
import path from "path";
import chalk from "chalk";
import ora from "ora";

const jokes = [
  "Why do programmers prefer dark mode? Because light attracts bugs!",
  "Why did the developer go broke? Because he used up all his cache!",
  "Why do programmers always mix up Christmas and Halloween? Because Oct 31 == Dec 25!",
  "Why was the JavaScript developer sad? Because he didn't Node how to Express himself!",
  "Why did the React component feel lost? Because it didn't know its state in life!",
];

function getRandomJoke() {
  return jokes[Math.floor(Math.random() * jokes.length)];
}

async function runCommand(command, args, cwd) {
  try {
    await execa(command, args, { stdio: "inherit", cwd });
  } catch (error) {
    console.error(chalk.red(`❌ Error running ${command} ${args.join(" ")}:`), error.message);
    process.exit(1);
  }
}

async function createProject() {
  console.log(chalk.bold.cyan("\n🚀 Welcome to the Ultimate Vite React CLI! Let's build something awesome!\n"));
  console.log(chalk.yellow(getRandomJoke()));
  console.log("\n");

  const { projectName, useTypeScript } = await inquirer.prompt([
    { type: "input", name: "projectName", message: "Enter project name:", default: "my-vite-app" },
    { type: "confirm", name: "useTypeScript", message: "Do you want to use TypeScript?", default: true },
  ]);

  const projectPath = path.join(process.cwd(), projectName);

  const spinner = ora("Creating Vite React project...").start();
  await runCommand("npm", [
    "create",
    "vite@latest",
    projectName,
    "--",
    "--template",
    useTypeScript ? "react-ts" : "react",
  ]);
  const fileExtension = useTypeScript ? "tsx" : "jsx";
  spinner.succeed("Vite React project created successfully!");

  process.chdir(projectPath);

  spinner.start("Installing dependencies...");
  await runCommand("npm", ["install"]);
  spinner.succeed("Dependencies installed successfully!");

  spinner.start("Installing commonly used libraries...");
  await runCommand("npm", ["install", "axios", "react-router-dom", "date-fns", "lodash"]);
  spinner.succeed("Common libraries installed successfully!");


  const { installTailwind } = await inquirer.prompt([
    { type: "confirm", name: "installTailwind", message: "Do you want to install Tailwind CSS?", default: true },
  ]);

  if (installTailwind) {
    spinner.start("Installing and configuring Tailwind CSS...");
    await runCommand("npm", ["install", "tailwindcss", "@tailwindcss/vite"]);

    const tailwindConfig = `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}`;

    fs.writeFileSync("tailwind.config.js", tailwindConfig);

    const cssContent = `
@import "tailwindcss";
@tailwind base;
@tailwind components;
@tailwind utilities;`;

    fs.writeFileSync("src/index.css", cssContent);

    // Update Vite config
    const viteConfig = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(),
    tailwindcss(),
],
})`;

    fs.writeFileSync("vite.config.js", viteConfig);

    spinner.succeed("Tailwind CSS installed and configured successfully!");
  } else {
    console.log(chalk.red("\n😱 Oh no! You're choosing to die by a thousand inline styles. May the CSS gods have mercy on your soul!"));
  }

  const { componentLibrary } = await inquirer.prompt([
    {
      type: "list",
      name: "componentLibrary",
      message: "Choose a component library:",
      choices: ["Ant Design 5", "MUI", "None"],
    },
  ]);

  if (componentLibrary === "Ant Design 5") {
    spinner.start("Installing Ant Design...");
    await runCommand("npm", ["install", "antd"]);
    spinner.succeed("Ant Design installed successfully!");
  } else if (componentLibrary === "MUI") {
    spinner.start("Installing MUI...");
    await runCommand("npm", ["install", "@mui/material", "@emotion/react", "@emotion/styled"]);
    spinner.succeed("MUI installed successfully!");
  }

  const { installRedux } = await inquirer.prompt([
    { type: "confirm", name: "installRedux", message: "Do you want to install Redux Toolkit?", default: true },
  ]);

  if (installRedux) {
    spinner.start("Installing and configuring Redux Toolkit...");
    await runCommand("npm", ["install", "@reduxjs/toolkit", "react-redux"]);

    const storeContent = `import { configureStore } from "@reduxjs/toolkit";
import exampleSlice from "./exampleSlice";

export const store = configureStore({
  reducer: { example: exampleSlice },
});`;

    const sliceContent = `import { createSlice } from "@reduxjs/toolkit";

const initialState = { value: 0 };

const exampleSlice = createSlice({
  name: "example",
  initialState,
  reducers: {
    increment: (state) => { state.value += 1; },
    decrement: (state) => { state.value -= 1; },
  },
});

export const { increment, decrement } = exampleSlice.actions;
export default exampleSlice.reducer;`;

    fs.mkdirSync("src/store", { recursive: true });
    fs.writeFileSync(useTypeScript ? "src/store/store.ts" : "src/store/store.js", storeContent);
    fs.writeFileSync(useTypeScript ? "src/store/exampleSlice.ts" : "src/store/exampleSlice.js", sliceContent);

    spinner.succeed("Redux Toolkit installed and configured successfully!");
  }

  const { projectType } = await inquirer.prompt([
    {
      type: "list",
      name: "projectType",
      message: "What type of project are you building?",
      choices: ["Small", "Large"],
    },
  ]);

  if (projectType === "Large") {
    const { dataFetchingLibrary } = await inquirer.prompt([
      {
        type: "list",
        name: "dataFetchingLibrary",
        message: "Choose a data fetching library:",
        choices: ["React Query", "SWR", "None"],
      },
    ]);

    if (dataFetchingLibrary === "React Query") {
      spinner.start("Installing and configuring React Query...");
      await runCommand("npm", ["install", "@tanstack/react-query"]);
      await runCommand("npm", ["install", "-D", "@tanstack/eslint-plugin-query"]);

      const hookContent = `import { useQuery } from "@tanstack/react-query";

export function useFetchData(queryKey, fetchData) {
  return useQuery(queryKey, fetchData);
}`;

      fs.mkdirSync("src/hooks", { recursive: true });
      fs.writeFileSync(useTypeScript ? "src/hooks/useFetchData.ts" : "src/hooks/useFetchData.js", hookContent);

      spinner.succeed("React Query installed and configured successfully!");
    } else if (dataFetchingLibrary === "SWR") {
      spinner.start("Installing and configuring SWR...");
      await runCommand("npm", ["install", "swr"]);

      const hookContent = `import useSWR from "swr";

export function useFetchData(url) {
  const { data, error } = useSWR(url);
  return { data, error };
}`;

      fs.mkdirSync("src/hooks", { recursive: true });
      fs.writeFileSync(useTypeScript ? "src/hooks/useFetchData.ts" : "src/hooks/useFetchData.js", hookContent);

      spinner.succeed("SWR installed and configured successfully!");
    }
  }



  spinner.start("Setting up folder structure and React Router...");
  fs.mkdirSync("src/components", { recursive: true });
  fs.mkdirSync("src/pages", { recursive: true });
  fs.mkdirSync("src/layouts", { recursive: true });
  fs.mkdirSync("src/hooks", { recursive: true });
  fs.mkdirSync("src/utils", { recursive: true });

  // Create layout components
  const headerContent = `export default function Header() {
  return (
    <header className="bg-gray-800 text-white p-4">
      <h1 className="text-2xl">My Awesome App</h1>
    </header>
  );
}`;
  fs.writeFileSync(`src/components/Header.${fileExtension}`, headerContent);

  const sideMenuContent = `import { Link } from 'react-router-dom';

export default function SideMenu() {
  return (
    <nav className="bg-gray-200 p-4 h-full">
      <ul>
        <li><Link to="/" className="block py-2">Home</Link></li>
        <li><Link to="/about" className="block py-2">About</Link></li>
        <li><Link to="/dashboard" className="block py-2">Dashboard</Link></li>
      </ul>
    </nav>
  );
}`;
  fs.writeFileSync(`src/components/SideMenu.${fileExtension}`, sideMenuContent);

  const layoutContent = `import Header from '../components/Header';
import SideMenu from '../components/SideMenu';

export default function Layout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex flex-1">
        <SideMenu />
        <main className="flex-1 p-4">
          {children}
        </main>
      </div>
    </div>
  );
}`;
  fs.writeFileSync(`src/layouts/Layout.${fileExtension}`, layoutContent);

  // Create pages
  const homePageContent = `export default function HomePage() {
  return <h1 className="text-2xl">Welcome to the Home Page</h1>;
}`;
  fs.writeFileSync(`src/pages/HomePage.${fileExtension}`, homePageContent);

  const aboutPageContent = `export default function AboutPage() {
  return <h1 className="text-2xl">About Us</h1>;
}`;
  fs.writeFileSync(`src/pages/AboutPage.${fileExtension}`, aboutPageContent);

  const dashboardPageContent = `export default function DashboardPage() {
  return <h1 className="text-2xl">Dashboard (Protected Route)</h1>;
}`;
  fs.writeFileSync(`src/pages/DashboardPage.${fileExtension}`, dashboardPageContent);

  // Create PrivateRoute component
  const privateRouteContent = `import { Navigate } from 'react-router-dom';

// This is a dummy authentication check. In a real app, you'd use a proper auth system.
const isAuthenticated = () => {
  return localStorage.getItem('token') !== null;
};

export default function PrivateRoute({ children }) {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
}`;
  fs.writeFileSync(`src/components/PrivateRoute.${fileExtension}`, privateRouteContent);

  // Set up React Router with layout
  const appContent = `import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './layouts/Layout';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import DashboardPage from './pages/DashboardPage';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route 
            path="/dashboard" 
            element={
              <PrivateRoute>
                <DashboardPage />
              </PrivateRoute>
            } 
          />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;`;

  fs.writeFileSync(`${useTypeScript ? "src/App.tsx" : "src/App.jsx"}`, appContent);

  spinner.succeed("Folder structure, layout, and React Router set up successfully!");

  console.log(chalk.green.bold("\n✨ Setup complete! Your awesome project is ready to go!"));
  console.log(chalk.cyan("\nProject structure:"));
  console.log(chalk.yellow(`
  src/
    ├── components/
    │   ├── Header.${fileExtension}
    │   ├── SideMenu.${fileExtension}
    │   └── PrivateRoute.${fileExtension}
    ├── layouts/
    │   └── Layout.${fileExtension}
    ├── pages/
    │   ├── HomePage.${fileExtension}
    │   ├── AboutPage.${fileExtension}
    │   └── DashboardPage.${fileExtension}
    ├── hooks/
    ├── utils/
    ├── App.${fileExtension}
    └── index.css
  `));

  console.log(chalk.green.bold("\n✨ Setup complete! Your awesome project is ready to go!"));
  console.log(chalk.cyan("\nRun the following commands to start your project:"));
  console.log(chalk.yellow(`\n📂 cd ${projectName}`));
  console.log(chalk.yellow("🚀 npm run dev"));

  console.log(chalk.magenta("\nHappy coding! Remember: " + getRandomJoke()));
  // fs.writeFileSync(useTypeScript ? "src/App.tsx" : "src/App.jsx", appContent);



}

createProject();



