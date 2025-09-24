const { parse } = require("@babel/parser");
const { getTextFromJSX } = require("./getTextFromJSX");

// Helper to parse JSX and get the first JSXElement node
function getFirstJSXElement(code) {
  const ast = parse(code, { sourceType: "module", plugins: ["jsx"] });
  let jsxElement = null;
  require("@babel/traverse").default(ast, {
    JSXElement(path) {
      if (!jsxElement) jsxElement = path.node;
    }
  });
  return jsxElement;
}

// Test cases
const tests = [
  {
    code: `<div><p>Hello World</p></div>`,
    expected: "Hello World"
  },
  {
    code: `<button>{"Save"}</button>`,
    expected: "Save"
  },
  {
    code: `<span>{\`Delete\`}</span>`,
    expected: "Delete"
  },
  {
    code: `<div><p>First</p><p>Second</p></div>`,
    expected: "First Second"
  },
  {
    code: `<div><CustomComponent>Custom Text</CustomComponent></div>`,
    expected: "Custom Text"
  },
  {
    code: `<div><p>   Spacing   </p></div>`,
    expected: "Spacing"
  },
  {
    code: `<div><p></p></div>`,
    expected: ""
  },
  {
    code: `<div><p>Hello</p>{'World'}<span>!</span></div>`,
    expected: "Hello World !"
  }
];

// Run tests
tests.forEach(({ code, expected }, idx) => {
  const jsx = getFirstJSXElement(code);
  const result = getTextFromJSX(jsx);
  const pass = result === expected;
  console.log(
    `Test ${idx + 1}: ${pass ? "✅" : "❌"} | Output: "${result}" | Expected: "${expected}"`
  );
});
