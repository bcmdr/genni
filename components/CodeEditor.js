import React, { useEffect } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { langs } from "@uiw/codemirror-extensions-langs";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";

const CodeEditor = ({ code }) => {
  return (
    <CodeMirror
      value={code}
      height="250px"
      theme={vscodeDark}
      basicSetup={{
        autoCompletion: false,
      }}
      extensions={[langs.jsx()]}
    />
  );
};

export default CodeEditor;
