import assert from "assert";
import fs from "fs";
import path from "path";
import convert from ".";

function getFiles(filename: string): { pg: string, dot: string } | undefined {
  if (filename.endsWith(".dot")) {
    return {
      pg : filename.slice(0, filename.length - ".dot".length) + ".json",
      dot: filename
    };
  } else if (filename.endsWith(".json")) {
    return {
      pg : filename,
      dot: filename.slice(0, filename.length - ".json".length) + ".dot",
    };
  } else {
    return undefined;
  }
}

describe("pg-to-dot example files", () => {
  const files = fs.readdirSync(path.join(__dirname, "examples"));

  const knownPg  = new Set<string>();
  const knownDot = new Set<string>();

  for (const file of files) {
    if (file.endsWith(".dot")) {
      knownDot.add(file);
    } else if (file.endsWith(".json")) {
      knownPg.add(file);
    } else if (file === "." || file === "..") {
      // noop
    } else {
      console.error("Unknown file: " + file);
    }
  }

  for (const file of knownDot) {
    if (!knownPg.has(getFiles(file)!.pg)) {
      console.error(`The example dot file ${file} has no corresponding PG.`);
    }
  }

  for (const file of knownPg) {
    it(file, () => {
      const dot = getFiles(file)!.dot;
      assert.ok(knownDot.has(dot), "Should have an expected output file named " + dot);

      const input = fs.readFileSync(path.join(__dirname, "examples", file), "utf-8");
      const inputs: any[] = input.split(/\r?\n/).map(
        line => {
          const line2 = line.trim();
          if (line2 === "") return null;
          return JSON.parse(line2);
        }
      ).filter(data => data !== null);

      const expectedOutput = fs.readFileSync(path.join(__dirname, "examples", dot), "utf-8");
      const actualOutput = convert(inputs);
      assert.strictEqual(actualOutput.replace(/\s+/g, ' '), expectedOutput.replace(/\s+/g, ' '));
    });
  }
});

