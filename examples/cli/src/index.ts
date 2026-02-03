#!/usr/bin/env node

/**
 * Test consumer for @tloncorp/api from GitHub
 */

// dotenv/config auto-loads .env file on import - must be first
import "dotenv/config";

import {
  configureClient,
  getGroups,
  getContacts,
  getCurrentUserId,
} from "@tloncorp/api";

function parseArgs(): { url: string; ship: string; code: string } {
  const args = process.argv.slice(2);
  let url = process.env.SHIP_URL || "";
  let ship = process.env.SHIP_NAME || "";
  let code = process.env.SHIP_CODE || "";

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case "--url":
      case "-u":
        url = args[++i];
        break;
      case "--ship":
      case "-s":
        ship = args[++i];
        break;
      case "--code":
      case "-c":
        code = args[++i];
        break;
      case "--help":
      case "-h":
        console.log(`
API Test Consumer

Usage:
  npm start -- --url <ship-url> --ship <ship-name> --code <ship-code>

Options:
  -u, --url   Ship URL (e.g., http://localhost:8080)
  -s, --ship  Ship name (e.g., zod)
  -c, --code  Ship access code
  -h, --help  Show this help

Environment:
  Reads from .env file in current directory.
  Variables: SHIP_URL, SHIP_NAME, SHIP_CODE
`);
        process.exit(0);
    }
  }

  return { url, ship, code };
}

async function main() {
  const { url, ship, code } = parseArgs();

  if (!url || !ship) {
    console.error("Error: Missing required arguments (--url and --ship)");
    console.error("Use --help for usage information.");
    process.exit(1);
  }

  console.log("=".repeat(50));
  console.log("@tloncorp/api GitHub Package Test");
  console.log("=".repeat(50));
  console.log(`Ship URL: ${url}`);
  console.log(`Ship: ${ship}`);
  console.log();

  // Configure client
  console.log("Configuring API client...");
  configureClient({
    shipName: ship,
    shipUrl: url,
    verbose: false,
    getCode: code ? async () => code : undefined,
  });

  console.log(`Connected as: ${getCurrentUserId()}`);
  console.log();

  // Test getGroups
  console.log("Testing getGroups()...");
  try {
    const groups = await getGroups();
    console.log(`  ✓ getGroups successful - ${groups.length} groups`);
    groups.slice(0, 3).forEach((g) => {
      console.log(`    - ${g.title || g.id}`);
    });
  } catch (err: any) {
    if (err instanceof Response) {
      console.log(`  ✗ getGroups failed: HTTP ${err.status} ${err.statusText}`);
    } else {
      console.log(`  ✗ getGroups failed: ${err?.message || err}`);
    }
  }

  // Test getContacts
  console.log("Testing getContacts()...");
  try {
    const contacts = await getContacts();
    console.log(`  ✓ getContacts successful - ${contacts.length} contacts`);
  } catch (err: any) {
    if (err instanceof Response) {
      console.log(`  ✗ getContacts failed: HTTP ${err.status} ${err.statusText}`);
    } else {
      console.log(`  ✗ getContacts failed: ${err?.message || err}`);
    }
  }

  console.log();
  console.log("=".repeat(50));
  console.log("Test complete!");
  console.log("=".repeat(50));
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
