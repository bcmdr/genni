import React, { useEffect } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { langs } from "@uiw/codemirror-extensions-langs";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";

const CodeEditor = ({ code, onEditorChange }) => {
  return (
    <CodeMirror
      value={code}
      onChange={onEditorChange}
      height="250px"
      theme={vscodeDark}
      basicSetup={{
        autoCompletion: false,
        foldGutter: true,
      }}
      s
      extensions={[langs.html()]}
    />
  );
};

export default CodeEditor;
