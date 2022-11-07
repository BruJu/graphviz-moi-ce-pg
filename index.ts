
export type PGProperties = {[key: string]: string | number | string[] | number[]};

export type Neo4JStyleElement = {
  id: number,
  properties?: PGProperties
} & (Neo4JStyleNode | Neo4JStyleEdge);

export type Neo4JStyleNode = {
  type: "node",
  labels?: string[],
};

export type Neo4JStyleEdge = {
  type: "relationship",
  label: string,
  "start": { id: number },
  "end": { id: number }
};

export default function convert(input: Neo4JStyleElement[]): string {
  const base = 'digraph {\n'
  + '  node [shape="rectangle"]\n';

  let content: string[] = [];

  for (const element of input) {
    if (element.type === "node") {
      content.push(
        "n" + element.id + " " + buildDotLabel(element.labels || [], element.properties || {})
      );
    } else if (element.type === "relationship") {
      content.push(
        "n" + element.start.id + " -> " + "n" + element.end.id
        + " " + buildDotLabel([element.label], element.properties || {})
      );
    }
  }

  return base + content.join("\n") + '\n}';
}


function buildDotLabel(pgLabels: string[], properties: PGProperties): string {
  let propertiesPart: string[] = [];

  if (pgLabels.length !== 0) {
    propertiesPart.push(pgLabels.map(label => ":" + label).join(""));
  }

  for (const [key, value] of Object.entries(properties)) {
    propertiesPart.push(
      key + ": " + pgValueToString(value)
    );
  }

  return '[label="' + propertiesPart.join("\\n") + '"]';
}

function pgValueToString(value: string | number | string[] | number[]): string {
  if (typeof(value) === 'string') {
    return `\\"${value}\\"`;
  } else if (typeof(value) === 'number') {
    return value.toString();
  } else {
    const strValue = value.map(v => typeof(v) === 'string' ? `\\"${v}\\"` : v.toString());
    return "[" + strValue.join(", ") + "]";
  }
}
