#!/usr/bin/env node
import inquirer from "inquirer";
import { execa } from "execa";
import fs from "fs";
import path from "path";

// Helper function to execute shell commands
async function runCommand(command, args, cwd) {
  try {
    await execa(command, args, { stdio: "inherit", cwd });
  } catch (error) {
    console.error(`❌ Error running ${command} ${args.join(" ")}:`, error.message);
    process.exit(1);
  }
}

// Main function to set up the project
async function createProject() {
  console.log("\n🚀 Welcome to Vite React CLI! with sane options");

  // Ask for project name
  const { projectName } = await inquirer.prompt([
    { type: "input", name: "projectName", message: "Enter project name:", default: "my-vite-app" },
  ]);

  const projectPath = path.join(process.cwd(), projectName);

  // Create project with Vite
  console.log(`\n📦 Creating Vite React project: ${projectName}`);
  await runCommand("npm", ["create", "vite@latest", projectName, "--", "--template", "react"]);

  // Move into project folder
  process.chdir(projectPath);

  // Install dependencies
  console.log("\n📥 Installing dependencies...");
  await runCommand("npm", ["install"]);

  // Install React Router DOM by default
  console.log("\n📦 Installing React Router DOM...");
  await runCommand("npm", ["install", "react-router-dom"]);

  // Ask if Tailwind should be installed
  const { installTailwind } = await inquirer.prompt([
    { type: "confirm", name: "installTailwind", message: "Do you want to install Tailwind CSS? If you're a human you should", default: true },
  ]);

  if (installTailwind) {
    console.log("\n🎨 Installing Tailwind CSS...");
    await runCommand("npm", ["install", "tailwindcss", "@tailwindcss/vite"]);

    // Update Tailwind config
    console.log("\n🛠 Configuring Tailwind...");
    fs.appendFileSync("vite.config.js",
      `import { defineConfig } from 'vite'\n
    import tailwindcss from '@tailwindcss/vite'\n
    export default defineConfig({
  plugins: [
    tailwindcss(),
react()
  ],
})` );


    // Update index.css
    console.log("\n🎨 Updating styles...");
    fs.writeFileSync(
      "src/index.css",
      `@import "tailwindcss";
      @tailwind components;
      @tailwind utilities;`
    );


    console.log("\n✅ Tailwind CSS setup complete!");
  } else {
    console.log("\n😱 It’s helpful. If you remove it, you might die—especially in CSS.");
    console.log("\nSad there is no going back now. Go old school and rtfd yourself.");
  }

  // Ask which component library to install
  const { componentLibrary } = await inquirer.prompt([
    {
      type: "list",
      name: "componentLibrary",
      message: "Choose a component library:",
      choices: ["Ant Design 5", "MUI", "None"],
    },
  ]);

  if (componentLibrary === "Ant Design 5") {
    console.log("\n📦 Installing Ant Design...");
    await runCommand("npm", ["install", "antd"]);
  } else if (componentLibrary === "MUI") {
    console.log("\n📦 Installing MUI...");
    await runCommand("npm", ["install", "@mui/material", "@emotion/react", "@emotion/styled"]);
  }

  // Ask if Redux Toolkit should be installed
  const { installRedux } = await inquirer.prompt([
    { type: "confirm", name: "installRedux", message: "Do you want to install Redux Toolkit?", default: true },
  ]);

  if (installRedux) {
    console.log("\n📦 Installing Redux Toolkit...");
    await runCommand("npm", ["install", "@reduxjs/toolkit", "react-redux"]);

    console.log("\n🛠 Setting up Redux...");
    fs.mkdirSync("src/store", { recursive: true });
    fs.writeFileSync(
      "src/store/store.js",
      `import { configureStore } from "@reduxjs/toolkit";
import exampleSlice from "./exampleSlice";

export const store = configureStore({
  reducer: { example: exampleSlice },
});`
    );

    fs.writeFileSync(
      "src/store/exampleSlice.js",
      `import { createSlice } from "@reduxjs/toolkit";

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
export default exampleSlice.reducer;`
    );

    console.log("\n✅ Redux Toolkit setup complete!");
  }

  // Ask for project type to choose between React Query or SWR
  const { projectType } = await inquirer.prompt([
    {
      type: "list",
      name: "projectType",
      message: "What type of project are you building?",
      choices: ["Small", "Large"],
    },
  ]);

  let installDataFetching = false;
  let dataFetchingLibrary = "None";

  if (projectType === "Large") {
    const { useDataFetching } = await inquirer.prompt([
      {
        type: "list",
        name: "useDataFetching",
        message: "Choose a data fetching library:",
        choices: ["React Query", "SWR", "None"],
      },
    ]);

    dataFetchingLibrary = useDataFetching;
    installDataFetching = useDataFetching !== "None";
  }

  // Install React Query or SWR based on user choice
  if (installDataFetching) {
    if (dataFetchingLibrary === "React Query") {
      console.log("\n📦 Installing React Query...");
      await runCommand("npm", ["install", "@tanstack/react-query"]);
      await runCommand("npm", ["install", "-D", "@tanstack/eslint-plugin-query"]);

      console.log("\n🛠 Setting up React Query...");
      fs.mkdirSync("src/hooks", { recursive: true });
      fs.writeFileSync(
        "src/hooks/useFetchData.js",
        `import { useQuery } from "react-query";

export function useFetchData(queryKey, fetchData) {
  return useQuery(queryKey, fetchData);
}`
      );

      console.log("\n✅ React Query setup complete!");
    } else if (dataFetchingLibrary === "SWR") {
      console.log("\n📦 Installing SWR...");
      await runCommand("npm", ["install", "swr"]);

      console.log("\n🛠 Setting up SWR...");
      fs.mkdirSync("src/hooks", { recursive: true });
      fs.writeFileSync(
        "src/hooks/useFetchData.js",
        `import useSWR from "swr";

export function useFetchData(url) {
  const { data, error } = useSWR(url);
  return { data, error };
}`
      );

      console.log("\n✅ SWR setup complete!");
    }
  }

  // Folder structure setup
  console.log("\n🗂 Setting up good folder structure...");
  fs.mkdirSync("src/components", { recursive: true });
  fs.mkdirSync("src/pages", { recursive: true });
  fs.mkdirSync("src/hooks", { recursive: true });
  fs.mkdirSync("src/store", { recursive: true });

  console.log("\n✨ Setup complete! Run the following commands to start your project:");
  console.log(`\n📂 cd ${projectName}`);
  console.log("🚀 npm run dev");
}

createProject();
